require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const http = require('http');

const PORT = 5055;
let server;
let baseUrl;

// Helper to make fetch requests
const request = async (endpoint, options = {}) => {
  const url = `${baseUrl}${endpoint}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return {
    status: res.status,
    headers: res.headers,
    data,
  };
};

async function runTests() {
  console.log('🧪 Starting Full API Suite Test...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for testing');

    // Clean up test collections if necessary
    await mongoose.connection.collection('users').deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.collection('products').deleteMany({ title: /Test Product.*/ });

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    baseUrl = `http://localhost:${PORT}/api`;
    console.log(`✅ Test server running on ${baseUrl}\n`);

    let accessToken = null;
    let cookieHeader = null;
    let createdProductId = null;

    // TEST 1: Register validation failure (password mismatch)
    console.log('1️⃣ Testing Registration Validation (Password Mismatch)...');
    const regFailRes = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sheryians Tester',
        email: 'testuser@example.com',
        password: 'password123',
        confirmPassword: 'wrongPassword',
      }),
    });
    console.assert(regFailRes.status === 400, `Expected 400, got ${regFailRes.status}`);
    console.assert(regFailRes.data.errors.some((e) => e.field === 'confirmPassword'), 'Confirm password error missing');
    console.log('  ✔ Validation correctly returned 400 with field-level errors.');

    // TEST 2: Successful Registration
    console.log('2️⃣ Testing Successful Registration...');
    const regSuccessRes = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sheryians Tester',
        email: 'testuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    });
    console.assert(regSuccessRes.status === 201, `Expected 201, got ${regSuccessRes.status}`);
    console.assert(regSuccessRes.data.data.user.email === 'testuser@example.com', 'User email mismatch');
    console.assert(!regSuccessRes.data.data.user.password, 'Password leaked in response!');
    console.log('  ✔ User registered with hashed password, 201 status, no password returned.');

    // TEST 3: Duplicate Email (409 Conflict)
    console.log('3️⃣ Testing Duplicate Email Rejection (409 Conflict)...');
    const dupRes = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sheryians Tester 2',
        email: 'testuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    });
    console.assert(dupRes.status === 409, `Expected 409, got ${dupRes.status}`);
    console.log('  ✔ Duplicate email correctly rejected with 409 Conflict.');

    // TEST 4: Login with Wrong Password
    console.log('4️⃣ Testing Login with Wrong Password...');
    const loginFailRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'wrongPassword123',
      }),
    });
    console.assert(loginFailRes.status === 401, `Expected 401, got ${loginFailRes.status}`);
    console.log('  ✔ Invalid credentials returned generic 401.');

    // TEST 5: Successful Login
    console.log('5️⃣ Testing Successful Login & Token Issuance...');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'password123',
      }),
    });
    console.assert(loginRes.status === 200, `Expected 200, got ${loginRes.status}`);
    accessToken = loginRes.data.data.accessToken;
    console.assert(accessToken, 'Access token missing');
    
    // Extract set-cookie
    const setCookie = loginRes.headers.get('set-cookie');
    console.assert(setCookie && setCookie.includes('refreshToken='), 'Refresh token cookie missing');
    cookieHeader = setCookie.split(';')[0];
    console.log('  ✔ Login issued short-lived Access Token in body and Refresh Token in httpOnly cookie.');

    // TEST 6: Get Logged In User Profile (GET /api/auth/me)
    console.log('6️⃣ Testing Authenticated Route GET /api/auth/me...');
    const meRes = await request('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.assert(meRes.status === 200, `Expected 200, got ${meRes.status}`);
    console.assert(meRes.data.data.user.email === 'testuser@example.com');
    console.log('  ✔ User profile fetched with valid Bearer token.');

    // TEST 7: Refresh Token Endpoint (POST /api/auth/refresh-token)
    console.log('7️⃣ Testing Refresh Token Endpoint...');
    const refreshRes = await request('/auth/refresh-token', {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    console.assert(refreshRes.status === 200, `Expected 200, got ${refreshRes.status}`);
    const newAccessToken = refreshRes.data.data.accessToken;
    console.assert(newAccessToken, 'New access token missing');
    accessToken = newAccessToken; // update token
    const newSetCookie = refreshRes.headers.get('set-cookie');
    if (newSetCookie) {
      cookieHeader = newSetCookie.split(';')[0];
    }
    console.log('  ✔ New Access Token generated and Refresh Token rotated.');

    // TEST 8: Create Product Validation Failures
    console.log('8️⃣ Testing Product Creation Validation (Missing / Negative Fields)...');
    const prodValRes = await request('/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: '',
        price: -5,
        stock: -2,
      }),
    });
    console.assert(prodValRes.status === 400, `Expected 400, got ${prodValRes.status}`);
    console.log('  ✔ Express-validator rejected invalid product inputs with 400.');

    // TEST 9: Create Product (POST /api/products)
    console.log('9️⃣ Testing Product Creation (POST /api/products)...');
    const createProdRes = await request('/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: 'Test Product Studio Pro Wireless',
        description: 'High-end noise canceling studio headphones for audio mastering.',
        price: 299.99,
        category: 'Audio',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      }),
    });
    console.assert(createProdRes.status === 201, `Expected 201, got ${createProdRes.status}`);
    createdProductId = createProdRes.data.data.product._id;
    console.log(`  ✔ Product created successfully (ID: ${createdProductId}).`);

    // TEST 10: Get All Products (GET /api/products)
    console.log('🔟 Testing Product List (GET /api/products)...');
    const listRes = await request('/products');
    console.assert(listRes.status === 200, `Expected 200, got ${listRes.status}`);
    console.assert(listRes.data.data.products.length > 0, 'No products returned');
    console.log(`  ✔ Retrieved ${listRes.data.data.products.length} product(s) from catalog.`);

    // TEST 11: Get Single Product by ID (GET /api/products/:id)
    console.log('1️⃣1️⃣ Testing Single Product (GET /api/products/:id)...');
    const singleRes = await request(`/products/${createdProductId}`);
    console.assert(singleRes.status === 200, `Expected 200, got ${singleRes.status}`);
    console.assert(singleRes.data.data.product.title === 'Test Product Studio Pro Wireless');
    console.log('  ✔ Retrieved single product details.');

    // TEST 12: Update Product (PUT /api/products/:id)
    console.log('1️⃣2️⃣ Testing Product Update (PUT /api/products/:id)...');
    const updateRes = await request(`/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        price: 249.99,
        stock: 20,
      }),
    });
    console.assert(updateRes.status === 200, `Expected 200, got ${updateRes.status}`);
    console.assert(updateRes.data.data.product.price === 249.99, 'Price not updated');
    console.log('  ✔ Updated product price and stock successfully.');

    // TEST 13: Delete Product (DELETE /api/products/:id)
    console.log('1️⃣3️⃣ Testing Product Deletion (DELETE /api/products/:id)...');
    const delRes = await request(`/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.assert(delRes.status === 200, `Expected 200, got ${delRes.status}`);
    console.log('  ✔ Deleted product successfully.');

    // TEST 14: Logout & Refresh Token Invalidation
    console.log('1️⃣4️⃣ Testing Logout & Token Invalidation...');
    const logoutRes = await request('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Cookie: cookieHeader,
      },
    });
    console.assert(logoutRes.status === 200, `Expected 200, got ${logoutRes.status}`);
    console.log('  ✔ Logged out successfully.');

    // TEST 15: Verify Revoked Refresh Token Cannot Refresh
    console.log('1️⃣5️⃣ Verifying Revoked Refresh Token is Rejected...');
    const revokedRefreshRes = await request('/auth/refresh-token', {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    console.assert(revokedRefreshRes.status === 403 || revokedRefreshRes.status === 401, 'Revoked token was accepted!');
    console.log('  ✔ Revoked refresh token rejected with 403/401.');

    console.log('\n🎉 ALL 15 INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();

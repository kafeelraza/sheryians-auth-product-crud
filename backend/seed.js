require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');

const sampleProducts = [
  {
    title: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling with two processors and 8 microphones for unprecedented noise reduction and magnificent sound quality.',
    price: 398.00,
    category: 'Audio',
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Apple MacBook Pro 16" M3 Max',
    description: 'Blazing fast M3 Max chip with 14-core CPU and 30-core GPU. Liquid Retina XDR display with up to 22 hours of battery life.',
    price: 2499.00,
    category: 'Electronics',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Nike Air Max 270 React Sneakers',
    description: 'The Nike Air Max 270 React combines Nike’s tallest Air unit yet with soft, springy Nike React foam for cushioning that doesn’t quit.',
    price: 159.99,
    category: 'Footwear',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Minimalist Matte Leather Backpack',
    description: 'Crafted from full-grain water-resistant Italian leather with a padded 15.6" laptop compartment and ergonomic straps.',
    price: 129.50,
    category: 'Accessories',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Logitech MX Master 3S Wireless Mouse',
    description: 'Quiet clicks and 8K DPI any-surface tracking with electromagnetic MagSpeed scrolling for ultimate speed and precision.',
    price: 99.99,
    category: 'Electronics',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'De\'Longhi Espresso & Cappuccino Machine',
    description: 'Authentic 15-bar Italian espresso extraction with integrated manual milk frother for rich, creamy lattes at home.',
    price: 199.95,
    category: 'Home & Kitchen',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=60',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Find or create admin seed user
    let admin = await User.findOne({ email: 'admin@sheryians.com' });
    if (!admin) {
      admin = new User({
        name: 'Sheryians Admin',
        email: 'admin@sheryians.com',
        password: 'adminPassword123',
      });
      await admin.save();
      console.log('✔ Created seed admin user: admin@sheryians.com (pass: adminPassword123)');
    }

    // Insert sample products if table is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const productsWithUser = sampleProducts.map((p) => ({
        ...p,
        createdBy: admin._id,
      }));
      await Product.insertMany(productsWithUser);
      console.log(`✔ Inserted ${sampleProducts.length} sample products!`);
    } else {
      console.log(`ℹ Found ${productCount} existing products, skipping sample insertion.`);
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();

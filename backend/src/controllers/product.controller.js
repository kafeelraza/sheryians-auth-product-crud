const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Authenticated
 */
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, stock, imageUrl } = req.body;

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      imageUrl: imageUrl || undefined,
      createdBy: req.user._id,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      'createdBy',
      'name email'
    );

    return sendSuccess(res, 201, 'Product created successfully.', {
      product: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products (with optional search, category filter, sorting)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 50 } = req.query;

    const filter = {};

    // Search by title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest first
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'title_asc') sortOptions = { title: 1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 200, 'Products retrieved successfully.', {
      products,
      pagination: {
        total: totalProducts,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalProducts / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('createdBy', 'name email');

    if (!product) {
      return sendError(res, 404, `Product with ID '${id}' not found.`);
    }

    return sendSuccess(res, 200, 'Product retrieved successfully.', {
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product by ID
 * @route   PUT /api/products/:id
 * @access  Authenticated
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, stock, imageUrl } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return sendError(res, 404, `Product with ID '${id}' not found.`);
    }

    // Update fields if provided
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate(
      'createdBy',
      'name email'
    );

    return sendSuccess(res, 200, 'Product updated successfully.', {
      product: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 * @access  Authenticated
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return sendError(res, 404, `Product with ID '${id}' not found.`);
    }

    await Product.findByIdAndDelete(id);

    return sendSuccess(res, 200, 'Product deleted successfully.', {
      deletedProductId: id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

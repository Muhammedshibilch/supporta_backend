const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const Block = require('../models/blockModel');

exports.getAllProducts = async (req, res) => {
  try {
    let blockedBy = [];
    
    // Find users who have blocked the current user
    if (req.user) {
      const blocks = await Block.find({ blocked: req.user.id });
      blockedBy = blocks.map(block => block.blocker);
    }
    
    let query = Product.find();
    
    // Filter out products from users who have blocked the current user
    if (blockedBy.length > 0) {
      query = query.where('addedBy').nin(blockedBy);
    }
    
    // Apply filters
    if (req.query.brand) {
      query = query.where('brand').equals(req.query.brand);
    }
    
    if (req.query.category) {
      query = query.where('category').equals(req.query.category);
    }
    
    if (req.query.minPrice) {
      query = query.where('price').gte(Number(req.query.minPrice));
    }
    
    if (req.query.maxPrice) {
      query = query.where('price').lte(Number(req.query.maxPrice));
    }
    
    // Apply sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    query = query.populate('brand', 'brandName categories');
    
    const products = await query;
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand', 'brandName categories')
      .populate('addedBy', 'username');
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    // Check if product owner has blocked the current user
    if (req.user) {
      const isBlocked = await Block.findOne({
        blocker: product.addedBy._id,
        blocked: req.user.id
      });
      
      if (isBlocked) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have access to this product'
        });
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getProductsByBrand = async (req, res) => {
  try {
    let blockedBy = [];
    
    // Find users who have blocked the current user
    if (req.user) {
      const blocks = await Block.find({ blocked: req.user.id });
      blockedBy = blocks.map(block => block.blocker);
    }
    
    let query = Product.find({ brand: req.params.brandId });
    
    // Filter out products from users who have blocked the current user
    if (blockedBy.length > 0) {
      query = query.where('addedBy').nin(blockedBy);
    }
    
    query = query.populate('brand', 'brandName categories');
    
    const products = await query;
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { brandId, category } = req.params;
    
    let blockedBy = [];
    
    // Find users who have blocked the current user
    if (req.user) {
      const blocks = await Block.find({ blocked: req.user.id });
      blockedBy = blocks.map(block => block.blocker);
    }
    
    let query = Product.find({ 
      brand: brandId,
      category
    });
    
    // Filter out products from users who have blocked the current user
    if (blockedBy.length > 0) {
      query = query.where('addedBy').nin(blockedBy);
    }
    
    query = query.populate('brand', 'brandName categories');
    
    const products = await query;
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// The following methods remain mostly the same as they don't need blocking logic
// since they're for CRUD operations by the authenticated user on their own products

exports.createProduct = async (req, res) => {
  try {
    const brand = await Brand.findById(req.body.brand);
    if (!brand) {
      return res.status(400).json({
        status: 'fail',
        message: 'Brand does not exist'
      });
    }
    
    if (!brand.categories.includes(req.body.category)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Category does not exist in the brand\'s categories'
      });
    }
    
    req.body.addedBy = req.user.id;
    
    const newProduct = await Product.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    if (product.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only edit your own products'
      });
    }
    
    if (req.body.brand || req.body.category) {
      const brandId = req.body.brand || product.brand;
      const brand = await Brand.findById(brandId);
      
      if (!brand) {
        return res.status(400).json({
          status: 'fail',
          message: 'Brand does not exist'
        });
      }
      
      const category = req.body.category || product.category;
      if (!brand.categories.includes(category)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Category does not exist in the brand\'s categories'
        });
      }
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('brand', 'brandName categories');
    
    res.status(200).json({
      status: 'success',
      data: {
        product: updatedProduct
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    if (product.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only delete your own products'
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get authenticated user's products - no blocking needed
exports.getMyProducts = async (req, res) => {
  try {
    let query = Product.find({ addedBy: req.user.id });
    
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    if (req.query.brand) {
      query = query.where('brand').equals(req.query.brand);
    }
    
    if (req.query.category) {
      query = query.where('category').equals(req.query.category);
    }
    
    query = query.populate('brand', 'brandName categories');
    
    const products = await query;
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
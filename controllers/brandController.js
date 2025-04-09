const Brand = require('../models/brandModel');

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    
    res.status(200).json({
      status: 'success',
      results: brands.length,
      data: {
        brands
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        status: 'fail',
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        brand
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createBrand = async (req, res) => {
  try {
    if (req.user) {
      req.body.user = req.user.id;
    }
    
    const newBrand = await Brand.create({
      brandName: req.body.brandName,
      brandLogo: req.body.brandLogo,
      categories: req.body.categories || []
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        brand: newBrand
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!brand) {
      return res.status(404).json({
        status: 'fail',
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        brand
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        status: 'fail',
        message: 'Brand not found'
      });
    }
    
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

exports.updateCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an array of categories'
      });
    }
    
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { $set: { categories } },
      { new: true, runValidators: true }
    );
    
    if (!brand) {
      return res.status(404).json({
        status: 'fail',
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        brand
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true
  },
  brandLogo: {
    type: String,
    default: 'default-brand-logo.jpg'
  },
  categories: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
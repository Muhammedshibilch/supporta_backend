const Block = require('../models/blockModel');
const User = require('../models/userModel');

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({
        status: 'fail',
        message: 'User to block not found'
      });
    }
    
    if (userId === req.user.id) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot block yourself'
      });
    }
    
    const existingBlock = await Block.findOne({
      blocker: req.user.id,
      blocked: userId
    });
    
    if (existingBlock) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already blocked this user'
      });
    }
    
    const block = await Block.create({
      blocker: req.user.id,
      blocked: userId
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        block
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await Block.findOneAndDelete({
      blocker: req.user.id,
      blocked: userId
    });
    
    if (!result) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have not blocked this user'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'User unblocked successfully'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    const blocks = await Block.find({ blocker: req.user.id })
      .populate('blocked', 'username email profilePhoto');
    
    res.status(200).json({
      status: 'success',
      results: blocks.length,
      data: {
        blockedUsers: blocks.map(block => block.blocked)
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
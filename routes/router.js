const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const brandController = require('../controllers/brandController');
const productController = require('../controllers/productController');
const blockController = require('../controllers/blockController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

const protectMiddleware = authController.protect;

router.get('/profile', protectMiddleware, userController.getMe);
router.patch('/profile/update', protectMiddleware, userController.updateMe);
router.delete('/profile/delete', protectMiddleware, userController.deleteMe);

router.get('/brands', brandController.getAllBrands);
router.get('/brands/:id', brandController.getBrand);

router.post('/brands', protectMiddleware, brandController.createBrand);
router.patch('/brands/:id', protectMiddleware, brandController.updateBrand);
router.delete('/brands/:id', protectMiddleware, brandController.deleteBrand);
router.patch('/brands/:id/categories', protectMiddleware, brandController.updateCategories);

router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProduct);
router.get('/brands/:brandId/products', productController.getProductsByBrand);
router.get('/brands/:brandId/categories/:category/products', productController.getProductsByCategory);

router.post('/products', protectMiddleware, productController.createProduct);
router.patch('/products/:id', protectMiddleware, productController.updateProduct);
router.delete('/products/:id', protectMiddleware, productController.deleteProduct);
router.get('/my-products', protectMiddleware, productController.getMyProducts);

router.post('/users/:userId/block', protectMiddleware, blockController.blockUser);
router.delete('/users/:userId/unblock', protectMiddleware, blockController.unblockUser);
router.get('/blocked-users', protectMiddleware, blockController.getBlockedUsers);

module.exports = router;
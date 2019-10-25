
const express = require('express');

const router = express.Router();
const adminController = require( '../controllers/admin' );




// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/edit-product => GET
router.get('/edit-product', adminController.getEditProduct);

// /admin/products  list => GET
router.get('/products', adminController.getAdminProducts);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);


exports.routes = router;

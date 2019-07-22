const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

const isAuth = require('../middleware/isAuth');
// isAuth - redirectne pokud neni uzivatel zalogovan
// router metody .get atd spousti funkce v argumentu zleva doprava
// tedt pokud isAuth neredirectne, zavola next() a zavola se dalsi fce v poradi
// napr. adminController.getAddProduct

// validace formularu serverside
const { check, body } = require('express-validator');

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', [
    body('title').trim(),
    body('imageUrl').trim().isURL(),
    body('price').isFloat()
    ], 
    isAuth, adminController.postAddProduct);

/* :productId  je promenna v dynamicky ceste co se predava pak jako params do fce adminController.getEditProduct */
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
    body('title').trim(),
    body('imageUrl').trim().isURL(),
    body('price').isFloat()
    ], 
    isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;

const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

const isAuth = require('../middleware/isAuth');

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

/* :productId  je promenna v dynamicky ceste co se predava pak jako params do fce shopController.getProduct */
router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart',isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/checkout', isAuth, shopController.getCheckout);

// chceme umoznit download faktur z objednavek, ale privatly 
// fakturu si muze stahnout jen prihlaseny uzivatel kteremu patri objednavka
router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;

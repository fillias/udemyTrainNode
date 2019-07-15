const Product = require('../models/product');

/* index page */
exports.getIndex = (req, res, next) => {
    /* render az probehne callback ve fetchAll */
    Product.fetchAll((products) => {
        res.render('shop/index', {
            pageTitle: 'shopik',
            path: '/',
            prods: products
        });
    });
}



/* getCart page */
exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        pageTitle: 'cart',
        path: '/shop/cart'
    });
}

/* getOrders page */
exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'orders',
        path: '/shop/orders'
    });
}


/* getProducts page */
exports.getProducts = (req, res, next) => {
    /* render az probehne callback ve fetchAll */
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            pageTitle: 'product list',
            path: '/shop/product-list',
            prods: products
        });
    });
}

/* getProducts page */
exports.getCheckout = (req, res, next) => {
    /* render az probehne callback ve fetchAll */
    Product.fetchAll((products) => {
        res.render('shop/checkout', {
            pageTitle: 'checkout',
            path: '/shop/checkout',
            prods: products,
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true
        });
    });
}
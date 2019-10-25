const Product = require('../models/product');

/* getAddProduct page */
exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: 'pridej produkt',
        path: '/admin/add-product',
        formsCSS: true,
        productCSS: true,
        activeAddProduct: true
    });

}

/* postAddProduct page */
exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title, req.body.imageUrl, req.body.description, req.body.price);
    product.save();
    res.redirect('/');
}

/* getProducts page */
exports.getAdminProducts = (req, res, next) => {
    /* render az probehne callback ve fetchAll */
    Product.fetchAll((products) => {
        res.render('admin/products', {
            pageTitle: 'admin products',
            path: '/admin/products',
            prods: products
        });
    });
}

/* getEditProduct page */
exports.getEditProduct = (req, res, next) => {
    console.log(req.body);
   // const product = new Product(req.body.title, req.body.imageUrl, req.body.description, req.body.price);
    //product.save();
    //res.redirect('/');
    res.render('admin/edit-product', {
        pageTitle: 'edit produkt',
        path: '/admin/edit-product'
    });
}
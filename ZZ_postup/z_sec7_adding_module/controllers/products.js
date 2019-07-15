/* controllers - ty jsou zodpovedny za komunikaci mezi modules a views (MVC architektura) 
 ** logika patri do controllers */
/* vyexportuju funkci getAddProduct  */

const Product = require('../models/product');

/* getAddProduct page */
exports.getAddProduct = (req, res, next) => {
    res.render('add-product', {
        pageTitle: 'pridej produkt',
        path: '/admin/add-product',
        formsCSS: true,
        productCSS: true,
        activeAddProduct: true
    });

}

/* postAddProduct page */
exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
}


/* getProducts page */
exports.getProducts = (req, res, next) => {
    /* render az probehne callback ve fetchAll */
    Product.fetchAll((products) => {
        res.render('shop', {
            pageTitle: 'shopik',
            path: '/',
            prods: products,
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true
        });
    });
     
}



//exports.products = products;
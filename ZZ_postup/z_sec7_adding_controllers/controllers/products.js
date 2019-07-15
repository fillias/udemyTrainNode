/* controllers - ty jsou zodpovedny za komunikaci mezi modules a views (MVC architektura) 
 ** logika patri do controllers */
/* vyexportuju funkci getAddProduct  */

const products = [];
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
    console.log(req.body);
    products.push({
        title: req.body.title
    });
    res.redirect('/');
}


/* getProducts page */
exports.getProducts = (req, res, next) => {
    res.render('shop', {
        pageTitle: 'shopik',
        path: '/',
        prods: products,
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true
    });
    // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
}



exports.products = products;
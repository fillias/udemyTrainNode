const Product = require('../models/product');

/* getAddProduct page */
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

/* postAddProduct page */
exports.postAddProduct = (req, res, next) => {
    // console.log('postAddProduct req.body:', req.body);
    /* u noveho produktu prvni argument null (to je id) */

    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(null, title, imageUrl, description, price);

    /* z promisy catchnem pripadny error */
    product.save().then( () => {
        res.redirect('/');
    } ).catch(err => console.log('postAddProduct save err', err));
    
};


/* getEditProduct page */
/* req.query vraci query parametry */
exports.getEditProduct = (req, res, next) => {
    /* pokud je v url query ?edit=true tak pokracuji jinak redirect */
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        });
    });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const updatedProduct = new Product(
        prodId,
        updatedTitle,
        updatedImageUrl,
        updatedDesc,
        updatedPrice
    );
    /* sejvni produkt, save se postara o update nebo save noveho podle toho jestli ma productId  */
    updatedProduct.save();
    res.redirect('/admin/products');
};


/* getProducts page */
exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId);
    res.redirect('/admin/products');
};

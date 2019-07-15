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

    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    /* vytvorime novy produkt s id:null a userID usera ktery produkt vytvoril */
    const product = new Product(title, imageUrl, price, description, null, req.user._id);
    //console.log(product);
    product.save()
        .then(result => {
        res.redirect('/admin/products');
    }).catch(err => console.log('admin > postAddProduct err: ', err));

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

    
    Product.findById(prodId).then(product => {
        if (!product) {
            return res.redirect('/');
        }
       // console.log(product);
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        });
    }).catch(err => console.log('FindAll v shop - getEditProduct err:', err));
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    
    /* sejvni produkt, - pokud uz existuje pridej id a v models/product se to updatne  */  
    const product = new Product(updatedTitle, updatedImageUrl, updatedPrice, updatedDesc, prodId );
           
    product.save()
    .then(result => {
       // console.log('product '+ prodId +' updated');
        /* redirect az se sejvne do db aby se to propsalo do admin/products 
        ** error handling poresime pozdeji v lekci
        */
        res.redirect('/admin/products');
    }).catch(err => console.log('admin postEditProduct err:', err));
};


/* getProducts page */
exports.getProducts = (req, res, next) => {

    Product.fetchAll().then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    }).catch(err => console.log('FindAll v Admin - getProducts err:', err));


};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteByID(prodId)
    .then(result => {
        res.redirect('/admin/products');
    }).catch(err => console.log('Admin - postDeleteProduct err:', err));;
    
};
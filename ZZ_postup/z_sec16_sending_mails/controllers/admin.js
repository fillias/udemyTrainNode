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
    /* v mongoose ho namapujem do objektu */
    const product = new Product({
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        /* userId: req.user._id lze pouzit jen jako req.user a monoose si z toho vytahne _id */
        userId: req.user
    });
    //console.log(product);
    /* mongoose pridava na takto definovany objekt save() metodu */
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
    
    /* mongoose - najdem ten produkt podle ID, a muzeme s nim rovnou pracovat */  
    Product.findById(prodId).then(product => {
        /* nalezeny product neni jen normalni js objekt ale cely mongoose object 
        ** a pokud na nem zavolame save() updatne ho s novymi hodnotami
        */
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImageUrl;
        product.description = updatedDesc;

        /* vratime poduct.save() a tak muzeme nize pokracovat s promisou then */
        return product.save();           
    })
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

    Product.find().then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    }).catch(err => console.log('FindAll v Admin - getProducts err:', err));


};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    /* findByIdAndRemove je mongoose metoda 
    useFindAndModify: false pridano do options jinak mongoose hlasil deppreciaton warning
    */
    Product.findByIdAndRemove(prodId, {useFindAndModify: false})
    .then(result => {
        res.redirect('/admin/products');
    }).catch(err => console.log('Admin - postDeleteProduct err:', err));;
    
};
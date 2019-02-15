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

    /* sequelize - Product 
    create - hned to ulozi do db
    id se dela automaticky
    sequelize pracuje s promisema
    */

    Product.create({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description
    }).then(result => {
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

    /* sequelize findbyId method */
    /* nebo lze pouzit findAll({where:{id:prodId}}) -- pozor toto vraci array s vysledky */
    Product.findById(prodId).then(product => {
        if (!product) {
            return res.redirect('/');
        }
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
    const updatedProduct = new Product(
        prodId,
        updatedTitle,
        updatedImageUrl,
        updatedDesc,
        updatedPrice
    );
    /* sejvni produkt, - nejdriv mrkni jestli tam je  */
    Product.findById(prodId).then( product => {
        /* toto jeste nemeni data v databazi */
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImageUrl;
        product.description = updatedDesc;

        /* sequelize metoda save() ulozi ten produkt do db 
        ** pokud v db neexistuje, vytvori novy, pokude existuje updatne ho
        ** vraci promisu, tak abychom mohli chainovat dalsi then() 
        ** a na konci catchnout catch() je treba ho vratit - return 
        ** tedu ne jen  product.save(); ale return product.save();
        */
       return product.save();
    }).then(result => {
        console.log('product '+ prodId +' updated');
        /* redirect az se sejvne do db aby se to propsalo do admin/products 
        ** error handling poresime pozdeji v lekci
        */
        res.redirect('/admin/products');
    }).catch(err => console.log('admin postEditProduct err:', err));
};


/* getProducts page */
exports.getProducts = (req, res, next) => {

    /* sequelize findAll method */
    Product.findAll().then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    }).catch(err => console.log('FindAll v Admin - getProducts err:', err));


};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then(product => {
        /* sequelize destroy smaze zaznam */
        return product.destroy(product);
    }).then(result => {
        res.redirect('/admin/products');
    }).catch(err => console.log('Admin - postDeleteProduct err:', err));;
    
};
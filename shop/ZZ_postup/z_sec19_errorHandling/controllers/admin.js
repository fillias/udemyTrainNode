const Product = require('../models/product');

const { validationResult } = require('express-validator');

/* getAddProduct page */
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        hasError: false,
        errorMessage: null,
        editing: false
    });
};

/* postAddProduct page */
exports.postAddProduct = (req, res, next) => {

    
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // pokud validator najde chybu vyrenderujem edit page
        res.status(422).render('admin/edit-product', {
            pageTitle: 'Add product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            }
        });
        
    }

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
    }).catch(err => {
        // error handling - uzivatelovi muzeme treba vratit info ze se neco pokazilo

        // res.status(500).render('admin/edit-product', {
        //     pageTitle: 'Add product',
        //     path: '/admin/add-product',
        //     editing: false,
        //     hasError: true,
        //     errorMessage: 'database operation failed try again',
        //     product: {
        //         title: title,
        //         imageUrl: imageUrl,
        //         price: price,
        //         description: description
        //     }
        // });

        //pripadne redirectnout
        // res.redirect('/500');


        const error = new Error(err);
        error.httpStatusCode = 500;
        // pokud zavolame next() s error objektem jako argumentem, 
        // express preskoci vsechna middleware a pouzije az error handling middleware
        return next(error);

    });

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
            product: product,
            hasError: false,
            errorMessage: null,
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;


    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // pokud validator najde chybu vyrenderujem edit page
        res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: {
                title: updatedTitle,
                imageUrl: updatedImageUrl,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodId
            }
        });
        
    }
    
    /* mongoose - najdem ten produkt podle ID, a muzeme s nim rovnou pracovat */  
    Product.findById(prodId).then(product => {

        // ochrana zda v POST requestu mame spravne id sparovane s produktem
        // pozor na toString -- porovnavaji se i datove typy
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }

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
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
            
};


/* getProducts page */
exports.getProducts = (req, res, next) => {
    // v Admin sekci chceme ukazat jen ty produkty ktere vytvoril prave prihlaseny user
    // console.log(req.user._id);
    // toto ale nezabrani pripadnym POST utokum kdy nekdo hodi post request napriklad na edit

    Product.find({userId: req.user._id}).then(products => {
       // console.log(products);
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });


};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    /* findByIdAndRemove je mongoose metoda 
    useFindAndModify: false pridano do options jinak mongoose hlasil deppreciaton warning

    deleteOne() -- smaze ale muzu pridat vic parametru
    */
    // Product.findByIdAndRemove(prodId, {useFindAndModify: false})

    // ochrana zda v POST requestu mame spravne id sparovane s produktem
    Product.deleteOne({_id: prodId, userId: req.user._id})
    .then(result => {
        res.redirect('/admin/products');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });;
    
};
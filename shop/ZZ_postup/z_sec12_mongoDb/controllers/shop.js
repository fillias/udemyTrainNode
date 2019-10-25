const Product = require('../models/product');


exports.getProducts = (req, res, next) => {
  
    Product.fetchAll().then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    }).catch(err => console.log('FetchAll v shop - getProducts err:', err));
};


/* getProductDetail page */
/* details s dynamic segmentem (id) 
 ** express to umoznuje pridanim dvojtecky a promenne za cestu - viz routes
 ** (router.get('/products/:productId', ...)
 ** promennou lze pak pouzit, je v req.params[promenna]
 */
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;

    /*  findbyId funkce v models/Product */
    Product.findById(prodId).then(product => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products'
        });
    }).catch(err => console.log('FindById v shop - getProduct err:', err));
    
};


/* index page */
exports.getIndex = (req, res, next) => {
    /* sequelize findAll method */
    Product.fetchAll().then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'homepage',
            path: '/'
        });
    }).catch(err => console.log('FetchAll v shop - getIndex err:', err));
};



/* getCart page */

exports.getCart = (req, res, next) => {

    req.user.getCart()
        .then(products => {
            // cart vrati array of products + quantity:
            /*
            [ { _id: 5ced2da99dd93003e7606745,
                title: 'dfgdfg',
                imageUrl: 'https://cdn.xsd.cz/resize/0a2b582b6123325381a7bf8eb92fb5b9_extract=0,545,645,430_resize=322,215_.jpg?hash=f02087a13caef5018dfa7cbb894dca85',
                price: '8888',
                description: '',
                userId: 5cbf200e6ade5639445dd6c2,
                quantity: 5 },

              { _id: 5ced34a3af28f7051051573f,
                title: 'yyyy',
                imageUrl: 'https://cdn.xsd.cz/resize/0a2b582b6123325381a7bf8eb92fb5b9_extract=0,545,645,430_resize=322,215_.jpg?hash=f02087a13caef5018dfa7cbb894dca85',
                price: '77777',
                description: '',
                userId: 5cbf200e6ade5639445dd6c2,
                quantity: 4 } 
            ]
            */

                res.render('shop/cart', {
                    path: '/cart',
                    pageTitle: 'Your Cart',
                    products: products
                });
        }).catch(err => console.log('GetCart v shop err:', err));

};


/* postCart page */
exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findById(prodId).then(product => {
       // console.log(product);
       // console.log('Product.findById ... product', product);
        return req.user.addToCart(product);
    })
    .then(result => {
       // console.log(result)
       return res.redirect('/cart');
    })
    .catch(err => console.log('shop/ postCart err: ', err)); 
    
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    /* nejdriv get cart od usera */
    req.user.deleteFromCart(prodId)
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => console.log('DeleteCart v shop err:', err));
};

/* chceme orders uchovavat v userovi */
exports.postOrder = (req, res, next) => {
    req.user.addOrder()
        .then(result => {
            res.redirect('./orders');
        })
        .catch(err => console.log('PostOrder v shop err:', err));
};


/* getOrders page */
exports.getOrders = (req, res, next) => {
    
    req.user.getOrders().then(orders => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders', 
            orders: orders
        });
    })
    .catch(err => console.log('GetOrders v shop err:', err));
};


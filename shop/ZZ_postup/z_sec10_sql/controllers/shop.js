const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    /* destructuring = rovnou vezmem z array odpovedi */
    Product.fetchAll().then(([rows, metadata]) => {
        //console.log(rows);
        res.render('shop/product-list', {
            prods: rows,
            pageTitle: 'All Products',
            path: '/products'
        });
    }).catch((err) => console.log('FetchAll v shop - getProducts err:', err));
};


/* getProductDetail page */
/* details s dynamic segmentem (id) 
 ** express to umoznuje pridanim dvojtecky a promenne za cestu - viz routes
 ** (router.get('/products/:productId', ...)
 ** promennou lze pak pouzit, je v req.params[promenna]
 ** fce findById je static v models, prvni arg je id a druhy arg je callback ktery s nim zavola  */
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    /* v then descructuring - prvni polozka v array je ten produkt */
    Product.findById(prodId).then( ([product]) => {
        res.render('shop/product-detail', {
            /* product se vraci jako array */
            //console.log(product);
            product: product[0],
            pageTitle: product.title,
            path: '/products'
        });
    }).catch((err) => console.log('FetchAll v shop - getProduct err:', err));
};


/* index page */
exports.getIndex = (req, res, next) => {

    /* destructuring = rovnou vezmem z array odpovedi */
    Product.fetchAll().then(([rows, metadata]) => {
        //console.log(rows);
        res.render('shop/index', {
            prods: rows,
            pageTitle: 'homepage',
            path: '/'
        });
        //
    }).catch(err => console.log('FetchAll v shop - getIndex err:', err));
};



/* getCart page */
/* cart je ve formatu: {products:[{id:0.8422633300700371, qty:8},{id:0.12411838720031687, qty:1},{id:0.7359865105494563, qty:1}], totalPrice:1731} */
/* products je ve formatu [{"id":"123","title":"kok","imageUrl":"http://URL","description":"","price":"111"},{"id":"456","title":"222","imageUrl":"http://URL","description":"","price":"222"}]  */
/* v cart.ejs se ocekava products a v nich p.productData.id p.productData.title a p.qty 
    products = [ 
        {productData: {
                id: 123,
                title: 'titulek'
                },
        qty: 1
        },
        {productData: {
                id: 456,
                title: 'hhh'
                },
        qty: 2
        },

    ]
*/
exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(
                    prod => prod.id === product.id
                );
                if (cartProductData) {
                    cartProducts.push({
                        productData: product,
                        qty: cartProductData.qty
                    });
                }
            }
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartProducts
            });
        });
    });
};


/* postCart page */
exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, product => {
        Cart.addProduct(prodId, product.price);
    });
    res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, product => {
        Cart.deleteProduct(prodId, product.price);
        res.redirect('/cart');
    });
};

/* getOrders page */
exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders'
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};
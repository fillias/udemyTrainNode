const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const pdfDocument = require('pdfkit');

exports.getProducts = (req, res, next) => {
    /* mongoose find metoda() vraci rovnou vsechna data (ne cursor)
     ** pokud bychom dotazovali hodne dat je treba pouzit cursor:
     ** Product.find().cursor().ea() nam dovoli mezi nimi loopnout 
     ** nebo Product.find().cursor().next() ktery nam da dalsi element
     */
    Product.find().then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};


/* getProductDetail page */
/* details s dynamic segmentem (id) 
 ** express to umoznuje pridanim dvojtecky a promenne za cestu - viz routes
 ** (router.get('/products/:productId', ...)
 ** promennou lze pak pouzit, je v req.params[promenna]
 */
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;

    /*  findbyId funkce co pridava mongoose
     ** muzemem mu dat argument rovnou string (mongoose to sam prelozi na ObjectId)
     */
    Product.findById(prodId).then(product => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products'
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

};


/* index page */
exports.getIndex = (req, res, next) => {
    // console.log('index authenticated? ', req.session.isAuthenticated);

    Product.find().then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'homepage',
            path: '/'
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};



/* getCart page */

exports.getCart = (req, res, next) => {

    req.user
        // get array of all products in the cart plus quantity
        // populate -- Populates document references. - vlozi objekty z referenci - link across collections
        // https://mongoosejs.com/docs/api.html#model_Model.populate
        // https://medium.com/@nicknauert/mongooses-model-populate-b844ae6d1ee7
        .populate('cart.items.productId')
        // populate nevraci promisu, potom musime chain execPopulate() coz vraci promisu
        .execPopulate()
        .then(user => {
            //console.log(user.cart);
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
                products: user.cart.items
            });
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    /* nejdriv get cart od usera */
    req.user.deleteFromCart(prodId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};


exports.postOrder = (req, res, next) => {
    //console.log(req.user.cart.items);
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            // console.log(user.cart.items);
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: user.cart.items.map(item => {
                    //console.log(item);
                    return {
                        // product: item.productId  --- takto to tam neda vsechny key/values toho objektu
                        // ale pouze _id. muzeme pouzit spread na ...item.productId 
                        // to by tam ale narvalo vsechny ty metody apod co mongoose ma, tak pouzit 
                        // mongoose '_doc' ktery vrati jen ty nase data
                        product: {
                            ...item.productId._doc
                        },
                        quantity: item.quantity
                    }
                })
            });
            // console.log(order);
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(result => {
            return res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

    // products: [{
    //     product: {type: Object, required: true},
    //     quantity: {type: Number, required: true}
    //   }],

    // [{
    //     "_id": "5d120066301d8a3f46bbccf2",
    //     "productId": {
    //         "_id": "5d12004d301d8a3f46bbccf1",
    //         "title": "pro test edited",
    //         "imageUrl": "https://cdn.xsd.cz/resize/0a2b582b6123325381a7bf8eb92fb5b9_extract=0,545,645,430_resize=322,215_.jpg?hash=f02087a13caef5018dfa7cbb894dca85",
    //         "price": 777,
    //         "description": "jjj",
    //         "userId": "5d11fb2bca15f63e6b0f3397",
    //         "__v": 0
    //     },
    //     "quantity": 1
    // }]
}

/* getOrders page */
exports.getOrders = (req, res, next) => {
    /* najdi orders pro daneho usera */

    Order.find({
            "user.userId": req.user._id
        }).then(orders => {
            //console.log(orders)
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};


exports.getInvoice = (req, res, next) => {
    // download faktury
    const orderId = req.params.orderId;

    // najdeme v db ten order a checknem jestli patri prave zalogovanemu userovi

    Order.findById( orderId ).then(order => {
             //console.log(order);
            // console.log('---------');
            // console.log(req.user);
            if (!order) {
                next(new Error('no order found'));
            }

            if (order.user.userId.toString() === req.user._id.toString()) {
                const invoiceName = 'invoice-' + orderId + '.pdf';
       
               /*
               ** fs.readFile nacte cely soubor nejprve do pameti a az pote s nim pracuje
               ** tohle muze byt problem u velkych souboru nebo vice requestu
               ** pamet serveru dojde. Je to bad practice, meli bychom file streamovat

                fs.readFile(path.join('faktury', invoiceName), (err, data) => {
                    if (err) { return next(err); }

                    res.setHeader('Content-Type', 'application/pdf');
                    // res.setHeader('Content-Disposition', 'inline'); -- rekne prohlizeci aby to pdf otevrel primo v okne
                    // filename umoznuje nastavit jmeno souboru
                    // attachment to nabidne ulozit
                    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
                    res.send(data);
                });
                */

                /*
                // vytvorime ReadStream - to umoznuje cist soubor steb by step --chunks
                // node ma v pameti vzdy jen jeden chunk
                const file = fs.createReadStream(path.join('faktury', invoiceName));
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

                // pipe() predava data co jsou zapsana v readStream do response
                // response object je "writable stream"
                // readable stream objekty muzeme pouzit pro 'pipe' do writable stream objektu
                // response bude streamed do browseru a bude obsahovat data
                // a tak to bude downloadowat chunk by chunk
                file.pipe(res);
                */

                // vytvoreni pdf primo z dat pomoci pdfKit

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

                const pdfDoc = new pdfDocument();
                // pdfDoc je readable stream -- pipneme ho na writable stream a ulozime ho
                pdfDoc.pipe(fs.createWriteStream(path.join('faktury', invoiceName)));
                //streamneme ho taky do response uzivateli
                pdfDoc.pipe(res);


                // text() prida jeden radek textu do pdf
                pdfDoc.fontSize(26).text('Faktura', {
                     underlined: true
                });
                pdfDoc.text('--------------------------');

                let totalValue = 0;
                //console.log(order);
                order.products.forEach(productObj => {
                    pdfDoc.fontSize(10).text(productObj.product.title + ', cena: ' + productObj.product.price + ', pocet:' + productObj.quantity);
                    totalValue += productObj.product.price * productObj.quantity;
                });

                pdfDoc.text('\n--------------------------');

                pdfDoc.text('celkem: '+ totalValue);

                // end() -- zavolat jakmile jsme s vytvarenim pdf hotovi -- posle to do tech streamu nahore
               pdfDoc.end();

                
            }


        })
        .catch(err => {

            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}
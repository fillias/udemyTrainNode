const Product = require('../models/product');

/* importovat Cart a Order netreba protoze se k nim dostavame 
** pres usera v asociacich sequelize
*/

exports.getProducts = (req, res, next) => {
    //console.log('fsdfs');
    /* sequelize findAll method */
    Product.findAll().then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    }).catch(err => console.log('FindAll v shop - getProducts err:', err));
};


/* getProductDetail page */
/* details s dynamic segmentem (id) 
 ** express to umoznuje pridanim dvojtecky a promenne za cestu - viz routes
 ** (router.get('/products/:productId', ...)
 ** promennou lze pak pouzit, je v req.params[promenna]
 */
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;

    /* sequelize findbyId method */
    /* nebo lze pouzit findAll({where:{id:prodId}}) -- pozor toto vraci array s vysledky */
    Product.findById(prodId).then(product => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products'
        });
    }).catch(err => console.log('FindAll v shop - getProduct err:', err));
    
};


/* index page */
exports.getIndex = (req, res, next) => {
    /* sequelize findAll method */
    Product.findAll().then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'homepage',
            path: '/'
        });
    }).catch(err => console.log('FindAll v shop - getIndex err:', err));
};



/* getCart page */

exports.getCart = (req, res, next) => {
    /* ziskej vypis produktu zalogovaneho uzivatele v jeho Cart */
    // muzeme pouzit metody vytvorene sequelizem
    // sequelize se taky postara o many to many rel. spoji si tu 'mezitabulku'
    // kdyz zavolam cart.getProducts(); 
    req.user.getCart()
        .then( cart => {
            /* tady si muzeme vratit produkty v cart 
            cart je asociated s products v db, proto mame tu getProducts metodu
            */
        //    console.log('==== v getCart() =======================');
        //    console.log(cart);
            return cart.getProducts(); 
        })
        .then(products => {
            /* v products jsou jak data za produkt table tak i za cartItem tablex */
          // console.log('==== v getCart() =======================');
          // console.log(products);
        //   console.log('==================================');
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

    let fetchedCart; // nalezeny cart je treba ulozit abychom ho mohli pouzit v jinem scope
    let newQuantity = 1; 

    req.user.getCart().then(cart => {
        fetchedCart = cart;
        /* pokud uz je v cart ten produkt tak zvys quantity 
        ** pokud ne, pridej ho s quantity 1
        */
       console.log('==============', cart);
      return cart.getProducts( { where: {id: prodId} } );
    }).then (products => {
        /* zde products v cart table */
        /* products je array ale bude v ni jen jeden produkt (pokud ho najde), nebo zadny */


        //   console.log('==== v postCart() =======================');
        //   console.log(JSON.parse(JSON.stringify(products)));
        //   console.log('==================================');

        let product;
        if (products.length > 0) {
            product = products[0];
        }
        

        /* pokud ten produkt najdu, dostan old quantity a zmen ji */
        if (product) {
            /* zjisti old quantity */
            /* sequelize nam da rovnou pristup k cartItem u tohoto produktu */
            /*  product je napr.:
            [ { id: 2,
                title: '222',
                price: 345,
                imageUrl: 'https://cdn.xsd.cz/resize/0a2b582b6123325381a7bf8eb92fb5b9_extract=0,545,645,430_resize=322,215_.jpg?hash=f02087a13caef5018dfa7cbb894dca85',
                description: '555',
                createdAt: '2019-03-26T09:23:56.000Z',
                updatedAt: '2019-03-26T09:23:56.000Z',
                userId: 1,
                cartItem: 
                { id: 2,
                quantity: 1,
                createdAt: '2019-03-27T15:22:44.000Z',
                updatedAt: '2019-03-27T15:22:44.000Z',
                cartId: 1,
                productId: 2 } } 
            ]
            */
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            
            return product;

        } 

        /* pokud nenajdu produkt - neni v cart, najdi ho podle ID v Product table */
        return Product.findById(prodId);
    

    })
    .then( product => {
                 /* 
            /* fetchedCart.addProduct addProduct je metoda pridana sequelize diky many to many association
            ** produkt takto pridavame do te "in-between" table cart-item            
            **  a pomoci { through: {quantity: newQuantity} } reknu sequelize
            ** ze je treba pridat i novou informaci do "quantity" v inbetween table
            ** -- pokud v te in-between-table jako je cart-item je i nejaky jiny sloupec nez 
            ** ty dve matching IDs propojujici many to many tabulky (v tomhle pripade "quantity")
            ** tak takto muzeme toto zapsat
            */

            /* pokud uz existuje, sequelize udela UPDATE v tabulce */

        return fetchedCart.addProduct(product, { through: {quantity: newQuantity} } );
    })
    .then( () => {
        return res.redirect('/cart');
    } )
    .catch(err => console.log('PostCart v shop err:', err));

    // Product.findById(prodId, product => {
    //     Cart.addProduct(prodId, product.price);
    // });
    
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    /* nejdriv get cart od usera */
    req.user.getCart().then(cart => {
        /* pak najdi produkt podle product ID */
        return cart.getProducts( { where: {id: prodId} } );
    }).then(products => {
        /* products vraci array kde prvni polozka je ten produkt */
        /*  a ten chceme destroy, ale ne v product table ale v in-between table cart-item
            ktera propojuje cart a product
        */
        return products[0].cartItem.destroy();
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => console.log('DeleteCart v shop err:', err));
};


exports.postOrder = (req, res, next) => {
    let fetchedCart;
    /* vezmi vsechny polozky v cart a presun je do order, vymaz cart */
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
          
    }).then(products => {
        // console.log('==== v postOrder() =======================');
        //   console.log(JSON.parse(JSON.stringify(products)));
        //   console.log('==================================');

        /* vytvorime novy Order ale potrebujem k nemu asiocivat ty produkty */
        return req.user.createOrder().then(order => {
            /* to lze takto, a jeste pridame quantity pres through */
            
            /* jen takto to nelze, potrebujeme znat quantity per produkt */
            /* order.addProducts(products, {through: quantity // ale jaka je quantity }) */

            return order.addProducts( products.map(product => {
                /* iterujeme pres vsechny produkty a vratime do addProducts novou upravenou array */
                /* v product objektu muzeme podivat do tech inbetween table dle asociaci */
                /* a nastavime product.orderItem.quantity hodnotu z product.cartItem.quantity */
                product.orderItem = {quantity: product.cartItem.quantity};
                return product;
            }));

            
        }).catch(err => console.log('PostOrder / CreateOrder v shop err:', err));
    }).then(result => {
            /* pomoci setProducts smazeme obsah cart */
            fetchedCart.setProducts(null);
            
    }).then(result => {
        res.redirect('./orders');
    })
    .catch(err => console.log('PostOrder v shop err:', err));

    // res.render('shop/orders', {
    //     path: '/orders',
    //     pageTitle: 'Your Orders'
    // });
};


/* getOrders page */
exports.getOrders = (req, res, next) => {
    /* samotny getOrders nam nevrati orderItems.quantity 
    ** pokud chceme fetch related products to Order, musime pouzit include a jako jeho hodnotu dame array
    ** include: ['products'] 
    ** proc products? protoze v asociacich jsme pouzili Order.belongsToMany(Product, {through: OrderItem});
    ** a produkt model se jmenuje 'product'
    ** const Product = sequelize.define('product', ...
    ** sequelize z toho dela mnozne cislo
    ** pak muzeme pouzit koncelt zvany "eager loading" kterym v podstate rikame:
    ** kdyz fetchujes orders, fetchni taky related products
    ** a dej mi jednu array of orders, ktera take obsahuje products per order
    ** funguje to samozrejme jen proto ze mame relation mezi orders a products
    ** Kazdy order tedy bude mit products array
    ** a v products array je orderItem s quantity
    */
    req.user.getOrders( { include: ['products'] } ).then(orders => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders', 
            orders: orders
        });
    })
    .catch(err => console.log('GetOrders v shop err:', err));
};


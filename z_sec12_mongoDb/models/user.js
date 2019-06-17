const mongoConnect = require('../util/database');
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;
/* zde importujem neco co nam dava pristup do db */
const getDb = require('../util/database').getDb;

/* cart udelame zde */
/* pro kazdeho usera chceme ulozit cart -- mame 1to1 relation mezi user a cart
 ** cart bude obsahovat products -- 1 to many
 ** vyuzijeme "embedded documents" v mongoDb - 
 ** https://docs.mongodb.com/manual/tutorial/model-embedded-one-to-many-relationships-between-documents/
 */


class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart; // {items:[]}
    //  console.log('v constructoru id', id);
    this._id = id;
    //  console.log('v constructoru this._id', this._id);
  }

  /* 
  user vypada takto:
  {
      username: 'filip',
      email: 'test@tt.com',
      cart: { items: [ [Object], [Object] ] },
      _id: 5cbf200e6ade5639445dd6c2 
  }
  */


  save() {
    const db = getDb();
    return db.collection('users')
      .insertOne(this)
      .then(result => {
        // console.log(result);
      })
      .catch(err => console.log('user/save err: ', err));
  }

  addToCart(product) {
    // console.log('addToCart this._id', this._id);

    // v user cart chceme ulozit jen reference na produkt, ne celu produkt, tedy product._id
    // toto ulozi natvrdo - jen pro predstavu
    // const updatedCart = { items: [{ productId: new ObjectId(product._id), quantity: 1 }] };

    const cartProductIndex = this.cart.items.findIndex(item => {
      // toString() je treba kvuli === porovnani
      // jsou to objecty i kdyz je muzem pouzit jako stringy (BSON)
      //  console.log('item.productId', typeof(item.productId));
      //  console.log('product._id', typeof(product._id));

      return item.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;

    // nechceme porad overwrite items s novou array, ale jen pridat novy object do array
    // pokud tam ten produkt jeste neni, pokud je, jen zmenit quantity
    // vytvorime updatedCartItems zkopirovanim vsech items z cart
    const updatedCartItems = [...this.cart.items];

    // pokud je cartProductIndex cokoliv jineho nez  -1 tak uz existuje 
    if (cartProductIndex >= 0) {
      // updatneme quantity
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      // pushneme novy produkt 
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity
      });
    }

    const updatedCart = {
      items: updatedCartItems
    };

    // console.log('updatedCart', updatedCart);
    //console.log(updatedCart);
    /* updatneme zaznam v db */
    const db = getDb();
    /* $set: {cart: updatedCart} - popisujeme jak provest update   
     ** keep as it is krome cart - cart se prepise novymi hodnotami
     */
    return db
      .collection('users')
      .updateOne({
        _id: new ObjectId(this._id)
      }, {
        $set: {
          cart: updatedCart
        }
      });

  }

  /*
  cart vypada takto:
    { items: 
          [ { productId: 5ced2da99dd93003e7606745, quantity: 4 },
            { productId: 5ced34a3af28f7051051573f, quantity: 4 } 
          ] 
      }

  */

  deleteFromCart(prodId) {

    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() != prodId.toString();
    })


    // const cartProductIndex = this.cart.items.findIndex(item => {
    //   return item.productId.toString() === prodId.toString();
    // });
    // console.log(cartProductIndex);
    // console.log('-------------------');
    // console.log(this.cart.items);

    // this.cart.items.splice(cartProductIndex, 1);

    // console.log('-------------------');
    // console.log(this.cart.items);
    const db = getDb();
    return db
      .collection('users')
      .updateOne({
        _id: new ObjectId(this._id)
      }, {
        $set: {
          cart: {
            items: updatedCartItems
          }
        }
      });

  }

  getCart() {
    // getCart se zavola v shop.js a chceme vratit plne populated cart
    // tedy ne jen jako return this.cart

    /* pro produkty si sahnem do DB */
    const db = getDb();
    /* najdem produkty podle id pomoci mongodb api query $in
    $in ocekava array - vytvorime array IDcek co chceme
    */
    const productIds = this.cart.items.map(item => {
      return item.productId;
    });

    /* vratime nalezene produkty */
    return db.collection('products')
      .find({
        _id: {
          $in: productIds
        }
      })
      // hned je prevedem na Array
      .toArray()
      .then(products => {
        // console.log(products);
        // vratime novou array kam pridame vsechny props + quantity
        return products.map(product => {
          //  console.log('-------------');
          // console.log(product);

          // najdem quantity podle id
          const qt = this.cart.items.find(item => {
            // tohle vrati nalezeny object
            return item.productId.toString() == product._id.toString();
            // a na tom objectu vratime jeho quantity
          }).quantity;

          // console.log('qt: ', qt);

          return {
            ...product,
            quantity: qt
          }
        })
      });
  }

  /* chceme orders uchovavat v userovi */
  /* pro orders pouzijeme novou collection, muzou byt velmi velke (order history) */
  addOrder() {

    /* order musi mit user _id, a veci v cart */
    const db = getDb();

    return this.getCart().then(products => {

      const order = {
        items: products,
        user: {
          _id: new ObjectId(this._id),
          name: this.username,
        }
      };
     
      /* vytvorime v orders novy zaznam - cart  */
      return db.collection('orders').insertOne(order)
    })
    .then(result => {
      /* vysypeme cart zde v js */
      this.cart = {items: []};

      /* vymazeme cart v db pro daneho usera */
      return db
        .collection('users')
        .updateOne(
          {_id: new ObjectId(this._id)}, 
          { $set: { cart: {items: []} } });
    });

  }

  getOrders() {
    const db = getDb();
    //console.log(this._id);
    return db.collection('orders')
    /* v mongodb muzeme hledat na nested data kdyz cestu dame do uvozovek */
    /* tohle mi vrati vsechny orders pro daneho user._id */
      .find({'user._id' : new ObjectId(this._id)})
      .toArray();
  }

  static findByID(userID) {
    const db = getDb();
    return db.collection('users')
      .find({
        _id: new ObjectId(userID)
      }).next()
      .then(user => {
        //console.log(user);
        return user;
      })
      .catch(err => console.log('user/ findByID err: ', err));
  }
}

module.exports = User;
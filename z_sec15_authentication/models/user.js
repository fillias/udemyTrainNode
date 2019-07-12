const mongoose = require('mongoose');

const Product = require('../models/product');
const Order = require('../models/order');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  /* zadefinujeme klice a jejich datove typy */
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    /* to jak ma vypadat cart muzeme definovat rovnou tady 
     ** pro typ productId muzeme pouzit metody mongoose
     */
    items: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }]
  }
});



userSchema.methods.addToCart = function (product) {
  //  mongoose 'methods' metoda umoznuje pridavat custom metody
  // je treba syntaxe takto aby this byla reference na userSchema
  // pak to lze venku volat primo na user, tedty user.addToCart()

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
        //  mongoose udela automaticky new ObjectId(product._id) z product_id 
        productId: product._id,
        quantity: newQuantity
      });
    }

    const updatedCart = {
      items: updatedCartItems
    };

    // v mongoose staci pro update v db pouzit save() na to userSchema
    this.cart = updatedCart;
    return this.save();

}


userSchema.methods.deleteFromCart = function (prodId) {

      const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() != prodId.toString();
    });

    this.cart.items = updatedCartItems;

    return this.save();
}

userSchema.methods.clearCart = function() {
  this.cart = {items: []};
  return this.save();
}



 
  // mongoose "model()" je neco co mongoose propoji dane "schema" s nejakym jmenem ktere urcime

  // jakmile se zavola na tom objektu save() tak se v databazi 
  // vytvori collection se jmenem 'users' 
  // -- mongoose tomu da maly pismeno na zacatku a mnozne cislo


module.exports = mongoose.model('User', userSchema);





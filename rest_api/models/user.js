const mongoose = require('mongoose');

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
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    // kazdy nove zalozeny user bude startovat s timhle statusem
    default: 'I am new'
  },
  posts: [{
      // posts je array
      // a kazdy object v array je type: Schema.Types.ObjectId s ref: 'Post'
      // je to reference to Post model v db
      type: Schema.Types.ObjectId,
      ref: 'Post'
  }]

});



// mongoose "model()" je neco co mongoose propoji dane "schema" s nejakym jmenem ktere urcime

// jakmile se zavola na tom objektu save() tak se v databazi 
// vytvori collection se jmenem 'posts' 
// -- mongoose tomu da maly pismeno na zacatku a mnozne cislo


module.exports = mongoose.model('User', userSchema);
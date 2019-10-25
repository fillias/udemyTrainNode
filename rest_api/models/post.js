const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const postSchema = new Schema({
  /* zadefinujeme klice a jejich datove typy */
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  creator: {
    name: {
      type: String,
      required: true
    }
  }

}, {
  /* pri vytvareni Schema muzeme pridat nejaky options jako druhy argument */
  /* timestamps -- mongoose vytvori timestamp kdykoliv je nova verze pridana do db */
  timestamps: true
});



// mongoose "model()" je neco co mongoose propoji dane "schema" s nejakym jmenem ktere urcime

// jakmile se zavola na tom objektu save() tak se v databazi 
// vytvori collection se jmenem 'Posts' 
// -- mongoose tomu da maly pismeno na zacatku a mnozne cislo


module.exports = mongoose.model('Post', postSchema);
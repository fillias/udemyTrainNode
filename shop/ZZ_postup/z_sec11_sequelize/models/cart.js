const Sequelize = require('sequelize');
const sequelize = require('../util/database');

/* v sequelize nejdriv definujeme model tabulky
** docka je sequelize.com
  
Je to Many to many relationship
zde definujeme jen table cart

*/
const Cart = sequelize.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        alowNull: false,
        primaryKey: true
    }
});

module.exports = Cart;
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

/* v sequelize nejdriv definujeme model tabulky
** docka je sequelize.com
  
Je to Many to many relationship
propojovaci tabulka mezi cart a product

*/
const CartItem = sequelize.define('cartItem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        alowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
});

module.exports = CartItem;
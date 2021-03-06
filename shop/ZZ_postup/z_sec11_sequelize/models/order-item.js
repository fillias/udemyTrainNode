const Sequelize = require('sequelize');
const sequelize = require('../util/database');

/* propojovaci tabulka mezi order a products
*/
const OrderItem = sequelize.define('orderItem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        alowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
});

module.exports = OrderItem;
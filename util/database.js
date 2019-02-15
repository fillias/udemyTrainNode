/* sequelize - resi toto misto mysql2 - nize (mysql2 ale sequelize vyzaduje) */



const Sequelize = require('sequelize');
/* sequelize vytvori connection pool */

const sequelize = new Sequelize('node_train', 'root', 'akai', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;





/* pro spojeni s mysql db pouzijem npm package mysql2 */
/* v mysql pouzvame pro sql gui mysql-workbench */

// const mysql = require('mysql2');

/* dve moznosti jak se spojovat s mysql, jedna je pokazde na kazdy dotaz se spojit s mysql a pak zas odpojit - neefektivni  */

/* lepsi je pouzit tzv connection pool */
/* predame mu parametry
 ** host je localhost v tomhle pripade
 ** database = schema v mysql
 */
// const pool = mysql.createPool({
//     host: 'localhost', 
//     user: 'root',
//     database: 'node_train',
//     password: 'akai'
// });

/* pool exportnem jako promisu */

//module.exports = pool.promise();
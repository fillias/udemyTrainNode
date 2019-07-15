/* templating engines 
 ** pouzivaji se k vytvareni dynamickeho html obsahu, v zasade se pouzivaji tri:
 ** 'EJS',  <p><%= name %></p>    Use normal HTML and plain javascript in templates
 ** 'Pug (Jade)'   p #{name}    Use minimal HTML and custom template language
 ** 'Handlebars'   <p>{{ name }}</p>   Use normal HTML and custom template language
 */

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

/* zde definuju globalni setting pro express pro pouziti template engine
 ** viz https://expressjs.com/en/4x/api.html#app.set
 ** view engine : The default engine extension
 ** views : A directory or an array of directories for the application's views. If an array, the views are looked up in the order they occur in the array.
 */

/* rikam expressu ze chci kompilovat dynamic templates pomoci 'ejs' engine, ejs podporuje express primo */
app.set('view engine', 'ejs');
/* a tady mu nastavuju kde ty templaty najde */
app.set('views', 'views');

/* importuju vic veci, udelam z toho objekt 'adminData' */
const adminRoutes = require('./routes/admin');

const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error' );

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

/* adminData ma ted importovanou metodu (objekt) .routes */
app.use('/admin', adminRoutes.routes);

app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);

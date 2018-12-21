const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const path = require('path');

const app = express();


app.use(bodyParser.urlencoded( {extended: false} ));

/* staticky servirovane fajly jako css - ne handlovany express routerem, ale primo volane z file systemu 
** pouzijem middleware express.static(), kteremu jako argument dame cestu do folderu ze ktereho muze read only servirovat
** express vezme jakykoliv request co se snazi najit nejaky file a nasmeruje ho do public folderu
*/
app.use(express.static( path.join(__dirname, 'public') ) );

app.use('/admin', adminRoutes);
app.use(shopRoutes);




app.use( (req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
})

app.listen(3000);

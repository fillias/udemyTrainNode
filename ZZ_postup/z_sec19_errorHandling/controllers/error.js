/* get 404 page */
exports.get404 = (req, res, next) => {
    /* misto sendFile pouzijem template ejs, pomoci build in metody expressu .render rovnou z folderu nastavenem ve views app.set('views', 'views');
     ** a pouzije ten nastaveny view engine ejs  */
    /* .render Returns the rendered HTML of a view via the callback function 
     **  It accepts an optional parameter that is an object containing local variables for the view. */
    /* promenna pageTitle je predana primo tomu fajlu v prvnim argumentu render metody */
    res.status(404).render('404', {
        pageTitle: 'Page not found',
        path: undefined,
        loggedIn: true,
        isAuthenticated : req.session.isAuthenticated
    });
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
}


exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        pageTitle: '500 error',
        path: '/500',
        loggedIn: true,
        isAuthenticated : req.session.isAuthenticated
    });
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
}
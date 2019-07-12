// custom middleware


// isAuth pro route protection

module.exports = (req, res, next) => {
    /* pokud neni session tak redirectni na login */
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    next();
}
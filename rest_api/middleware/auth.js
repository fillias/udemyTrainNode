const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    /* vycucnem token z hlavicky 
    
    "Bearer " je konvence
    na FE je to
    headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    
    */

    const authHeader = req.get('Authorization');
    
    if (!authHeader) {

        req.isAuth = false;
        return next();
        
    }

    const token = authHeader.split(' ')[1];

    /* zkusime dekodovat token, muze to failnout */
    let decodedToken;
    try {
        /* jwt.verify dekoduje a checkne token oproti tomu 'secret' stringu setnutemu v auth.js controlleru */
        decodedToken = jwt.verify(token, 'necoDesneTajnyho');
    } catch (err) {
        /* decoded token muze selhat */
        req.isAuth = false;
        return next();
    }

    if (!decodedToken) {
        /* technicky to nefailnulo, ale jwt verify neklaplo - spatny token */
        req.isAuth = false;
        return next();
    }

    /* token decoded and authenticated 
    muzeme z neho vytahnout dekodovane informace ktere jsme do nej ulozili pri loginu, potrebujem userId
    */
    req.userId = decodedToken.userId;
    req.isAuth = true;
    next();

}
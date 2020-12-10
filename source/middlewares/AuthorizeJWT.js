/**
 * @typedef UserAuthError
 * @property {string} reason    - User-friendly reason message 
 */

const AuthorizeJWT = (req, res, next) => {
    // TODO Check user authorization & return user ID at req.body.userID
    next();
}

module.exports = AuthorizeJWT;

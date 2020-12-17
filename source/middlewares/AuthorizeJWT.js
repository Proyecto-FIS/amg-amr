const axios = require("axios");

/**
 * @typedef UserAuthError
 * @property {string} reason    - User-friendly reason message 
 */

const AuthorizeJWT = (req, res, next) => {
    const token = req.body.userToken;
    axios.get(`${process.env.USERS_MS}/auth/${token}`)
    .then(response => {
        req.body.userID = response.data.account_id;
        next();
    })
    .catch(err => {
        if(err.response.status === 500) {
            res.status(401).json({ reason: "Authentication failed" });
        } else {
            res.status(500).json({ reason: "Users service temporarily unavailable" });
        }
    });
}

module.exports = AuthorizeJWT;

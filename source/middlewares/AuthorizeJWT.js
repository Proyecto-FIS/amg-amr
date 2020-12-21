const axios = require("axios");
const mongoose = require("mongoose");

/**
 * @typedef UserAuthError
 * @property {string} reason    - User-friendly reason message 
 */

const AuthorizeJWT = (req, res, next) => {
    const token = req.body.userToken || req.query.userToken;

    axios.get(`${process.env.USERS_MS}/auth/${token}`)
    .then(response => {
        const userID = mongoose.Types.ObjectId(response.data.account_id);
        if(req.body.userToken) {
            req.body.userID = userID;
        } else {
            req.query.userID = userID;
        }
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

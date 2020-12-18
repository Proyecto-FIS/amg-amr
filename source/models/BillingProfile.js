const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef BillingProfile
 * @property {integer} id       - Identifier
 * @property {string} address   - Address
 * @property {string} city      - City
 * @property {string} country   - Country
 * @property {integer} zipCode  - Zip code
 */

const BillingProfileSchema = new Schema({
    userID: Schema.ObjectId,
    name: String,
    surname: String,
    address: String,
    city: String,
    province: String,
    zipCode: Number
});

module.exports = mongoose.model("BillingProfile", BillingProfileSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BillingProfileSchema = new Schema({
    // TODO
});

module.exports = mongoose.model("BillingProfile", BillingProfileSchema);

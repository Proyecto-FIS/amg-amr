const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BillingProfileSchema = new Schema({
    userID: Schema.ObjectId,
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100,
    },
    surname: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    address: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 150
    },
    city: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    province: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    country: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    zipCode: {
        type: Number,
        required: true,
        validate: {
            validator: v => Number.isInteger(v) && /^([0-9]{5}$)/.test(v)
        }
    },
    phoneNumber: {
        type: Number,
        required: true,
        validate: /^([0-9]{1,15}$)/
    },
    email: {
        type: String,
        required: true,
        validate: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    }
});

module.exports = mongoose.model("BillingProfile", BillingProfileSchema);

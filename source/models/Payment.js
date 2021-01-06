const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    _id: Schema.ObjectId,
    quantity: {
        type: Number,
        min: 1,
        required: true,
        validate: {
            validator: Number.isInteger
        }
    },
    unitPriceEuros: {
        type: Number,
        min: 0,
        required: true
    }
});

const PaymentSchema = new Schema({
    userID: Schema.ObjectId,
    timestamp: {
        type: Date,
        default: Date.now
    },
    products: {
        type: [ProductSchema],
        required: true
    },
    paypal_subscription_id: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
        //validate: /^([0-9]{1,15}$)/
    }
});

module.exports = mongoose.model("Payment", PaymentSchema);

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

const SubscriptionSchema = new Schema({
    userID: Schema.ObjectId,
    timestamp: {
        type: Date,
        default: Date.now
    },
    products: {
        type: [ProductSchema],
        required: true
    },
    is_active: {
        type: Boolean,
        required: true,
        default: true
    },
    transaction_subscription_id: {
        type: String,
        required: [true, "Transaction subscription id required"]
    },
    price: {
        type: Number,
        required: [true, "Price required"]
        //validate: /^([0-9]{1,15}$)/
    },
    billing_profile_id: {
        type: Schema.Types.ObjectId,
        required: [true, "Billing profile id required"]
    }
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);

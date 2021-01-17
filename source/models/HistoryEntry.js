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

const HistoryEntrySchema = new Schema({
    userID: Schema.ObjectId,
    timestamp: {
        type: Date,
        default: Date.now
    },
    operationType: {
        type: String,
        enum: ["payment", "subscription"],
        required: true
    },
    products: {
        type: [ProductSchema],
        required: true
    },
    transaction_id: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("HistoryEntry", HistoryEntrySchema);

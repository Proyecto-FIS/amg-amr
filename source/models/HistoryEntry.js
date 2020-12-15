const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    _id: Schema.ObjectId,
    quantity: Number,
    unitPriceEuros: Number
});

const HistoryEntrySchema = new Schema({
    userID: Schema.ObjectId,
    timestamp: {
        type: Date,
        default: Date.now
    },
    operationType: String,       // "payment" or "subscription"
    products: [ProductSchema],
});

module.exports = mongoose.model("HistoryEntry", HistoryEntrySchema);

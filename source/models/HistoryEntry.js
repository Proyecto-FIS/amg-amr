const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    _id: Schema.ObjectId,
    quantity: {
        type: Number,
        min: 1,
        validate: {
            validator: Number.isInteger
        }
    },
    unitPriceEuros: {
        type: Number,
        min: 0
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
        enum: ["payment", "subscription"]
    },
    products: {
        type: [ProductSchema],
        required: true
    }
});

module.exports = mongoose.model("HistoryEntry", HistoryEntrySchema);

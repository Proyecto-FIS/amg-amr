const express = require("express");
const AuthorizeJWT = require("../middlewares/AuthorizeJWT");
const HistoryEntry = require("../models/HistoryEntry");
const Validators = require("../middlewares/Validators");

/**
 * @typedef Product
 * @property {string} _id               - Product identifier
 * @property {number} quantity          - Number of products of this type
 * @property {number} unitPriceEuros    - Price per unit, in euros
 */

/**
 * @typedef HistoryEntry
 * @property {string} _id               - Unique identifier for this entry
 * @property {string} timestamp         - Date & time when the operation ocurred
 * @property {string} operationType     - "payment" or "subscription"
 * @property {Array.<Product>} products - Products which have been bought
 */

/**
 * @typedef HistoryError
 * @property {string} reason.required - Brief description of the error
 */

class HistoryController {

    /**
     * Get a purchase history entry
     * @route GET /history
     * @group history - Purchases history per user
     * @param {string}  userToken.body.required         - User JWT token
     * @param {string}  beforeTimestamp.body.required   - Search before this timestamp happens
     * @param {integer} pageSize.body.required          - Page size
     * @returns {Array.<HistoryEntry>}  200 - Returns the requested entries
     * @returns {ValidationError}       400 - Supplied parameters are invalid
     * @returns {UserAuthError}         401 - User is not authorized to perform this operation
     * @returns {HistoryError}          500 - Database error
     */
    getMethod(req, res) {
        HistoryEntry.find({
            userID: req.body.userID,
            timestamp: { $lte: req.body.beforeTimestamp }
        })
        .select("timestamp operationType products")
        .limit(req.pageSize)
        .sort("-timestamp")
        .lean()
        .exec((err, entries) => {
            if(err) {
                res.status(500).json({ reason: "Database error" });
            } else {
                res.status(200).json(entries);
            }
        });
    }

    createEntry(entry) {
        const historyEntry = new HistoryEntry(entry);
        return historyEntry.save();
    }

    constructor(apiPrefix, router) {
        const beforeTimestampValidators = [Validators.Required("beforeTimestamp"), Validators.ToDate("beforeTimestamp")];
        const pageSizeValidators = [Validators.Required("pageSize"), Validators.Range("pageSize", 1, 20)];
        router.get(apiPrefix + "/history", AuthorizeJWT, ...beforeTimestampValidators, ...pageSizeValidators, this.getMethod.bind(this));
    }
}

module.exports = HistoryController;

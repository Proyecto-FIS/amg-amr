const express = require("express");
const AuthorizeJWT = require("../middlewares/AuthorizeJWT");
const HistoryEntry = require("../models/HistoryEntry");
const Validators = require("../middlewares/Validators");

/**
 * @typedef Product
 * @property {string} productID         - Product identifier
 * @property {number} quantity          - Number of products of this type
 * @property {number} unitPriceEuros    - Price per unit, in euros
 */

/**
 * @typedef HistoryEntry
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
     * @param {string}  userToken.body.required  - User JWT token
     * @param {integer} page.body.required - Page in history
     * @param {integer} pageSize.body.required - Page size
     * @returns {Array.<HistoryEntry>}  200 - Returns the requested entries
     * @returns {ValidationError}       400 - Supplied parameters are invalid
     * @returns {UserAuthError}         401 - User is not authorized to perform this operation
     * @returns {HistoryError}          500 - Database error
     */
    getMethod(req, res) {
        // TODO Query DB, result result and return 500 if error
        res.send("Test");
    }

    constructor(apiPrefix, router) {
        const pageValidators = [Validators.Required("page"), Validators.Min(0)];
        const pageSizeValidators = [Validators.Required("pageSize"), Validators.Range("pageSize", 1, 20)];
        router.get(apiPrefix + "/history", AuthorizeJWT, ...pageValidators, ...pageSizeValidators, this.getMethod.bind(this));
    }
}

module.exports = HistoryController;

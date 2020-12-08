const express = require("express");
const AuthorizeJWT = require("../middlewares/AuthorizeJWT");

/**
 * @typedef HistoryEntry
 * @property {string} todo.required - TODO
 */

/**
 * @typedef HistoryError
 * @property {string} code.required - Error happened
 */

class HistoryController {

    /**
     * Get a purchase history entry
     * @route GET /history
     * @group history - Purchases history per user
     * @param {string}  userToken.body.required  - TODO
     * @param {integer} page.body.required - Page in history
     * @param {integer} pageSize.body.required - Page size
     * @returns {HistoryEntry} 200 - Returns the requested entries
     * @return {HistoryError} default - Unexpected error
     */
    getMethod(req, res) {
        res.send("Test");
    }

    constructor(apiPrefix, router) {
        router.get(apiPrefix + "/history", AuthorizeJWT, this.getMethod.bind(this));
    }
}

module.exports = HistoryController;

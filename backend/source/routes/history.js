const express = require("express");

/**
 * @typedef HistoryEntry
 * @property {string} todo.required - TODO
 */

/**
 * @typedef HistoryError
 * @property {string} code.required - Error happened
 */
/**
 * Get a purchase history entry
 * @route GET /history
 * @group history - Purchases history per user
 * @param {string}  userToken.body.required  - TODO
 * @param {integer} page - Page in history
 * @param {integer} pageSize - Page size
 * @returns {HistoryEntry} 200 - Return the requested entry
 * @return {HistoryError} default - Unexpected error
 */
const getMethod = (req, res) => {
    res.send("Coffaine - Sales microservice");
};

module.exports.register = (apiPrefix, router) => {

    router.get(apiPrefix + "/history", getMethod);
}

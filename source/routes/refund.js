const express = require("express");

/**
 * @typedef ReturnError
 * @property {string} code.required - TODO
 */

/**
 * Register a new return from a bought product
 * @route POST /return
 * @group return - Product returns
 * @param {integer} productID - Product identifier
 * @param {integer} deliveryID - Delivery identifier
 * @param {string}  userToken.body.required  - TODO
 * @returns {null} 200 - Return registered successfully
 * @returns {ReturnError} default - Unexpected error
 */
const postMethod = (req, res) => {
    res.send("Coffaine - Sales microservice");
};

module.exports.register = (apiPrefix, router) => {
    
    router.post(apiPrefix + "/return", postMethod);
}

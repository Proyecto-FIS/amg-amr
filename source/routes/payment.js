const express = require("express");

/**
 * @typedef Cart
 * @property {Array.<Product>} products.required - List of product to buy
 */

/**
 * @typedef PaymentError
 * @property {string} code.required
 */

/**
 * This function executes a standalone payment
 * @route POST /payment
 * @group payment - Payment operations
 * @param {Cart.model}      cart.body.required       - Cart with items to buy
 * @param {string}          userToken.body.required  - TODO
 * @returns {integer}       200 - Payment ID
 * @returns {PaymentError}  default - Unexpected error
 */
const postMethod = (req, res) => {
    res.send("Coffaine - Sales microservice");
};

module.exports.register = (apiPrefix, router) => {
    router.post(apiPrefix + "/payment", postMethod);
}

const express = require("express");

/**
 * @typedef Subscription
 * @property {string} creationTime - Creation time
 * @property {string} transactionID - Transaction identifier
 * @property {boolean} isActive - Is this subscription still active?
 * @property {integer} productID - Product identifier
 * @property {integer} price    - Product price, in euros
 */

/**
 * @typedef SubscriptionError
 * @property {string} todo.required - TODO
 */

/**
 * Get a previously created subscription
 * @route GET /subscription
 * @group subscription - Monthly subscriptions
 * @param {string}  userToken.body.required  - TODO
 * @param {integer} transactionID - Transaction identifier
 * @returns {Subscription} 200 - Returns the requested subscription for this user
 * @returns {SubscriptionError} default - unexpected error
 */
const getMethod = (req, res) => {
    res.send("Test");
}

/**
 * Create a new subscription
 * @route POST /subscription
 * @group subscription - Monthly subscriptions
 * @param {string}  userToken.body.required  - TODO
 * @param {Subscription} subscription.body.required - Subscription to be added
 * @returns {integer} 200 - Returns the identifier for the new subscription
 * @returns {SubscriptionError} default - unexpected error
 */
const postMethod = (req, res) => {
    res.send("Coffaine - Sales microservice");
}

/**
 * Update an existing subscription
 * @route PUT /subscription
 * @group subscription - Monthly subscriptions
 * @param {string}  userToken.body.required  - TODO
 * @param {Subscription} subscription.body.required - Subscription to be updated
 * @returns {Subscription} 200 - Returns the updated subscription
 * @returns {SubscriptionError} default - unexpected error
 */
const putMethod = (req, res) => {
    res.send("Test");
}

/**
 * Deactivates an existing subscription
 * @route DELETE /subscription
 * @group subscription - Monthly subscriptions
 * @param {string}  userToken.body.required  - TODO
 * @param {integer} subscriptionID - Subscription identifier
 * @returns {Subscription} 200 - Returns the state of the required subscription
 * @returns {SubscriptionError} default - unexpected error
 */
const deleteMethod = (req, res) => {
    res.send("Test");
}

module.exports.register = (apiPrefix, router) => {
    router.get(apiPrefix + "/subscription", getMethod);
    router.post(apiPrefix + "/subscription", postMethod);
    router.put(apiPrefix + "/subscription", putMethod);
    router.delete(apiPrefix + "/subscription", deleteMethod);
}

const express = require("express");

/**
 * @typedef BillingProfile
 * @property {integer} id       - Identifier
 * @property {string} address   - Address
 * @property {string} city      - City
 * @property {string} country   - Country
 * @property {integer} zipCode  - Zip code
 */

/**
 * @typedef BillingProfileError
 * @property {string} todo.required - TODO
 */

/**
 * Get a billing profile for a specific user
 * @route GET /billing-profile
 * @group Billing profile - Billing profiles per user
 * @param {string}  userToken.body.required  - TODO
 * @param {integer} profileID.body.required - Billing profile identifier
 * @returns {BillingProfile} 200 - Returns the requested billing profile for this user
 * @returns {BillingProfileError} default - unexpected error
 */
const getMethod = (req, res) => {
    res.send("Test");
}

/**
 * Create a new billing profile for a certain user
 * @route POST /billing-profile
 * @group Billing profile - Billing profiles per user
 * @param {string}  userToken.body.required  - TODO
 * @param {BillingProfile.model} profile.body.required - New billing profile
 * @returns {integer} 200 - Returns the billing profile identifier
 * @returns {BillingProfileError} default - unexpected error
 */
const postMethod = (req, res) => {
    res.send("Coffaine - Sales microservice");
}

/**
 * Update an existing billing profile for a certain user
 * @route PUT /billing-profile
 * @group Billing profile - Billing profiles per user
 * @param {string}  userToken.body.required  - TODO
 * @param {BillingProfile.model} profile.body.required - New value for the billing profile
 * @returns {BillingProfile} 200 - Returns the current state for this billing profile
 * @returns {BillingProfileError} default - unexpected error
 */
const putMethod = (req, res) => {
    res.send("Test");
}

/**
 * Deletes an existing billing profile for a certain user
 * @route DELETE /billing-profile
 * @group Billing profile - Billing profiles per user
 * @param {string}  userToken.body.required  - TODO
 * @param {integer} profileID.body.required - Billing profile identifier
 * @returns {BillingProfile} 200 - Returns the current state for this billing profile
 * @returns {BillingProfileError} default - unexpected error
 */
const deleteMethod = (req, res) => {
    res.send("Test");
}

module.exports.register = (apiPrefix, router) => {
    
    router.get(apiPrefix + "/billing-profile", getMethod);
    router.post(apiPrefix + "/billing-profile", postMethod);
    router.put(apiPrefix + "/billing-profile", putMethod);
    router.delete(apiPrefix + "/billing-profile", deleteMethod);
}

const AuthorizeJWT = require("../middlewares/AuthorizeJWT");
const BillingProfile = require("../models/BillingProfile");
const Validators = require("../middlewares/Validators");

class BillingProfileController {

    /**
     * Get a billing profile for a specific user
     * @route GET /billing-profile
     * @group Billing profile - Billing profiles per user
     * @param {string}  userToken.body.required  - TODO
     * @param {integer} profileID.body.required - Billing profile identifier
     * @returns {BillingProfile} 200 - Returns the requested billing profile for this user
     * @returns {BillingProfileError} default - unexpected error
     */
    getMethod(req, res) {
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
    postMethod(req, res) {
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
    putMethod(req, res) {
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
    deleteMethod(req, res) {
        res.send("Test");
    }

    constructor(apiPrefix, router) {
        const route = apiPrefix + "/billing-profile";
        router.get(route, this.getMethod.bind(this));
        router.post(route, this.postMethod.bind(this));
        router.put(route, this.putMethod.bind(this));
        router.delete(route, this.deleteMethod.bind(this));
    }
}

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
 * @property {string} reason.required - Textual representation of the error
 */

module.exports = BillingProfileController;

const AuthorizeJWT = require("../middlewares/AuthorizeJWT");
const BillingProfile = require("../models/BillingProfile");
const Validators = require("../middlewares/Validators");

class BillingProfileController {

    /**
     * Get the billing profiles for a specific user
     * @route GET /billing-profile
     * @group Billing profile - Billing profiles per user
     * @param {string}  userToken.query.required  - User JWT token
     * @returns {Array.<BillingProfile>}    200 - Returns the billing profiles for this user
     * @returns {ValidationError}           400 - Supplied parameters are invalid
     * @returns {UserAuthError}             401 - User is not authorized to perform this operation
     * @returns {DatabaseError}             500 - Database error
     */
    getMethod(req, res) {
        res.send("Test");
    }

    /**
     * Create a new billing profile for a certain user
     * @route POST /billing-profile
     * @group Billing profile - Billing profiles per user
     * @param {string}  userToken.query.required            - User JWT token
     * @param {BillingProfile.model} profile.body.required  - New billing profile
     * @returns {string}                200 - Returns the billing profile identifier
     * @returns {ValidationError}       400 - Supplied parameters are invalid
     * @returns {UserAuthError}         401 - User is not authorized to perform this operation
     * @returns {DatabaseError}         500 - Database error
     */
    postMethod(req, res) {
        res.send("Coffaine - Sales microservice");
    }

    /**
     * Update an existing billing profile for a certain user
     * @route PUT /billing-profile
     * @group Billing profile - Billing profiles per user
     * @param {string}  userToken.query.required            - User JWT token
     * @param {BillingProfile.model} profile.body.required  - New value for the billing profile
     * @returns {BillingProfile}        200 - Returns the current state for this billing profile
     * @returns {ValidationError}       400 - Supplied parameters are invalid
     * @returns {UserAuthError}         401 - User is not authorized to perform this operation
     * @returns {DatabaseError}         500 - Database error
     */
    putMethod(req, res) {
        res.send("Test");
    }

    /**
     * Deletes an existing billing profile for a certain user
     * @route DELETE /billing-profile
     * @group Billing profile - Billing profiles per user
     * @param {string} userToken.query.required     - User JWT token
     * @param {string} profileID.query.required     - Billing profile identifier
     * @returns {BillingProfile}        200 - Returns the deleted billing profile, or empty if it didn't exist
     * @returns {ValidationError}       400 - Supplied parameters are invalid
     * @returns {UserAuthError}         401 - User is not authorized to perform this operation
     * @returns {DatabaseError}         500 - Database error
     */
    deleteMethod(req, res) {
        res.send("Test");
    }

    constructor(apiPrefix, router) {
        const route = `${apiPrefix}/billing-profile`;
        const userTokenValidators = [Validators.Required("userToken"), AuthorizeJWT];

        router.get(route, ...userTokenValidators, this.getMethod.bind(this));
        router.post(route, ...userTokenValidators, this.postMethod.bind(this));
        router.put(route, ...userTokenValidators, this.putMethod.bind(this));
        router.delete(route, ...userTokenValidators, this.deleteMethod.bind(this));
    }
}

/**
 * @typedef BillingProfile
 * @property {string} _id                   - Unique identifier (ignored in POST requests due to id collision)
 * @property {string} name.required         - Receiver name
 * @property {string} surname.required      - Receiver surname
 * @property {string} address.required      - Address
 * @property {string} city.required         - City
 * @property {string} province.required     - Province or state
 * @property {string} country.required      - Country
 * @property {integer} zipCode.required     - Zip code
 * @property {integer} phoneNumber.required - Phone number
 * @property {string} email.required        - Receiver email
 */

module.exports = BillingProfileController;

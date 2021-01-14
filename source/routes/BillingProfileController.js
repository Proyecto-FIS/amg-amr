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
        BillingProfile.find({
            userID: req.query.userID
        })
            .select("-userID")
            .sort("-name")
            .lean()
            .exec((err, entries) => {
                if (err) {
                    res.status(500).json({ reason: "Database error" });
                } else {
                    res.status(200).json(entries);
                }
            });
    }

    /**
     * Create a new billing profile for a certain user
     * @route POST /billing-profile
     * @group Billing profile - Billing profiles per user
     * @param {string}  userToken.query.required                - User JWT token
     * @param {BillingProfilePost.model} profile.body.required  - New billing profile
     * @returns {string}                200 - Returns the billing profile identifier
     * @returns {ValidationError}       400 - Supplied parameters are invalid
     * @returns {UserAuthError}         401 - User is not authorized to perform this operation
     * @returns {DatabaseError}         500 - Database error
     */
    postMethod(req, res) {
        delete req.body.profile._id;        // Ignore _id to prevent key duplication
        req.body.profile.userID = req.query.userID;
        new BillingProfile(req.body.profile)
            .save()
            .then(doc => res.status(200).send(doc._id))
            .catch(err => res.status(500).json({ reason: "Database error" }));
    }

    /**
     * Update an existing billing profile for a certain user
     * @route PUT /billing-profile
     * @group Billing profile - Billing profiles per user
     * @param {string}  userToken.query.required                - User JWT token
     * @param {BillingProfilePut.model} profile.body.required   - New value for the billing profile
     * @returns {BillingProfile}        200 - Returns the current state for this billing profile
     * @returns {ValidationError}       400 - Supplied parameters are invalid
     * @returns {UserAuthError}         401 - User is not authorized to perform this operation
     * @returns {DatabaseError}         500 - Database error
     */
    putMethod(req, res) {
        BillingProfile.findOneAndUpdate({ _id: req.body.profile._id, userID: req.query.userID }, req.body.profile)
            .then(doc => {
                if (doc) {
                    return BillingProfile.findById(doc._id);
                } else {
                    res.sendStatus(401);
                }
            })
            .then(doc => res.status(200).json(doc))
            .catch(err => res.status(500).json({ reason: "Database error" }));
    }

    /**
     * Deletes an existing billing profile for a certain user
     * @route DELETE /billing-profile
     * @group Billing profile - Billing profiles per user
     * @param {string} userToken.query.required     - User JWT token
     * @param {string} profileID.query              - Billing profile identifier
     * @returns {BillingProfile}        200 - Returns the deleted billing profile
     * @returns {}                      204 - Whether all the billing profiles for a certain user have been deleted
     * @returns {ValidationError}       400 - Supplied parameters are invalid
     * @returns {UserAuthError}         401 - User is not authorized to perform this operation
     * @returns {DatabaseError}         500 - Database error
     */
    deleteMethod(req, res) {
        if (req.query.profileID) {
            BillingProfile.findOneAndDelete({ _id: req.query.profileID, userID: req.query.userID })
                .then(doc => doc ? res.status(200).json(doc) : res.sendStatus(401))
                .catch(err => res.status(500).json({ reason: "Database error" }));
        } else {
            BillingProfile.deleteMany({ userID: req.query.userID })
                .then(() => res.sendStatus(204))
                .catch(() => res.status(500).json({ reason: "Database error" }));
        }
    }

    constructor(apiPrefix, router) {
        const route = `${apiPrefix}/billing-profile`;
        const userTokenValidators = [Validators.Required("userToken"), AuthorizeJWT];

        router.get(route, ...userTokenValidators, this.getMethod.bind(this));
        router.post(route, ...userTokenValidators, Validators.Required("profile"), this.postMethod.bind(this));
        router.put(route, ...userTokenValidators, Validators.Required("profile"), this.putMethod.bind(this));
        router.delete(route, ...userTokenValidators, this.deleteMethod.bind(this));
    }
}

/**
 * @typedef BillingProfilePost
 * @property {BillingProfile.model} profile - Billing profile to add
 */

/**
 * @typedef BillingProfilePut
 * @property {BillingProfile.model} profile - Billing profile to edit
 */

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

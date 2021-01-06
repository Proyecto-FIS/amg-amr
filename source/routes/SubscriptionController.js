const express = require("express");
const AuthorizeJWT = require("../middlewares/AuthorizeJWT");
const Subscription = require("../models/Subscription");
const Validators = require("../middlewares/Validators");

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

class SubscriptionController {
    /**
     * Get a previously created subscription
     * @route GET /subscription
     * @group subscription - Monthly subscriptions
     * @param {string}  userToken.body.required  - TODO
     * @param {integer} transactionID - Transaction identifier
     * @returns {Subscription} 200 - Returns the requested subscription for this user
     * @returns {SubscriptionError} default - unexpected error
     */
    getMethod(req, res) {
        Subscription.find({
                userID: req.query.userID
            })
            .select("-userID")
            .sort("-name")
            .lean()
            .exec((err, entries) => {
                if (err) {
                    res.status(500).json({
                        reason: "Database error"
                    });
                } else {
                    res.status(200).json(entries);
                }
            });
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
    postMethod(req, res) {
        delete req.body.subscription._id; // Ignore _id to prevent key duplication
        req.body.subscription.userID = req.query.userID;
        new Subscription(req.body.subscription)
            .save()
            .then(doc => res.status(200).send(doc._id))
            .catch(err => res.status(500).json({
                reason: "Database error"
            }));
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
    putMethod(req, res) {
        Subscription.findOneAndUpdate({
                _id: req.body.subscription._id,
                userID: req.query.userID
            }, req.body.subscription)
            .then(doc => {
                if (doc) {
                    return Subscription.findById(doc._id);
                } else {
                    res.sendStatus(401);
                }
            })
            .then(doc => res.status(200).json(doc))
            .catch(err => res.status(500).json({
                reason: "Database error"
            }));
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
    deleteMethod(req, res) {
        Subscription.findOneAndDelete({
                _id: req.query.subscriptionID,
                userID: req.query.userID
            })
            .then(doc => doc ? res.status(200).json(doc) : res.sendStatus(401))
            .catch(err => res.status(500).json({
                reason: "Database error"
            }));
    }

    constructor(apiPrefix, router) {
        const route = `${apiPrefix}/subscription`;
        const userTokenValidators = [Validators.Required("userToken"), AuthorizeJWT];

        router.get(route, ...userTokenValidators, this.getMethod.bind(this));
        router.post(route, ...userTokenValidators, Validators.Required("subscription"), this.postMethod.bind(this));
        router.put(route, ...userTokenValidators, Validators.Required("subscription"), this.putMethod.bind(this));
        router.delete(route, ...userTokenValidators, Validators.Required("subscriptionID"), this.deleteMethod.bind(this));
    }
}

// module.exports.register = (apiPrefix, router) => {
//     router.get(apiPrefix + "/subscription", getMethod);
//     router.post(apiPrefix + "/subscription", postMethod);
//     router.put(apiPrefix + "/subscription", putMethod);
//     router.delete(apiPrefix + "/subscription", deleteMethod);
// }
module.exports = SubscriptionController;
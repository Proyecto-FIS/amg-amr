const express = require("express");
const AuthorizeJWT = require("../middlewares/AuthorizeJWT");
const Payment = require("../models/Payment");
const Validators = require("../middlewares/Validators");

/**
 * @typedef Payment
 * @property {string} creationTime - Creation time
 * @property {string} transactionID - Transaction identifier
 * @property {boolean} isActive - Is this payment still active?
 * @property {integer} productID - Product identifier
 * @property {integer} price    - Product price, in euros
 */

/**
 * @typedef PaymentError
 * @property {string} todo.required - TODO
 */

class PaymentController {
    /**
     * Get a previously created payment
     * @route GET /payment
     * @group payment - Monthly payments
     * @param {string}  userToken.body.required  - TODO
     * @param {integer} transactionID - Transaction identifier
     * @returns {Payment} 200 - Returns the requested payment for this user
     * @returns {PaymentError} default - unexpected error
     */
    getMethod(req, res) {
        Payment.find({
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
     * Create a new payment
     * @route POST /payment
     * @group payment - Monthly payments
     * @param {string}  userToken.body.required  - TODO
     * @param {Payment} payment.body.required - Payment to be added
     * @returns {integer} 200 - Returns the identifier for the new payment
     * @returns {PaymentError} default - unexpected error
     */
    postMethod(req, res) {
        delete req.body.payment._id; // Ignore _id to prevent key duplication
        req.body.payment.userID = req.query.userID;
        new Payment(req.body.payment)
            .save()
            .then(doc => res.status(200).send(doc._id))
            .catch(err => res.status(500).json({
                reason: "Database error"
            }));
    }

    /**
     * Update an existing payment
     * @route PUT /payment
     * @group payment - Monthly payments
     * @param {string}  userToken.body.required  - TODO
     * @param {Payment} payment.body.required - Payment to be updated
     * @returns {Payment} 200 - Returns the updated payment
     * @returns {PaymentError} default - unexpected error
     */
    putMethod(req, res) {
        Payment.findOneAndUpdate({
                _id: req.body.payment._id,
                userID: req.query.userID
            }, req.body.payment)
            .then(doc => {
                if (doc) {
                    return Payment.findById(doc._id);
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
     * Deactivates an existing payment
     * @route DELETE /payment
     * @group payment - Monthly payments
     * @param {string}  userToken.body.required  - TODO
     * @param {integer} paymentID - Payment identifier
     * @returns {Payment} 200 - Returns the state of the required payment
     * @returns {PaymentError} default - unexpected error
     */
    deleteMethod(req, res) {
        Payment.findOneAndDelete({
                _id: req.query.paymentID,
                userID: req.query.userID
            })
            .then(doc => doc ? res.status(200).json(doc) : res.sendStatus(401))
            .catch(err => res.status(500).json({
                reason: "Database error"
            }));
    }

    constructor(apiPrefix, router) {
        const route = `${apiPrefix}/payment`;
        const userTokenValidators = [Validators.Required("userToken"), AuthorizeJWT];

        router.get(route, ...userTokenValidators, this.getMethod.bind(this));
        router.post(route, ...userTokenValidators, Validators.Required("payment"), this.postMethod.bind(this));
        router.put(route, ...userTokenValidators, Validators.Required("payment"), this.putMethod.bind(this));
        router.delete(route, ...userTokenValidators, Validators.Required("paymentID"), this.deleteMethod.bind(this));
    }
}

// module.exports.register = (apiPrefix, router) => {
//     router.get(apiPrefix + "/payment", getMethod);
//     router.post(apiPrefix + "/payment", postMethod);
//     router.put(apiPrefix + "/payment", putMethod);
//     router.delete(apiPrefix + "/payment", deleteMethod);
// }
// module.exports = PaymentController;
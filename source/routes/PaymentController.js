const express = require("express");
const AuthorizeJWT = require("../middlewares/AuthorizeJWT");
const Payment = require("../models/Payment");
const Validators = require("../middlewares/Validators");
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @typedef Product
 * @property {string} _id               - Product identifier
 * @property {number} quantity          - Number of products of this type
 * @property {number} unitPriceEuros    - Price per unit, in euros
 */

/**
 * @typedef Payment
 * @property {string} _id               - Unique identifier for this payment
 * @property {string} userID            - User JWT token
 * @property {string} timestamp         - Date & time when the operation ocurred
 * @property {string} transaction_payment_id     - Transaction identifier
 * @property {Array.<Product>} products - Products which have been bought
 * @property {integer} price            - Total amount of products purchased
 * @property {string} billing_profile_id - Unique identifier for billing profile 
 */

/**
 * @typedef PaymentPost
 * @property {Payment.model} payment - Payment to add
 */

class PaymentController {

  /**
   * Create a new payment
   * @route POST /payment
   * @group payment - Product payments
   * @param {string}  userToken.query.required          - User JWT token
   * @param {PaymentPost.model} payment.body.required   - New payment
   * @returns {string}                                  200 - Returns the payment identifier
   * @returns {ValidationError}                         400 - Supplied parameters are invalid
   * @returns {UserAuthError}                           401 - User is not authorized to perform this operation
   * @returns {DatabaseError}                           500 - Database error
   */
  async payMethod(req, res) {
    const {
      billingProfile
    } = req.body;
    const {
      products
    } = req.body.payment;

    const customer_id = req.query.userID.toHexString();
    const customer = await axios.get(process.env.USERS_MS + "/customers/" + customer_id, {params: {id: customer_id}})
      .catch(error => {
        console.error(error)
      });

    let identifiers = products.reduce((acc, current) => acc.concat(current._id + ","), "");
    identifiers = identifiers.substring(0, identifiers.length - 1);
    // TODO: cambiar ENDPOINT cuando el microservicio de products actualice el api gateway
    const productsToBuy = await axios.get(process.env.API_PRODUCTS_ENDPOINT + "/products-several", {
      params: {
        identifiers
      }
    }).then(result => {
      var productsToBuy = result.data.map(function (prod, index) {
        const aux = products.filter(p => p._id == prod._id);
        const product = {};
        product['_id'] = prod._id
        product['quantity'] = aux[0].quantity;
        const formatAux = prod.format.filter(element => element.name == aux[0].format);
        product['unitPriceEuros'] = formatAux[0].price;
        // prod['stripePrice'] = formatAux[0].stripe_price;
        // prod['stripeProduct'] = formatAux[0].stripe_product;
        return product;
      })
      return productsToBuy
    }).catch(error => {
      console.error(error)
    });

    // Obtengo el precio total a partir de la lista de productos extraida de la base de datos para evitar que se edite el precio en frontend
    const totalPrice = productsToBuy.reduce((totalPrice, product) => totalPrice + (product.quantity * product.unitPriceEuros), 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100,
      currency: 'eur',
      customer: customer.data.stripe_id,
      // Verify your integration in this guide by including this parameter
      metadata: {
        integration_check: 'accept_a_payment'
      },
      receipt_email: customer.data.email,
    });

    req.body.payment.price = totalPrice;
    req.body.payment.transaction_payment_id = paymentIntent.id;
    req.body.payment.billing_profile_id = billingProfile._id;
    req.body.payment.products = productsToBuy;
    const userToken = req.query.userToken;
    delete req.body.payment._id; // Ignore _id to prevent key duplication
    req.body.payment.userID = req.query.userID;
    new Payment(req.body.payment)
      .save()
      .then(doc => {
        // History entry
        const entry = {
          userID: doc.userID,
          operationType: "payment",
          products: productsToBuy
        };
        return this.historyController.createEntry(entry);
      }).then(doc => {
        // Delivery
        return axios.post(process.env.API_DELIVERIES_ENDPOINT + "/deliveries", {
          "historyId": doc._id,
          "profile": billingProfile,
          "products": productsToBuy
        }, {
          params: {
            userToken
          }
        })
      }).then(doc => {
        res.status(200).json({
          'client_secret': paymentIntent['client_secret']
        })
      }).catch(err => {
        res.status(500).json({
          reason: "Database error"
        })
      });

  };

  constructor(apiPrefix, router, historyController) {
    const userTokenValidators = [Validators.Required("userToken"), AuthorizeJWT];
    router.post(apiPrefix + "/payment", ...userTokenValidators, Validators.Required("payment"), this.payMethod.bind(this));
    this.historyController = historyController;
  }
}

module.exports = PaymentController;
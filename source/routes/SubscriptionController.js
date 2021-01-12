const express = require("express");
const AuthorizeJWT = require("../middlewares/AuthorizeJWT");
const Payment = require("../models/Payment");
const Validators = require("../middlewares/Validators");
const axios = require('axios');
const {
  Subscription
} = require("rxjs");


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOKS_PAY_INTENT_SUCCESS;

/**
 * @typedef Product
 * @property {string} _id               - Product identifier
 * @property {number} quantity          - Number of products of this type
 * @property {number} unitPriceEuros    - Price per unit, in euros
 * @property {string} stripe_price      - Price stripe identifier
 * @property {string} stripe_product    - Product stripe identifier
 */

/**
 * @typedef Subscription
 * @property {string} _id               - Unique identifier for this subscription
 * @property {string} userID            - User JWT token
 * @property {string} timestamp         - Date & time when the operation ocurred
 * @property {string} transaction_subscription_id     - Transaction identifier
 * @property {Array.<Product>} products - Products which have been bought
 * @property {integer} price            - Total amount of products purchased
 * @property {boolean} is_active        - Boolean that indicates if the subscription is active
 * @property {string} billing_profile_id - Unique identifier for billing profile 
 * @property {string} payment_method_id - Unique stripe identifier for payment method 
 */

/**
 * @typedef SubscriptionPost
 * @property {Subscription.model} subscription - Subscription to add
 */

class SubscriptionController {

  createSubscription(sub) {
    const subscription = new Subscription(sub);
    return subscription.save();
  }

  createSubscriptions(subs) {
    const promises = subs.map(entry => this.createSubscription(entry));
    return Promise.all(promises);
  }

  /**
   * Create a new subscription
   * @route POST /subscription
   * @group subscription - Monthly subscription
   * @param {string}  userToken.query.required          - User JWT token
   * @param {SubscriptionPost.model} subscription.body.required   - New subscription
   * @returns {string}                                  200 - Returns the subscription identifier
   * @returns {ValidationError}                         400 - Supplied parameters are invalid
   * @returns {UserAuthError}                           401 - User is not authorized to perform this operation
   * @returns {DatabaseError}                           500 - Database error
   */
  async subscriptionMethod(req, res) {
    const {
      billingProfile
    } = req.body;
    const {
      products
    } = req.body;
    const {
      cardElement
    } = req.body;

    const customer = await axios.get(process.env.API_ENDPOINT_URL + "/customers/" + req.query.userID).then(
      // TODO: rellenar then
    ).catch(
      // TODO: rellenar catch
    );

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
        product['quantity'] = aux[0].quantity;
        const formatAux = prod.format.filter(element => element.name == aux[0].format);
        product['unitPriceEuros'] = formatAux[0].price;
        product['stripePrice'] = formatAux[0].stripe_price;
        product['stripeProduct'] = formatAux[0].stripe_product;
        return product;
      })
      return productsToBuy
    }).catch(error => {
      console.error(error)
    });

    // Obtengo el precio total a partir de la lista de productos extraida de la base de datos para evitar que se edite el precio en frontend
    const totalPrice = productsToBuy.reduce((totalPrice, product) => totalPrice + (product.quantity * product.unitPriceEuros), 0)

    const payment_method = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        email: customer.email,
      },
    });

    const customer_stripe_id = customer.stripe_id;
    const customerStripe = await stripe.customers.update({
      customer_stripe_id,
      payment_method: payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });

    let prices = productsToBuy.reduce((acc, current) => acc.push({
      price: current.stripe_price
    }), []);

    const subscription = await stripe.subscriptions.create({
      customer: customer.stripe_id,
      items: prices,
      expand: ['latest_invoice.payment_intent']
    });
    const status = subscription['latest_invoice']['payment_intent']['status']
    const client_secret = subscription['latest_invoice']['payment_intent']['client_secret']


    req.body.subscription.price = totalPrice;
    req.body.subscription.transaction_subscription_id = subscription.id;
    req.body.subscription.billing_profile_id = billingProfile.id;
    req.body.subscription.products = productsToBuy;
    req.body.subscription.payment_method_id = payment_method.id

    delete req.body.subscription._id; // Ignore _id to prevent key duplication
    req.body.subscription.userID = req.query.userID;
    new Subscription(req.body.subscription)
      .save()
      .then(doc => {
        // res.status(200).send(doc._id)
        res.status(200).json({'id': doc._id, 'client_secret': client_secret, 'status': status})
      }).catch(err => {
        res.status(500).json({
          reason: "Database error"
        })
      });
  }


  // async webhooksMethod(req, res) {
  //         const sig = req.headers['stripe-signature'];
  //         let event;

  //         try {
  //           event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  //         }
  //         catch (err) {
  //           return res.status(400).send(`Webhook Error: ${err.message}`);
  //         }
  //         // Handle the event
  //         switch (event.type) {
  //           case 'payment_intent.succeeded': {
  //             const email = event['data']['object']['receipt_email'] // contains the email that will recive the recipt for the payment (users email usually)
  //             console.log(`PaymentIntent was successful for ${email}!`)
  //             break;
  //           }
  //           default:
  //             // Unexpected event type
  //             return res.status(400).end();
  //         }

  //         // Return a 200 response to acknowledge receipt of the event
  //         res.json({received: true});
  //     };

  /**
   * Deactivates an existing subscription
   * @route DELETE /subscription
   * @group subscription - Monthly subcription
   * @param {integer} subscriptionID - Subscription identifier
   * @param {string}  userToken.query.required         - User JWT token
   * @returns {}                      204 - Returns nothing
   * @returns {ValidationError}       400 - Supplied parameters are invalid
   * @returns {UserAuthError}         401 - User is not authorized to perform this operation
   * @returns {DatabaseError}         500 - Database error
   */
  async deleteMethod(req, res) {
    const sub = Subscription.find({
      _id: req.query.subscriptionID,
      userID: req.query.userID,
    })

    Subscription.findOneAndDelete({
        _id: req.query.subscriptionID,
        userID: req.query.userID
      })
      .catch(err => res.status(500).json({
        reason: "Database error"
      }));
      const deleted = await stripe.subscriptions.del(
        sub.transaction_subscription_id
      ).then(
        res.sendStatus(204)
      )
      .catch(err => res.status(500).json({
        reason: "Stripe delete subscription error"
      }));
  }


  /**
   * Get all user subscriptions
   * @route GET /subscription
   * @group subscription - Monthly subscription
   * @param {string}  userToken.query.required         - User JWT token
   * @param {string}  beforeTimestamp.query.required   - Search before this timestamp happens
   * @param {integer} pageSize.query.required          - Page size
   * @returns {Array.<Subscription>}  200 - Returns the requested subscriptions
   * @returns {ValidationError}       400 - Supplied parameters are invalid
   * @returns {UserAuthError}         401 - User is not authorized to perform this operation
   * @returns {DatabaseError}         500 - Database error
   */
  getMethod(req, res) {
    Subscription.find({
        userID: req.query.userID,
        timestamp: {
          $lt: req.query.beforeTimestamp
        }
      })
      .select("timestamp price products is_active")
      .limit(parseInt(req.query.pageSize))
      .sort("-timestamp")
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
  };

  constructor(apiPrefix, router) {
    const route = apiPrefix + "/subscription";
    const userTokenValidators = [Validators.Required("userToken"), AuthorizeJWT];
    const beforeTimestampValidators = [Validators.Required("beforeTimestamp"), Validators.ToDate("beforeTimestamp")];
    const pageSizeValidators = [Validators.Required("pageSize"), Validators.Range("pageSize", 1, 20)];
    router.get(route, ...userTokenValidators, ...beforeTimestampValidators, ...pageSizeValidators, this.getMethod.bind(this));
    router.post(apiPrefix + "/subscription", ...userTokenValidators, Validators.Required("subscription"), this.subscriptionMethod.bind(this));
    // router.post(apiPrefix + "/stripewebhook", ...userTokenValidators, Validators.Required("subscription"), this.webhooksMethod.bind(this));
    router.delete(route, ...userTokenValidators, Validators.Required("subscriptionID"), this.deleteMethod.bind(this));
  }
}

module.exports = SubscriptionController;
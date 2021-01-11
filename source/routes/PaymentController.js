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
   * Create a new payment
   * @route POST /payment
   * @group payment - Stripe Payments
   * @param {string}  userToken.body.required  - TODO
   * @param {Payment} payment.body.required - Payment to be added
   * @returns {integer} 200 - Returns the identifier for the new payment
   * @returns {PaymentError} default - unexpected error
   */
  async payMethod(req, res) {
    const {
      billingProfile
    } = req.body;
    const {
      products
    } = req.body.payment;
    
    const customer = await axios.get(process.env.API_ENDPOINT_URL + "/customers/" + req.query.userID).then().catch();
    
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
      customer: customer.stripe_id,
      // Verify your integration in this guide by including this parameter
      metadata: {
        integration_check: 'accept_a_payment'
      },
      receipt_email: customer.email,
    });

    req.body.payment.price = totalPrice;
    req.body.payment.transaction_payment_id = paymentIntent.id;
    req.body.payment.billing_profile_id = billingProfile.id;
    req.body.payment.products = productsToBuy;

    delete req.body.payment._id; // Ignore _id to prevent key duplication
    req.body.payment.userID = req.query.userID;
    new Payment(req.body.payment)
      .save()
      .then(doc => {
        res.status(200).send(doc._id)
        // res.status(200).send({'id': doc._id,'client_secret': paymentIntent['client_secret']})
      }).catch(err => {
        res.status(500).json({
          reason: "Database error"
        })
      });
  };


  /**
   * Create a new subscription
   * @route POST /subscription
   * @group payment - Monthly subscriptions
   * @param {string}  userToken.body.required  - TODO
   * @param {Subscription} subscription.body.required - Payment to be added
   * @returns {integer} 200 - Returns the identifier for the new payment
   * @returns {PaymentError} default - unexpected error
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
    
    const customer = await axios.get(process.env.API_ENDPOINT_URL + "/customers/" + req.query.userID).then().catch();

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
        res.status(200).send(doc._id)
        // res.status(200).send({'id': doc._id, 'client_secret': client_secret, 'status': status})
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
   * Deactivates an existing payment
   * @route DELETE /payment
   * @group payment - Monthly payments
   * @param {string}  userToken.body.required  - TODO
   * @param {integer} subscriptionID - Payment identifier
   * @returns {Payment} 200 - Returns the state of the required payment
   * @returns {PaymentError} default - unexpected error
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
    const route = `${apiPrefix}/payment`;
    const userTokenValidators = [Validators.Required("userToken"), AuthorizeJWT];
    // router.post(apiPrefix + "/payment",...userTokenValidators, Validators.Required("payment"), this.payMethod.bind(this));
    // router.post(apiPrefix + "/subscription",...userTokenValidators, Validators.Required("payment"), this.subscriptionMethod.bind(this));
    // router.post(apiPrefix + "/stripewebhook",...userTokenValidators, Validators.Required("payment"), this.webhooksMethod.bind(this));
    // router.delete(route, ...userTokenValidators, Validators.Required("subscriptionID"), this.deleteMethod.bind(this));
    router.post(apiPrefix + "/payment", Validators.Required("payment"), this.payMethod.bind(this));
    router.post(apiPrefix + "/subscription", Validators.Required("payment"), this.subscriptionMethod.bind(this));
    // router.post(apiPrefix + "/stripewebhook", Validators.Required("payment"), this.webhooksMethod.bind(this));
    router.delete(route, Validators.Required("subscriptionID"), this.deleteMethod.bind(this));
  }
}

module.exports = PaymentController;
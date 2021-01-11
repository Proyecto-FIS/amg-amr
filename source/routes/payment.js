const express = require("express");
const Payment = require("../models/Payment");

//  KEYS
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOKS_PAY_INTENT_SUCCESS;

/**
 * @typedef ReturnError
 * @property {string} code.required - TODO
 */

/**
 * Register a new return from a bought product
 * @route POST /return
 * @group return - Product returns
 * @param {integer} productID - Product identifier
 * @param {integer} deliveryID - Delivery identifier
 * @param {string}  userToken.body.required  - TODO
 * @returns {null} 200 - Return registered successfully
 * @returns {ReturnError} default - Unexpected error
 */
const payMethod = async (req, res) => {
    const {email} = req.body;
    const {price} = req.body;
    const {billing_profile_id} = req.body;
    // const {price} = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: price*100,
        currency: 'eur',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
        receipt_email: email,
      });

      // delete req.body.profile._id;        // Ignore _id to prevent key duplication
      //   req.body.profile.userID = req.query.userID;
      //   new Payment(req.body.profile)
      //   .save()
      //   .then(doc => res.status(200).send(doc._id))
      //   .catch(err => res.status(500).json({ reason: "Database error" }));

      res.json({'client_secret': paymentIntent['client_secret']})
};

const subscriptionMethod = async (req, res) => {
    const {email, payment_method} = req.body;


  // TODO: Si no existe lo creo, y si existe siplementa traigo el customer_id
  const customer = await stripe.customers.create({
    payment_method: payment_method,
    email: email,
    invoice_settings: {
      default_payment_method: payment_method,
    },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan: 'price_1I6WlbF99Rt15XIeiCCSKKPv'}],
    expand: ['latest_invoice.payment_intent']
  });
  const status = subscription['latest_invoice']['payment_intent']['status'] 
  const client_secret = subscription['latest_invoice']['payment_intent']['client_secret']

  res.json({'client_secret': client_secret, 'status': status});
}

const webhooksMethod = (req, res) => {
// app.post('/webhooks', (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const email = event['data']['object']['receipt_email'] // contains the email that will recive the recipt for the payment (users email usually)
        console.log(`PaymentIntent was successful for ${email}!`)
        break;
      }
      default:
        // Unexpected event type
        return res.status(400).end();
    }
  
    // Return a 200 response to acknowledge receipt of the event
    res.json({received: true});
};

module.exports.register = (apiPrefix, router) => {
    // router.post(apiPrefix + "/return", postMethod);
    router.post(apiPrefix + "/payment", payMethod);
    router.post(apiPrefix + "/subscription", subscriptionMethod);
    router.post(apiPrefix + "/return", webhooksMethod);
}
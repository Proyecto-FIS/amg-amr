const createCircuitBreaker = require("./CircuitBreaker").createCircuitBreaker;

module.exports.stripePaymentIntentsCreate = createCircuitBreaker({
    name: "stripePaymentIntentsCreate",
    errorThreshold: 20,
    timeout: 20000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (stripe, data) => stripe.paymentIntents.create(data),
    fallback: (err, args) => {
        console.log(err);
        if (err && err.isAxiosError) throw err;
        throw {
            response: {
                status: 503,
            },
        };
    },
});

module.exports.stripePaymentMethodsAttach = createCircuitBreaker({
    name: "stripePaymentMethodsAttach",
    errorThreshold: 20,
    timeout: 20000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (stripe, payment_method_id, data) => stripe.paymentMethods.attach(payment_method_id, data),
    fallback: (err, args) => {
        console.log(err);
        if (err && err.isAxiosError) throw err;
        throw {
            response: {
                status: 503,
            },
        };
    },
});

module.exports.stripeCustomersUpdate = createCircuitBreaker({
    name: "stripeCustomersUpdate",
    errorThreshold: 20,
    timeout: 20000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (stripe, id, data) => stripe.customers.update(id, data),
    fallback: (err, args) => {
        console.log(err);
        if (err && err.isAxiosError) throw err;
        throw {
            response: {
                status: 503,
            },
        };
    },
});

module.exports.stripeSubscriptionsCreate = createCircuitBreaker({
    name: "stripeSubscriptionsCreate",
    errorThreshold: 20,
    timeout: 20000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (stripe, data) => stripe.subscriptions.create(data),
    fallback: (err, args) => {
        console.log(err);
        if (err && err.isAxiosError) throw err;
        throw {
            response: {
                status: 503,
            },
        };
    },
});

module.exports.stripeWebhooksConstructEvent = createCircuitBreaker({
    name: "stripeWebhooksConstructEvent",
    errorThreshold: 20,
    timeout: 20000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (stripe, body, sig, endpointSecret) => stripe.webhooks.constructEvent(body, sig, endpointSecret),
    fallback: (err, args) => {
        console.log(err);
        if (err && err.isAxiosError) throw err;
        throw {
            response: {
                status: 503,
            },
        };
    },
});

module.exports.stripeSubscriptionsDel = createCircuitBreaker({
    name: "stripeSubscriptionsDel",
    errorThreshold: 20,
    timeout: 20000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (stripe, id) => stripe.subscriptions.del(id),
    fallback: (err, args) => {
        console.log(err);
        if (err && err.isAxiosError) throw err;
        throw {
            response: {
                status: 503,
            },
        };
    },
});

const hystrixjs = require("hystrixjs");
const CommandFactory = hystrixjs.commandFactory;
const hystrixSSEStream = hystrixjs.hystrixSSEStream;
const dashboard = require("hystrix-dashboard");

module.exports.createCircuitBreaker = (service) => {

    const fallback = (err, args) => Promise.resolve(service.fallback(err, args));

    return CommandFactory.getOrCreate(service.name)
        .circuitBreakerErrorThresholdPercentage(service.errorThreshold)     // Percentage of errors (eg. 10 for 10%) needed to open the circuit
        .circuitBreakerRequestVolumeThreshold(service.healthRequests)       // Number of concurrent requests to exceed before testing service health
        .circuitBreakerSleepWindowInMilliseconds(service.sleepTimeMS)       // Time to wait leaving the circuit open before testing its health
        .statisticalWindowLength(10000)
        .statisticalWindowNumberOfBuckets(10)
        .requestVolumeRejectionThreshold(service.maxRequests)               // Maximum number of concurrent requests (0 = unlimited)
        .timeout(service.timeout)                                           // In milliseconds
        .run(service.request)
        .fallbackTo(fallback)
        .errorHandler(service.errorHandler)                                 // Count the request as error? (only for metrics)
        .build();
};

module.exports.initHystrixDashboard = (app) => {
    app.use("/hystrix", dashboard({
        idleTimeout: 4000,  // Will emit ping if no data comes within 4 seconds,
        interval: 2000,     // Interval to collect metrics
        proxy: true,        // Enable proxy for stream
    }));
}

const mongoose = require("mongoose");
const Subscription = require("../../source/models/Subscription");
const utils = require("../utils");
const makeRequest = utils.makeRequest;
const DatabaseConnection = require("../../source/DatabaseConnection");

describe("SubscriptionController API", () => {

    const testURL = "/api/v1/subscription";
    const test_transaction_subscription_id = "sub_test_Ii6Wx96kiwqKpW"
    const test_payment_method_id = "pm_1IDvKQF99Rt15XIeLnttpwvd"
    const db = new DatabaseConnection();
    let userToken, userID;
    let testSubscription;

    beforeAll(async () => {
        const user = await utils.authTestUser();
        userToken = user.userToken;
        userID = user.userID;
        await db.setup();

        testSubscription = {
            userID,
            timestamp: new Date().toISOString(),
            products: [{
                _id: mongoose.Types.ObjectId(1).toHexString(),
                quantity: 12,
                unitPriceEuros: 4,
                stripe_id_product: "prod_IpWKDsMv16VeQu",
                stripe_id_price: "price_1IDsymF99Rt15XIe8h81fgwC",
            }],
            transaction_subscription_id: test_transaction_subscription_id,
            payment_method_id: test_payment_method_id,
            price: 23,
            billing_profile_id: mongoose.Types.ObjectId(100).toHexString(),
        }
    });

    afterAll(() => db.close());

    beforeEach(done => mongoose.connection.dropCollection("subscriptions", err => done()));

    test("Correct create, get and delete subscription", () => {
        return new Subscription(testSubscription)
            .save()
            .then(() => {
                return makeRequest()
                    .get(testURL)
                    .query({
                        userToken,
                        transaction_subscription_id: test_transaction_subscription_id
                    });
            })
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.length).toBe(1);
                expect(response.body[0].timestamp).toBe(testSubscription.timestamp);
                expect(response.body[0].price).toBe(testSubscription.price);
                expect(response.body[0].billing_profile_id).toBe(testSubscription.billing_profile_id);
                expect(response.body[0].products).toMatchObject(testSubscription.products);
                expect(response.body[0].transaction_subscription_id).toBe(testSubscription.transaction_subscription_id);
                expect(response.body[0].payment_method_id).toBe(testSubscription.payment_method_id);

                return makeRequest()
                    .delete(testURL)
                    .query({
                        userToken,
                        subscriptionID: response.body[0]._id
                    });
            })
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body).toMatchObject({});

                return makeRequest()
                    .get(testURL)
                    .query({
                        userToken,
                    });
            })
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.length).toBe(0);
            });
    });
});
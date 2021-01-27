const mongoose = require("mongoose");
const Payment = require("../../source/models/Payment");
const utils = require("../utils");
const makeRequest = utils.makeRequest;
const DatabaseConnection = require("../../source/DatabaseConnection");

describe("PaymentController API", () => {

    const testURL = "/api/v1/payment";
    const test_transaction_payment_id = "pi_1DjoqZ2eZvKYlo2C8S44Wk8m"
    const db = new DatabaseConnection();
    let userToken, userID;
    let testPayment;

    beforeAll(async () => {
        const user = await utils.authTestUser();
        userToken = user.userToken;
        userID = user.userID;
        await db.setup();

        testPayment = {
            userID,
            timestamp: new Date().toISOString(),
            products: [{
                _id: mongoose.Types.ObjectId(1).toHexString(),
                quantity: 12,
                unitPriceEuros: 4
            }],
            transaction_payment_id: test_transaction_payment_id,
            price: 23,
            billing_profile_id: mongoose.Types.ObjectId(100).toHexString(),
        }
    });

    afterAll(() => db.close());

    beforeEach(done => mongoose.connection.dropCollection("payments", err => done()));

    test("Correct create, get and delete payment", () => {
        return new Payment(testPayment)
            .save()
            .then(() => {
                return makeRequest()
                    .get(testURL)
                    .query({
                        userToken,
                        transaction_payment_id: test_transaction_payment_id
                    });
            })
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.length).toBe(1);
                expect(response.body[0].timestamp).toBe(testPayment.timestamp);
                expect(response.body[0].price).toBe(testPayment.price);
                expect(response.body[0].billing_profile_id).toBe(testPayment.billing_profile_id);
                expect(response.body[0].products).toMatchObject(testPayment.products);
                expect(response.body[0].transaction_payment_id).toBe(testPayment.transaction_payment_id);

                return makeRequest()
                    .delete(testURL)
                    .query({
                        userToken
                    });
            })
            .then(response => {
                expect(response.status).toBe(204);
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
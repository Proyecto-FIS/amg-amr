const mongoose = require("mongoose");
const SubscriptionEntry = require("../../source/models/SubscriptionEntry");
const utils = require("../utils");
const makeRequest = utils.makeRequest;
const DatabaseConnection = require("../../source/DatabaseConnection");

describe("SubscriptionController API", () => {

    const testURL = "/api/v1/subscription";
    const db = new DatabaseConnection();
    let userToken, userID;

    beforeAll(async () => {
        const user = await utils.authTestUser();
        userToken = user.userToken;
        userID = user.userID;
        await db.setup();
    });

    afterAll(() => db.close());

    beforeEach(done => mongoose.connection.dropCollection("subscription", err => done()));

    test("Wrong user", () => {
        return makeRequest()
            .get(testURL)
            .query({
                userToken: "Wrongtoken123",
                beforeTimestamp: new Date(),
                pageSize: 10
            })
            .expect(401, { reason: "Authentication failed" });
    });

    test("Missing fields", () => {
        return makeRequest()
            .get(testURL)
            .query({ userToken })
            .expect(400, { reason: "Missing fields" })
            .then(() => {
                return makeRequest()
                    .get(testURL)
                    .query({
                        userToken,
                        beforeTimestamp: new Date()
                    })
                    .expect(400, { reason: "Missing fields" });
            })
    });

    test("Correct user and has entries", () => {

        const testEntry = {
            userID,
            timestamp: new Date().toISOString(),
            price: 19.40,
            is_active: true,
            paypal_subscription_id: "TESTESTESTESTEST",
            products: [
                {
                    _id: mongoose.Types.ObjectId(1).toHexString(),
                    quantity: 12,
                    unitPriceEuros: 4
                }
            ]
        };

        return new SubscriptionEntry(testEntry)
        .save()
        .then(() => {
            return makeRequest()
                .get(testURL)
                .query({
                    userToken,
                    beforeTimestamp: new Date(),
                    pageSize: 10
                })
        })
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].timestamp).toBe(testEntry.timestamp);
            expect(response.body[0].is_active).toBe(testEntry.is_active);
            expect(response.body[0].price).toBe(testEntry.price);
            expect(response.body[0].paypal_subscription_id).toBe(testEntry.paypal_subscription_id);
            expect(response.body[0].products).toMatchObject(testEntry.products);
        });
    });
});

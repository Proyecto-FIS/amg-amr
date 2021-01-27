const Subscription = require("../../source/models/Subscription");
const utils = require("../utils");
const makeRequest = utils.makeRequest;
const mongoose = require("mongoose");
const DatabaseConnection = require("../../source/DatabaseConnection");

describe("PaymentController", () => {

    const testURL = "/api/v1/payment";
    const testBillingURL = "/api/v1/billing-profile";
    const test_transaction_payment_id = "pi_1DjoqZ2eZvKYlo2C8S44Wk8m"
    const db = new DatabaseConnection();
    let userToken, userID;
    let testSubscription;
    let testProds;

    beforeAll(async () => {
        const user = await utils.authTestUser();
        testProds = await utils.getTestProduct();
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

    test("Unauthorized in GET", () => {
        return makeRequest()
            .get(testURL)
            .query({
                userToken: "Wrongtoken123",
            })
            .expect(401, {
                reason: "Authentication failed"
            });
    });

    test("Unauthorized in POST", () => {
        return makeRequest()
            .post(testURL)
            .query({
                userToken: "Wrongtoken123",
            })
            .expect(401, {
                reason: "Authentication failed"
            });
    });


    test("Unauthorized in DELETE", () => {
        return makeRequest()
            .delete(testURL)
            .query({
                userToken: "Wrongtoken123",
            })
            .expect(401, {
                reason: "Authentication failed"
            });
    });

    test("Missing profile in POST", () => {
        return makeRequest()
            .post(testURL)
            .query({
                userToken
            })
            .expect(400, {
                reason: "Missing fields"
            });
    });


    test("Correct payment CRUD", () => {

        const prod1 = testProds.data[0];
        prod1.format = prod1.format[0].name;
        prod1.quantity = 1;
        const samplePayment = {
            products: [prod1],
        };

        const sampleProfile = {
            name: "someName",
            surname: "someSurname",
            address: "someAddress",
            city: "someCity",
            province: "someProvince",
            country: "someCountry",
            zipCode: 12345,
            phoneNumber: 123456789,
            email: "email@email.com",
        };

        return makeRequest()
            .post(testBillingURL)
            .query({
                userToken
            })
            .send({
                profile: sampleProfile
            })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
                profileID = response.body;
                sampleProfile["_id"] = mongoose.Types.ObjectId(profileID);
                return makeRequest()
                    .post(testURL)
                    .query({
                        userToken
                    })
                    .send({
                        billingProfile: sampleProfile,
                        payment: samplePayment,
                    })
                    .expect(200);
            })
            .then(response => {
                expect(response.body).toHaveProperty("client_secret");
                return makeRequest()
                    .delete(testBillingURL)
                    .query({
                        userToken,
                        profileID
                    })
                    .expect(200);
            })
            .then(response => {
                return makeRequest()
                    .delete(testURL)
                    .query({
                        userToken
                    })
                    .expect(204);
            })
    }, 800000);
});
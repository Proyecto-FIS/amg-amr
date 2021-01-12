const DatabaseConnection = require("../../source/DatabaseConnection");
const SubscriptionController = require("../../source/routes/SubscriptionController");
const mongoose = require("mongoose");
const utils = require("../utils");
const request = require("supertest");

describe("SubscriptionController", () => {

    const testURL = "/subscription";
    const db = new DatabaseConnection();
    let app, controller;

    // Preload data
    let preload1;
    const preloadSubscriptions = 5;
    const sampleProduct = {
        _id: mongoose.Types.ObjectId(1).toHexString(),
        quantity: 5,
        unitPriceEuros: 20
    };


    beforeAll(() => {

        // Create controller
        controller = new SubscriptionController(testURL, utils.mockedRouter());
        app = utils.createExpressApp(controller, testURL);

        // Create database preload for some tests
        preload1 = [];
        for (let i = 0; i < preloadSubscriptions; i++) {
            preload1.push({
                userID: mongoose.Types.ObjectId(i).toHexString(),
                timestamp: new Date().toISOString(),
                price: 120,
                products: [sampleProduct],
                is_active: true
            });
        }

        return db.setup();
    });

    beforeEach(done => mongoose.connection.dropCollection("subscriptions", err => done()));

    afterAll(() => db.close());

    test("Write & read single entry", () => {

        const userID = mongoose.Types.ObjectId(1).toHexString();
        const now = new Date().toISOString();

        // Expected result from GET request
        const expectedResult = {
            timestamp: now,
            price: 120,
            products: [sampleProduct],
            is_active: true
        };

        // Subscription to be added
        const testSubscription = {
            userID: userID,
            timestamp: now,
            price: expectedResult.price,
            products: expectedResult.products,
            is_active: expectedResult.is_active
        };

        // Create a new subscription entry
        return controller.createSubscription(testSubscription)
            .then(() => {
                return request(app)
                    .get(testURL)
                    .query({
                        userID: userID,
                        beforeTimestamp: new Date(),
                        pageSize: 5
                    })
                    .expect(200);
            })
            .then(response => {
                const data = response.body;

                expect(data.length).toBe(1);
                expect(data[0].timestamp).toStrictEqual(expectedResult.timestamp);
                expect(data[0].price).toBe(expectedResult.price);
                expect(data[0].is_active).toBe(expectedResult.is_active);
                expect(data[0].products).toMatchObject(expectedResult.products);
                expect(data[0].userID).toBeUndefined();
            })
    });

    test("Should return empty set", () => {

        return request(app)
            .get(testURL)
            .query({
                userID: mongoose.Types.ObjectId().toHexString(),
                beforeTimestamp: new Date(),
                pageSize: 10
            })
            .expect(200, []);
    });

    test("Missing user", () => {

        // Preload database
        return controller.createSubscriptions(preload1)
            .then(() => {
                return request(app)
                    .get(testURL)
                    .query({
                        userID: mongoose.Types.ObjectId(preloadSubscriptions + 1).toHexString(),
                        beforeTimestamp: new Date(),
                        pageSize: 10
                    })
                    .expect(200, []);
            });
    });

    test("Multiple entries & selection by date and user", () => {

        const thresholdDate = Date.now();

        // Preload database
        return controller.createSubscriptions(preload1)
            .then(() => {

                // Additional entry for user with entries
                return controller.createSubscription({
                    userID: preload1[0].userID,
                    timestamp: new Date(thresholdDate + 100),
                    price: 120,
                    products: [sampleProduct],
                    is_active: true
                })
            })
            .then(() => {
                return request(app)
                    .get(testURL)
                    .query({
                        userID: preload1[0].userID,
                        beforeTimestamp: thresholdDate,
                        pageSize: 10
                    })
                    .expect(200);
            })
            .then(response => {
                const data = response.body;
                expect(data.length).toBe(1); // Should return the entry before thresholdDate
                expect(data[0].timestamp).toStrictEqual(preload1[0].timestamp);
                expect(data[0].price).toBe(preload1[0].price);
                expect(data[0].is_active).toBe(preload1[0].is_active);
                expect(data[0].products).toMatchObject(preload1[0].products);
            });
    });

    test("Page size limits", () => {

        const userID = mongoose.Types.ObjectId(100).toHexString();
        const pageSize = 3;
        let modPreload = [];
        for (let i = 0; i < preloadSubscriptions; i++) {
            modPreload.push({
                ...preload1[i]
            });
            modPreload[i].userID = userID;
        }

        return controller.createSubscriptions(modPreload)
            .then(() => {
                return request(app)
                    .get(testURL)
                    .query({
                        userID: userID,
                        beforeTimestamp: new Date(),
                        pageSize: pageSize
                    })
                    .expect(200);
            })
            .then(response => {
                expect(response.body.length).toBe(pageSize);
            })
    });

    test("Delete subscription in unexisting user", () => {
        return controller.createSubscriptions(preload1)
            .then(() => {
                return request(app)
                    .delete(testURL)
                    .query({
                        userID: mongoose.Types.ObjectId().toHexString(),
                    })
                    .expect(204);
            })
            .then(response => {
                expect(response.body).toMatchObject({});

                const requests = preload1.map((v, i) => {
                    return request(app)
                        .get(testURL)
                        .query({
                            userID: v.userID,
                            beforeTimestamp: new Date(),
                            pageSize: 1
                        })
                        .expect(200);
                });

                return Promise.all(requests);
            })
            .then(responses => {
                responses.forEach((response, i) => {
                    expect(response.body.length).toBe(1);
                });
            });
    });

    test("Delete subscription for user", () => {
        return controller.createSubscriptions(preload1)
            .then(() => {
                return request(app)
                    .delete(testURL)
                    .query({
                        userID: preload1[0].userID
                    })
                    .expect(204);
            })
            .then(response => {
                expect(response.body).toMatchObject({});
                const requests = preload1.map((v, i) => {
                    return request(app)
                        .get(testURL)
                        .query({
                            userID: v.userID,
                            beforeTimestamp: new Date(),
                            pageSize: 1
                        })
                        .expect(200);
                });

                return Promise.all(requests);
            })
            .then(responses => {
                responses.forEach((response, i) => {
                    expect(response.body.length).toBe(i === 0 ? 0 : 1);
                });
            });
    });


    ///////////////////////////////////////////////////////////////
    ////////////////////////// Other tests ////////////////////////
    ///////////////////////////////////////////////////////////////

    // // Preload data
    // const users = [mongoose.Types.ObjectId(100).toHexString(), mongoose.Types.ObjectId(200).toHexString()];
    // const preload = [{
    //         products: [sampleProduct],
    //         is_active: true,
    //         transaction_subscription_id: "sub_IkCQQsDnUpEljN",
    //         price: 120,
    //         billing_profile_id: 1,
    //         payment_method_id: "pm_1I8i1VKrHcehiALDJ1uTJvwx",
    //     },
    //     {
    //         products: [sampleProduct],
    //         is_active: true,
    //         transaction_subscription_id: "sub_IkCQQsDnUpEljN",
    //         price: 600,
    //         billing_profile_id: 1,
    //         payment_method_id: "pm_1I8i1VKrHcehiALDJ1uTJvwx",
    //     },
    // ];

    // test("Missing fields in write", () => {
    //     return request(app)
    //         .post(testURL)
    //         .query({
    //             userID: mongoose.Types.ObjectId().toHexString()
    //         })
    //         .send({
    //             subscription: {
    //                 transaction_subscription_id: "sub_AtCQQsTnUpElkR",
    //                 price: 1234
    //                 // Missing fields
    //             }
    //         })
    //         .expect(500, {
    //             reason: "Database error"
    //         });
    // });


    // // TODO: refactor test
    // test("Write & read, filtering by user", () => {

    //     return request(app)
    //         .post(testURL)
    //         .query({
    //             userID: users[0]
    //         })
    //         .send({
    //             subscription: {
    //                 ...preload[0]
    //             }
    //         })
    //         .expect(200)
    //         .then(response => {
    //             expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
    //             return request(app)
    //                 .post(testURL)
    //                 .query({
    //                     userID: users[1]
    //                 })
    //                 .send({
    //                     subscription: {
    //                         ...preload[1]
    //                     }
    //                 })
    //                 .expect(200)
    //         })
    //         .then(response => {
    //             expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
    //             return request(app)
    //                 .get(testURL)
    //                 .query({
    //                     userID: users[0]
    //                 })
    //                 .expect(200);
    //         })
    //         .then(response => {
    //             const data = response.body;
    //             expect(data.length).toBe(1);
    //             expect(data[0].userID).toBeUndefined();
    //             expect(data[0]).toMatchObject(preload[0]);
    //         })
    // });

    // test("Update existing subscription", () => {

    //     const newEmail = "updatedemail@email.com";

    //     return request(app)
    //         .post(testURL)
    //         .query({
    //             userID: users[0]
    //         })
    //         .send({
    //             subscription: {
    //                 ...preload[0]
    //             }
    //         })
    //         .expect(200)
    //         .then(response => {
    //             expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
    //             return request(app)
    //                 .put(testURL)
    //                 .query({
    //                     userID: users[0]
    //                 })
    //                 .send({
    //                     subscription: {
    //                         _id: response.body,
    //                         email: newEmail, // Updated field
    //                     }
    //                 })
    //                 .expect(200);
    //         })
    //         .then(response => {
    //             expect(response.body.email).toBe(newEmail);
    //         });
    // });

    // test("Updating subscription from other user", () => {

    //     return request(app)
    //         .post(testURL)
    //         .query({
    //             userID: users[0]
    //         })
    //         .send({
    //             subscription: {
    //                 ...preload[0]
    //             }
    //         })
    //         .expect(200)
    //         .then(response => {
    //             expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
    //             return request(app)
    //                 .put(testURL)
    //                 .query({
    //                     userID: users[1]
    //                 })
    //                 .send({
    //                     subscription: {
    //                         _id: response.body,
    //                         email: "newmail@email.com", // Updated field
    //                     }
    //                 })
    //                 .expect(401);
    //         });
    // });


});
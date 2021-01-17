const DatabaseConnection = require("../../source/DatabaseConnection");
const HistoryController = require("../../source/routes/HistoryController");
const mongoose = require("mongoose");
const utils = require("../utils");
const request = require("supertest");

describe("HistoryController", () => {

    const testURL = "/history";
    const db = new DatabaseConnection();
    let app, controller;

    // Preload data
    let preload;
    const preloadEntries = 5;
    const sampleProduct = {
        _id: mongoose.Types.ObjectId(1).toHexString(),
        quantity: 5,
        unitPriceEuros: 20
    };

    beforeAll(() => {

        // Create controller
        controller = new HistoryController(testURL, utils.mockedRouter());
        app = utils.createExpressApp(controller, testURL);

        // Create database preload for some tests
        preload = [];
        for (let i = 0; i < preloadEntries; i++) {
            preload.push({
                userID: mongoose.Types.ObjectId(i).toHexString(),
                timestamp: new Date().toISOString(),
                operationType: "payment",
                products: [sampleProduct],
                transaction_id: "123"
            });
        }

        return db.setup();
    });

    beforeEach(done => mongoose.connection.dropCollection("historyentries", err => done()));

    afterAll(() => db.close());

    test("Write & read single entry", () => {

        const userID = mongoose.Types.ObjectId(1).toHexString();
        const now = new Date().toISOString();

        // Expected result from GET request
        const expectedResult = {
            timestamp: now,
            operationType: "payment",
            products: [sampleProduct],
            transaction_id: "123"
        };

        // Entry to be added
        const testEntry = {
            userID: userID,
            timestamp: now,
            operationType: expectedResult.operationType,
            products: expectedResult.products,
            transaction_id: expectedResult.transaction_id
        };

        // Create a new history entry
        return controller.createEntry(testEntry)
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
                expect(data[0].operationType).toBe(expectedResult.operationType);
                expect(data[0].products).toMatchObject(expectedResult.products);
                expect(data[0].transaction_id).toBe(expectedResult.transaction_id);
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
        return controller.createEntries(preload)
            .then(() => {
                return request(app)
                    .get(testURL)
                    .query({
                        userID: mongoose.Types.ObjectId(preloadEntries + 1).toHexString(),
                        beforeTimestamp: new Date(),
                        pageSize: 10
                    })
                    .expect(200, []);
            });
    });

    test("Multiple entries & selection by date and user", () => {
        
        const thresholdDate = Date.now();

        // Preload database
        return controller.createEntries(preload)
            .then(() => {

                // Additional entry for user with entries
                return controller.createEntry({
                    userID: preload[0].userID,
                    timestamp: new Date(thresholdDate + 100),
                    operationType: "payment",
                    products: [sampleProduct],
                    transaction_id: "123"
                })
            })
            .then(() => {
                return request(app)
                    .get(testURL)
                    .query({
                        userID: preload[0].userID,
                        beforeTimestamp: thresholdDate,
                        pageSize: 10
                    })
                    .expect(200);
            })
            .then(response => {
                const data = response.body;
                expect(data.length).toBe(1);    // Should return the entry before thresholdDate
                expect(data[0].timestamp).toStrictEqual(preload[0].timestamp);
                expect(data[0].operationType).toBe(preload[0].operationType);
                expect(data[0].products).toMatchObject(preload[0].products);
                expect(data[0].transaction_id).toBe(preload[0].transaction_id);
            });
    });

    test("Page size limits", () => {

        const userID = mongoose.Types.ObjectId(100).toHexString();
        const pageSize = 3;
        let modPreload = [];
        for(let i = 0; i < preloadEntries; i++) {
            modPreload.push({ ...preload[i] });
            modPreload[i].userID = userID;
        }

        return controller.createEntries(modPreload)
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

    test("Delete history in unexisting user", () => {
        return controller.createEntries(preload)
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

                const requests = preload.map((v, i) => {
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

    test("Delete history for user", () => {
        return controller.createEntries(preload)
            .then(() => {
                return request(app)
                    .delete(testURL)
                    .query({
                        userID: preload[0].userID
                    })
                    .expect(204);
            })
            .then(response => {
                expect(response.body).toMatchObject({});
                const requests = preload.map((v, i) => {
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
});

const mongoose = require("mongoose");
const HistoryEntry = require("../../source/models/HistoryEntry");
const utils = require("../utils");
const makeRequest = utils.makeRequest;
const DatabaseConnection = require("../../source/DatabaseConnection");

describe("HistoryController API", () => {

    const testURL = "/api/v1/history";
    const db = new DatabaseConnection();
    let userToken, userID;
    let testEntry;

    beforeAll(async () => {
        const user = await utils.authTestUser();
        userToken = user.userToken;
        userID = user.userID;
        await db.setup();

        testEntry = {
            userID,
            timestamp: new Date().toISOString(),
            operationType: "payment",
            products: [
                {
                    _id: mongoose.Types.ObjectId(1).toHexString(),
                    quantity: 12,
                    unitPriceEuros: 4
                }
            ]
        };
    });

    afterAll(() => db.close());

    beforeEach(done => mongoose.connection.dropCollection("historyentries", err => done()));

    test("Wrong user in GET", () => {
        return makeRequest()
            .get(testURL)
            .query({
                userToken: "Wrongtoken123",
                beforeTimestamp: new Date(),
                pageSize: 10
            })
            .expect(401, { reason: "Authentication failed" });
    });

    test("Wrong user in DELETE", () => {
        return makeRequest()
            .delete(testURL)
            .query({
                userToken: "Wrongtoken123",
            })
            .expect(401, { reason: "Authentication failed" });
    });

    test("Missing fields in GET", () => {
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

    test("Missing fields in DELETE", () => {
        return makeRequest()
            .delete(testURL)
            .expect(400, { reason: "Missing fields" });
    });

    test("Correct user and has entries", () => {
        return new HistoryEntry(testEntry)
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
                expect(response.body[0].operationType).toBe(testEntry.operationType);
                expect(response.body[0].products).toMatchObject(testEntry.products);
            });
    });

    test("Correct DELETE", () => {
        return new HistoryEntry(testEntry)
            .save()
            .then(() => {
                return makeRequest()
                    .get(testURL)
                    .query({
                        userToken,
                        beforeTimestamp: new Date(),
                        pageSize: 1
                    });
            })
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.length).toBe(1);
                expect(response.body[0].timestamp).toBe(testEntry.timestamp);
                expect(response.body[0].operationType).toBe(testEntry.operationType);
                expect(response.body[0].products).toMatchObject(testEntry.products);

                return makeRequest()
                    .delete(testURL)
                    .query({ userToken });
            })
            .then(response => {
                expect(response.status).toBe(204);
                expect(response.body).toMatchObject({});

                return makeRequest()
                    .get(testURL)
                    .query({
                        userToken,
                        beforeTimestamp: new Date(),
                        pageSize: 1
                    });
            })
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.length).toBe(0);
            });
    });
});

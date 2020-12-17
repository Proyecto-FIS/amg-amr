const App = require("../../source/App");
const mongoose = require("mongoose");
const axios = require("axios");
const HistoryEntry = require("../../source/models/HistoryEntry");

describe("HistoryController API", () => {

    const testURL = `http://localhost:${process.env.PORT}/api/v1/history`;
    let server = new App();
    let userToken;
    let userID;

    beforeAll((done) => {
        axios.post(`${process.env.USERS_MS}/auth/login`, {
            username: process.env.TEST_USERNAME,
            password: process.env.TEST_PASSWORD
        })
        .then(response => {
            userToken = response.data.token;
            return axios.get(`${process.env.USERS_MS}/auth/${userToken}`);
        })
        .then(response => {
            userID = response.data.account_id;
            server.run(done);
        })
        .catch(err => done.fail("Test user has not logged in: " + err));
    });

    afterAll(done => server.stop(done));
    beforeEach(done => mongoose.connection.dropCollection("historyentries", err => done()));

    test("Wrong user", () => {
        return axios.get(testURL, {
            params: {
                userToken: "Wrongtoken123",
                beforeTimestamp: new Date(),
                pageSize: 10
            }
        })
        .then(response => fail(`Unexpected success: ${response}`))
        .catch(err => {
            expect(err.response.status).toBe(401);
            expect(err.response.data.reason).toBe("Authentication failed");
        });
    });

    test("Missing fields", () => {
        return axios.get(testURL, {
            params: {
                userToken
            }
        })
        .then(response => fail(`Unexpected success: ${response}`))
        .catch(err => {
            expect(err.response.status).toBe(400);
            expect(err.response.data.reason).toBe("Missing fields");
            return axios.get(testURL, {
                params: {
                    userToken,
                    beforeTimestamp: new Date()
                }
            });
        })
        .then(response => fail(`Unexpected success: ${response}`))
        .catch(err => {
            expect(err.response.status).toBe(400);
            expect(err.response.data.reason).toBe("Missing fields");
        });
    });

    test("Correct user and has entries", () => {

        const testEntry = {
            userID,
            timestamp: new Date(),
            operationType: "payment",
            products: [
                {
                    _id: mongoose.Types.ObjectId(1),
                    quantity: 12,
                    unitPriceEuros: 4
                }
            ]
        };

        return new HistoryEntry(testEntry)
        .save()
        .then(() => {
            return axios.get(testURL, {
                params: {
                    userToken,
                    beforeTimestamp: new Date(),
                    pageSize: 10
                }
            });
        })
        .then(response => {

            // Serialize expected data to string to compare with the response
            testEntry.products[0]._id = testEntry.products[0]._id.toHexString();
            testEntry.timestamp = testEntry.timestamp.toISOString();

            expect(response.status).toBe(200);
            expect(response.data.length).toBe(1);
            expect(response.data[0].timestamp).toBe(testEntry.timestamp);
            expect(response.data[0].operationType).toBe(testEntry.operationType);
            expect(response.data[0].products).toMatchObject(testEntry.products);
        });
    });
});

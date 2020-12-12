const DatabaseConnection = require("../../source/DatabaseConnection");
const HistoryController = require("../../source/routes/HistoryController");
const mongoose = require("mongoose");

describe("HistoryController", () => {

    const db = new DatabaseConnection();

    beforeAll((done) => {
        db.setup(() => {
            mongoose.connection.dropCollection("historyentries", err => done());
        });
    });

    afterAll((done) => {
        db.close(done);
    });

    test("Write & read single entry", (done) => {

        const userID = mongoose.Types.ObjectId(1);
        const now = new Date();

        // Expected result from GET request
        const expectedResult = {
            timestamp: now,
            operationType: "payment",
            products: [
                {
                    _id: mongoose.Types.ObjectId(1),
                    quantity: 5,
                    unitPriceEuros: 20
                }
            ]
        };

        // Create route controller
        const mockedRouter = {
            get: (path, ...middlewares) => { }
        };

        const controller = new HistoryController("test", mockedRouter);

        // Entry to be added
        const testEntry = {
            userID: userID,
            timestamp: now,
            operationType: expectedResult.operationType,
            products: expectedResult.products
        };

        // Create a new history entry
        controller.createEntry(testEntry)
            .then(() => {

                // Create a mock for response object
                let mockedRes = {};
                mockedRes.status = jest.fn().mockReturnValue(mockedRes);
                mockedRes.json = jest.fn().mockImplementation((data) => {
                    expect(data.length).toBe(1);
                    expect(data[0].timestamp).toStrictEqual(expectedResult.timestamp);
                    expect(data[0].operationType).toBe(expectedResult.operationType);
                    expect(data[0].products).toMatchObject(expectedResult.products);
                    done();
                });

                // Get the created entry
                controller.getMethod({
                    body: {
                        userID: userID,
                        beforeTimestamp: Date.now(),
                        pageSize: 5
                    }
                }, mockedRes);
            });
    });

    test("Missing user", () => {
        // TODO
    });

    test("Should return empty set", () => {
        // TODO
    });

    test("Multiple entries & selection by date", () => {
        // TODO
    });

    test("Multiple entries & selection by user", () => {
        // TODO
    });
});

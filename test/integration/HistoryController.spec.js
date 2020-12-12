const DatabaseConnection = require("../../source/DatabaseConnection");
const HistoryController = require("../../source/routes/HistoryController");
const mongoose = require("mongoose");

describe("HistoryController", () => {

    const db = new DatabaseConnection();
    let controller;
    let mockedRes;
    let preload;
    const preloadEntries = 5;
    const sampleProduct = {
        _id: mongoose.Types.ObjectId(1),
        quantity: 5,
        unitPriceEuros: 20
    };

    beforeAll((done) => {

        // Create controller with mocked router
        const mockedRouter = {
            get: (path, ...middlewares) => { }
        };

        controller = new HistoryController("test", mockedRouter);
        
        // Create database preload for some tests
        preload = [];
        for (let i = 0; i < preloadEntries; i++) {
            preload.push({
                userID: mongoose.Types.ObjectId(i),
                timestamp: new Date(),
                operationType: "payment",
                products: [sampleProduct]
            });
        }

        db.setup(done);
    });

    beforeEach((done) => {
        mockedRes = {};
        mongoose.connection.dropCollection("historyentries", err => done());
    });

    afterAll(done => db.close(done));

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
                mockedRes.status = jest.fn().mockImplementation((code) => {
                    expect(code).toBe(200);
                    return mockedRes;
                });
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
                        beforeTimestamp: new Date(),
                        pageSize: 5
                    }
                }, mockedRes);
            });
    });

    test("Should return empty set", (done) => {

        // Create a mock for response object
        mockedRes.status = jest.fn().mockImplementation((code) => {
            expect(code).toBe(200);
            return mockedRes;
        });
        mockedRes.json = jest.fn().mockImplementation((data) => {
            expect(data.length).toBe(0);
            done();
        });

        controller.getMethod({
            body: {
                userID: mongoose.Types.ObjectId(),
                beforeTimestamp: new Date(),
                pageSize: 10
            }
        }, mockedRes);
    });

    test("Missing user", (done) => {

        // Preload database
        controller.createEntries(preload)
            .then(() => {

                // Create a mock for response object
                mockedRes.status = jest.fn().mockImplementation((code) => {
                    expect(code).toBe(200);
                    return mockedRes;
                });
                mockedRes.json = jest.fn().mockImplementation((data) => {
                    expect(data.length).toBe(0);
                    done();
                });

                // Request for an entry that should not exist
                controller.getMethod({
                    body: {
                        userID: mongoose.Types.ObjectId(preloadEntries + 1),
                        beforeTimestamp: new Date(),
                        pageSize: 10
                    }
                }, mockedRes);
            });
    });

    test("Multiple entries & selection by date and user", (done) => {
        
        let thresholdDate = Date.now();

        // Preload database
        controller.createEntries(preload)
            .then(() => {
                return controller.createEntry({
                    userID: preload[0].userID,
                    timestamp: new Date(thresholdDate + 100),
                    operationType: "payment",
                    products: [sampleProduct]
                })
            })
            .then(() => {

                // Create a mock for response object
                mockedRes.status = jest.fn().mockImplementation((code) => {
                    expect(code).toBe(200);
                    return mockedRes;
                });
                mockedRes.json = jest.fn().mockImplementation((data) => {
                    expect(data.length).toBe(1);
                    expect(data[0].timestamp).toStrictEqual(preload[0].timestamp);
                    expect(data[0].operationType).toBe(preload[0].operationType);
                    expect(data[0].products).toMatchObject(preload[0].products);
                    done();
                });

                // Request for an entry that should not exist
                controller.getMethod({
                    body: {
                        userID: preload[0].userID,
                        beforeTimestamp: thresholdDate,
                        pageSize: 10
                    }
                }, mockedRes);
            });
    });

    test("Page size limits", (done) => {

        let modPreload = preload;
        const userID = mongoose.Types.ObjectId(100);
        const pageSize = 3;
        for(let i = 0; i < preloadEntries; i++) {
            modPreload[i].userID = userID;
        }
        controller.createEntries(modPreload)
            .then(() => {

                // Create a mock for response object
                mockedRes.status = jest.fn().mockImplementation((code) => {
                    expect(code).toBe(200);
                    return mockedRes;
                });
                mockedRes.json = jest.fn().mockImplementation((data) => {
                    expect(data.length).toBe(pageSize);
                    done();
                });

                // Request for an entry that should not exist
                controller.getMethod({
                    body: {
                        userID: userID,
                        beforeTimestamp: new Date(),
                        pageSize: pageSize
                    }
                }, mockedRes);
            });
    });
});

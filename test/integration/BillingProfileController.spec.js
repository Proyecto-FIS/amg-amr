const DatabaseConnection = require("../../source/DatabaseConnection");
const BillingProfileController = require("../../source/routes/BillingProfileController");
const mongoose = require("mongoose");

describe("BillingProfileController", () => {

    const users = [mongoose.Types.ObjectId(100), mongoose.Types.ObjectId(101)];
    const preload = [
        {
            name: "someName",
            surname: "someSurname",
            address: "someAddress",
            city: "someCity",
            province: "someProvince",
            country: "someCountry",
            zipCode: 12345,
            phoneNumber: 123456789,
            email: "email@email.com",
        },
        {
            name: "Name",
            surname: "Surname",
            address: "Address",
            city: "City",
            province: "Province",
            country: "Country",
            zipCode: 54321,
            phoneNumber: 987654321,
            email: "emailus@emailus.es"
        },
    ];

    const db = new DatabaseConnection();
    let controller;
    let mockedRes;

    beforeAll((done) => {

        // Create controller with mocked router
        const mockedRouter = {
            get: (path, ...middlewares) => { },
            post: (path, ...middlewares) => { },
            put: (path, ...middlewares) => { },
            delete: (path, ...middlewares) => { }
        };

        controller = new BillingProfileController("test", mockedRouter);

        db.setup(done);
    });

    beforeEach((done) => {
        mockedRes = {};
        mongoose.connection.dropCollection("billingprofiles", err => done());
    });

    afterAll(done => db.close(done));

    test("Should return empty", done => {

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
            userID: mongoose.Types.ObjectId(),
        }, mockedRes);
    });

    test("Missing fields in write", done => {

        // Create a mock for response object
        mockedRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(500);
            return mockedRes;
        });
        mockedRes.json = jest.fn().mockImplementation(data => {
            expect(data).toMatchObject({ reason: "Database error" });
            done();
        });

        controller.postMethod({
            userID: mongoose.Types.ObjectId(),
            body: {
                profile: {
                    name: "name",
                    surname: "surname"
                    // Missing fields
                }
            }
        }, mockedRes);
    });

    test("Write & read, filtering by user", done => {

        // 3 - Get all profiles from users[0]
        let getRes = {};
        getRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(200);
            return getRes;
        });
        getRes.json = jest.fn().mockImplementation(data => {
            expect(data.length).toBe(1);
            expect(data[0].userID).toBeUndefined();
            expect(data[0]).toMatchObject(preload[0]);
            done();
        });

        // 2 - Create profile for users[1]
        let secondPostRes = {};
        secondPostRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(200);
            return secondPostRes;
        });
        secondPostRes.send = jest.fn().mockImplementation(data => {
            expect(mongoose.Types.ObjectId.isValid(data)).toBeTruthy();
            controller.getMethod({
                userID: users[0],
            }, getRes);
        });

        // 1 - Create profile for users[0]
        let firstPostRes = {};
        firstPostRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(200);
            return firstPostRes;
        });
        firstPostRes.send = jest.fn().mockImplementation(data => {
            expect(mongoose.Types.ObjectId.isValid(data)).toBeTruthy();
            controller.postMethod({
                userID: users[1],
                body: {
                    profile: {      // Hope native deep object cloning will come up soon :(
                        name: preload[1].name,
                        surname: preload[1].surname,
                        address: preload[1].address,
                        city: preload[1].city,
                        province: preload[1].province,
                        country: preload[1].country,
                        zipCode: preload[1].zipCode,
                        phoneNumber: preload[1].phoneNumber,
                        email: preload[1].email,
                    }
                }
            }, secondPostRes);
        });

        controller.postMethod({
            userID: users[0],
            body: {
                profile: {
                    name: preload[0].name,
                    surname: preload[0].surname,
                    address: preload[0].address,
                    city: preload[0].city,
                    province: preload[0].province,
                    country: preload[0].country,
                    zipCode: preload[0].zipCode,
                    phoneNumber: preload[0].phoneNumber,
                    email: preload[0].email,
                }
            }
        }, firstPostRes);
    });

    test("Update existing profile", done => {

        const newEmail = "updatedemail@email.com";

        // 2 - Update the created profile
        let putRes = {};
        putRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(200);
            return putRes;
        });
        putRes.json = jest.fn().mockImplementation(data => {
            expect(data.email).toBe(newEmail);
            done();
        });

        // 1 - Create profile for users[0]
        let postRes = {};
        postRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(200);
            return postRes;
        });
        postRes.send = jest.fn().mockImplementation(data => {
            expect(mongoose.Types.ObjectId.isValid(data)).toBeTruthy();
            controller.putMethod({
                userID: users[0],
                body: {
                    profile: {
                        _id: data,
                        email: newEmail,    // Updated field
                    }
                }
            }, putRes);
        });

        controller.postMethod({
            userID: users[0],
            body: {
                profile: {
                    name: preload[0].name,
                    surname: preload[0].surname,
                    address: preload[0].address,
                    city: preload[0].city,
                    province: preload[0].province,
                    country: preload[0].country,
                    zipCode: preload[0].zipCode,
                    phoneNumber: preload[0].phoneNumber,
                    email: preload[0].email,
                }
            }
        }, postRes);
    });

    test("Updating profile from other user", done => {

        // 2 - Update the created profile with users[1]
        let putRes = {};
        putRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(500);
            return putRes;
        });
        putRes.json = jest.fn().mockImplementation(data => {
            expect(data).toMatchObject({ reason: "Database error" });
            done();
        });

        // 1 - Create profile for users[0]
        let postRes = {};
        postRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(200);
            return postRes;
        });
        postRes.send = jest.fn().mockImplementation(data => {
            expect(mongoose.Types.ObjectId.isValid(data)).toBeTruthy();
            controller.putMethod({
                userID: users[1],
                body: {
                    profile: {
                        _id: data,
                        email: "newmail@email.com",    // Updated field
                    }
                }
            }, putRes);
        });

        controller.postMethod({
            userID: users[0],
            body: {
                profile: {
                    name: preload[0].name,
                    surname: preload[0].surname,
                    address: preload[0].address,
                    city: preload[0].city,
                    province: preload[0].province,
                    country: preload[0].country,
                    zipCode: preload[0].zipCode,
                    phoneNumber: preload[0].phoneNumber,
                    email: preload[0].email,
                }
            }
        }, postRes);
    });

    test("Delete existing profile", done => {

        // 2 - Delete the created profile
        let deleteRes = {};
        deleteRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(200);
            return deleteRes;
        });
        deleteRes.json = jest.fn().mockImplementation(data => {
            expect(data).toMatchObject(preload[0]);
            done();
        });

        // 1 - Create profile for users[0]
        let postRes = {};
        postRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(200);
            return postRes;
        });
        postRes.send = jest.fn().mockImplementation(data => {
            expect(mongoose.Types.ObjectId.isValid(data)).toBeTruthy();
            controller.deleteMethod({
                userID: users[0],
                query: {
                    profileID: data
                }
            }, deleteRes);
        });

        controller.postMethod({
            userID: users[0],
            body: {
                profile: {
                    name: preload[0].name,
                    surname: preload[0].surname,
                    address: preload[0].address,
                    city: preload[0].city,
                    province: preload[0].province,
                    country: preload[0].country,
                    zipCode: preload[0].zipCode,
                    phoneNumber: preload[0].phoneNumber,
                    email: preload[0].email,
                }
            }
        }, postRes);
    });

    test("Delete profile from other user", done => {
        
        // 2 - Delete the created profile from users[1]
        let deleteRes = {};
        deleteRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(500);
            return deleteRes;
        });
        deleteRes.json = jest.fn().mockImplementation(data => {
            expect(data).toMatchObject({ reason: "Database error" });
            done();
        });

        // 1 - Create profile for users[0]
        let postRes = {};
        postRes.status = jest.fn().mockImplementation(code => {
            expect(code).toBe(200);
            return postRes;
        });
        postRes.send = jest.fn().mockImplementation(data => {
            expect(mongoose.Types.ObjectId.isValid(data)).toBeTruthy();
            controller.deleteMethod({
                userID: users[1],
                query: {
                    profileID: data
                }
            }, deleteRes);
        });

        controller.postMethod({
            userID: users[0],
            body: {
                profile: {
                    name: preload[0].name,
                    surname: preload[0].surname,
                    address: preload[0].address,
                    city: preload[0].city,
                    province: preload[0].province,
                    country: preload[0].country,
                    zipCode: preload[0].zipCode,
                    phoneNumber: preload[0].phoneNumber,
                    email: preload[0].email,
                }
            }
        }, postRes);
    })
});

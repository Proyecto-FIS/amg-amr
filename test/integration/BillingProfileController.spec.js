const DatabaseConnection = require("../../source/DatabaseConnection");
const BillingProfileController = require("../../source/routes/BillingProfileController");
const mongoose = require("mongoose");
const utils = require("../utils");
const request = require("supertest");

describe("BillingProfileController", () => {

    const testURL = "/billing-profile";
    const db = new DatabaseConnection();
    let app;

    // Preload data
    const users = [mongoose.Types.ObjectId(100).toHexString(), mongoose.Types.ObjectId(200).toHexString()];
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

    beforeAll(() => {
        const controller = new BillingProfileController(testURL, utils.mockedRouter());
        app = utils.createExpressApp(controller, testURL);
        return db.setup();
    });

    beforeEach(done => mongoose.connection.dropCollection("billingprofiles", err => done()));

    afterAll(() => db.close());

    test("Should return empty", () => {
        return request(app)
            .get(testURL)
            .query({
                userID: mongoose.Types.ObjectId().toHexString()
            })
            .expect(200, []);
    });

    test("Missing fields in write", () => {
        return request(app)
            .post(testURL)
            .query({ userID: mongoose.Types.ObjectId().toHexString() })
            .send({
                profile: {
                    name: "name",
                    surname: "surname"
                    // Missing fields
                }
            })
            .expect(500, { reason: "Database error" });
    });

    test("Write & read, filtering by user", () => {

        return request(app)
            .post(testURL)
            .query({ userID: users[0] })
            .send({
                profile: { ...preload[0] }
            })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
                return request(app)
                    .post(testURL)
                    .query({ userID: users[1] })
                    .send({
                        profile: { ...preload[1] }
                    })
                    .expect(200)
            })
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
                return request(app)
                    .get(testURL)
                    .query({ userID: users[0] })
                    .expect(200);
            })
            .then(response => {
                const data = response.body;
                expect(data.length).toBe(1);
                expect(data[0].userID).toBeUndefined();
                expect(data[0]).toMatchObject(preload[0]);
            })
    });

    test("Update existing profile", () => {

        const newEmail = "updatedemail@email.com";

        return request(app)
            .post(testURL)
            .query({ userID: users[0] })
            .send({
                profile: { ...preload[0] }
            })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
                return request(app)
                    .put(testURL)
                    .query({ userID: users[0] })
                    .send({
                        profile: {
                            _id: response.body,
                            email: newEmail,    // Updated field
                        }
                    })
                    .expect(200);
            })
            .then(response => {
                expect(response.body.email).toBe(newEmail);
            });
    });

    test("Updating profile from other user", () => {

        return request(app)
            .post(testURL)
            .query({ userID: users[0] })
            .send({
                profile: { ...preload[0] }
            })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
                return request(app)
                    .put(testURL)
                    .query({ userID: users[1] })
                    .send({
                        profile: {
                            _id: response.body,
                            email: "newmail@email.com",    // Updated field
                        }
                    })
                    .expect(401);
            });
    });

    test("Delete existing profile", () => {

        return request(app)
            .post(testURL)
            .query({ userID: users[0] })
            .send({
                profile: { ...preload[0] }
            })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
                return request(app)
                    .delete(testURL)
                    .query({
                        userID: users[0],
                        profileID: response.body
                    })
                    .expect(200);
            })
            .then(response => {
                expect(response.body).toMatchObject(preload[0]);
            });
    });

    test("Delete profile from other user", () => {

        return request(app)
            .post(testURL)
            .query({ userID: users[0] })
            .send({
                profile: { ...preload[0] }
            })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
                return request(app)
                    .delete(testURL)
                    .query({
                        userID: users[1],
                        profileID: response.body
                    })
                    .expect(401);
            });
    });

    test("Delete all profiles", () => {

        return request(app)
            .post(testURL)
            .query({ userID: users[0] })
            .send({
                profile: { ...preload[0] }
            })
            .expect(200)
            .then(() => {
                return request(app)
                    .post(testURL)
                    .query({ userID: users[1] })
                    .send({
                        profile: { ...preload[1] }
                    })
                    .expect(200);
            })
            .then(() => {
                return request(app)
                    .delete(testURL)
                    .query({ userID: users[0] })
                    .expect(204);
            })
            .then(() => {
                return request(app)
                    .get(testURL)
                    .query({ userID: users[0] })
                    .expect(200);
            })
            .then(response => {
                expect(response.body.length).toBe(0);
                return request(app)
                    .get(testURL)
                    .query({ userID: users[1] })
                    .expect(200);
            })
            .then(response => {
                expect(response.body.length).toBe(1);
            })
    });
});

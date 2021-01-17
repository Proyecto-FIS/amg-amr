const BillingProfile = require("../../source/models/BillingProfile");
const utils = require("../utils");
const makeRequest = utils.makeRequest;
const mongoose = require("mongoose");
const { response } = require("express");

describe("BillingProfile API", () => {

    const testURL = "/api/v1/billing-profile";
    let userToken, userID;

    beforeAll(async () => {
        const user = await utils.authTestUser();
        userToken = user.userToken;
        userID = user.userID;
    });

    beforeEach(done => mongoose.connection.dropCollection("billingprofiles", err => done()));

    test("Unauthorized in GET", () => {
        return makeRequest()
            .get(testURL)
            .query({
                userToken: "Wrongtoken123",
            })
            .expect(401, { reason: "Authentication failed" });
    });

    test("Unauthorized in POST", () => {
        return makeRequest()
            .post(testURL)
            .query({
                userToken: "Wrongtoken123",
            })
            .expect(401, { reason: "Authentication failed" });
    });

    test("Unauthorized in PUT", () => {
        return makeRequest()
            .put(testURL)
            .query({
                userToken: "Wrongtoken123",
            })
            .expect(401, { reason: "Authentication failed" });
    });

    test("Unauthorized in DELETE", () => {
        return makeRequest()
            .delete(testURL)
            .query({
                userToken: "Wrongtoken123",
            })
            .expect(401, { reason: "Authentication failed" });
    });

    test("Missing profile in POST", () => {
        return makeRequest()
            .post(testURL)
            .query({ userToken })
            .expect(400, { reason: "Missing fields" });
    });

    test("Missing profile in PUT", () => {
        return makeRequest()
            .put(testURL)
            .query({ userToken })
            .expect(400, { reason: "Missing fields" });
    });
    
    test("Correct CRUD", () => {
        
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

        const updatedZip = 44444;
        let profileID;

        return makeRequest()
            .post(testURL)
            .query({ userToken })
            .send({ profile: sampleProfile })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).toBeTruthy();
                profileID = response.body;
                return makeRequest()
                    .get(testURL)
                    .query({ userToken })
                    .expect(200);
            })
            .then(response => {
                expect(response.body.length).toBe(1);
                expect(response.body[0]).toMatchObject(sampleProfile);
                return makeRequest()
                    .put(testURL)
                    .query({ userToken })
                    .send({
                        profile: {
                            _id: profileID,
                            zipCode: updatedZip
                        }
                    })
                    .expect(200);
            })
            .then(response => {
                sampleProfile.zipCode = updatedZip;
                expect(response.body).toMatchObject(sampleProfile);
                return makeRequest()
                    .get(testURL)
                    .query({ userToken })
                    .expect(200);
            })
            .then(response => {
                expect(response.body.length).toBe(1);
                expect(response.body[0]).toMatchObject(sampleProfile);
                return makeRequest()
                    .delete(testURL)
                    .query({ userToken, profileID })
                    .expect(200);
            })
            .then(response => {
                expect(response.body).toMatchObject(sampleProfile);
                return makeRequest()
                    .get(testURL)
                    .query({ userToken })
                    .expect(200, []);
            })
    });
});

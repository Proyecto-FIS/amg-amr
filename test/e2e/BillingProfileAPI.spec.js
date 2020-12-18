const App = require("../../source/App");
const mongoose = require("mongoose");
const axios = require("axios");
const BillingProfile = require("../../source/models/BillingProfile");

describe("BillingProfile API", () => {

    const testURL = `http://localhost:${process.env.PORT}/api/v1/billing-profile`;
    let server = new App();
    let userToken;
    let userID;

    /*beforeAll((done) => {
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
    beforeEach(done => mongoose.connection.dropCollection("billingprofiles", err => done()));*/

    test("TODO", () => {

    });
});

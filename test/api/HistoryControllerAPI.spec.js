const App = require("../../source/App");
const mongoose = require("mongoose");

describe("HistoryController API", () => {

    let server = new App();

    beforeAll((done) => server.run(done));
    afterAll((done) => server.stop(done));
    beforeEach((done) => mongoose.connection.dropCollection("historyentries", err => done()));

    test("Wrong user", (done) => {
        // TODO
        done();
    });

    test("Page limit exceeded", (done) => {
        // TODO
        done();
    });

    test("Correct user but no entries", (done) => {
        // TODO
        done();
    });

    test("Correct user and has entries", (done) => {
        // TODO
        done();
    });

    test("Select by date", (done) => {
        // TODO
        done();
    });
});

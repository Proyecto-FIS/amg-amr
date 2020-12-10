const DatabaseConnection = require("../../source/DatabaseConnection");

describe("HistoryController", () => {

    const db = new DatabaseConnection();

    beforeAll((done) => {
        db.setup(done);
    });

    afterAll((done) => {
        db.close(done);
    });

    test("Sample test", () => {

    });
});

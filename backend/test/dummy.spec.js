require("dotenv").config({ path: __dirname + "/../env/test.env" });

describe("Test suite", () => {
    test("Test case", () => {
        console.log(process.env.TEST)
    });
});
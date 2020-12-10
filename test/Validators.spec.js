const Validators = require("../source/middlewares/Validators");

describe("Validators", () => {

    let mockedRes = {};
    let mockedNext = {};

    beforeEach(() => {
        mockedRes.status = jest.fn().mockReturnValue(mockedRes);
        mockedRes.json = jest.fn().mockReturnValue(mockedRes);
        mockedNext = jest.fn();
    });

    test("Required OK", () => {

        const mockedReq = {
            body: {
                myField: "myValue"
            }
        };

        const validator = Validators.Required("myField");
        validator(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.mock.calls.length).toBe(1);
        expect(mockedRes.status.mock.calls.length).toBe(0);
        expect(mockedRes.json.mock.calls.length).toBe(0);
    });

    test("Required missing field", () => {
        
        const mockedReq = {
            body: {}
        };

        const validator = Validators.Required("myField");
        validator(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.mock.calls.length).toBe(0);
        expect(mockedRes.status.mock.calls.length).toBe(1);
        expect(mockedRes.json.mock.calls.length).toBe(1);
        expect(mockedRes.status.mock.calls[0][0]).toBe(400);
        expect(mockedRes.json.mock.calls[0][0]).toMatchObject({ reason: "Missing fields" });
    });
});

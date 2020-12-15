const { string } = require("yargs");
const Validators = require("../../source/middlewares/Validators");

describe("Validators", () => {

    let mockedRes;
    let mockedNext;

    beforeEach(() => {
        mockedRes = {};
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

    test("Range below minimum", () => {

        const mockedReq = {
            body: {
                myField: 20
            }
        };

        const validator = Validators.Range("myField", 21, 30);
        validator(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.mock.calls.length).toBe(0);
        expect(mockedRes.status.mock.calls.length).toBe(1);
        expect(mockedRes.json.mock.calls.length).toBe(1);
        expect(mockedRes.status.mock.calls[0][0]).toBe(400);
        expect(mockedRes.json.mock.calls[0][0]).toMatchObject({ reason: "Exceeded boundaries" });
    });

    test("Range beyond maximum", () => {

        const mockedReq = {
            body: {
                myField: 31
            }
        };

        const validator = Validators.Range("myField", 21, 30);
        validator(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.mock.calls.length).toBe(0);
        expect(mockedRes.status.mock.calls.length).toBe(1);
        expect(mockedRes.json.mock.calls.length).toBe(1);
        expect(mockedRes.status.mock.calls[0][0]).toBe(400);
        expect(mockedRes.json.mock.calls[0][0]).toMatchObject({ reason: "Exceeded boundaries" });
    });

    test("Range OK", () => {

        const mockedReq = {
            body: {
                myField: 25
            }
        };

        const validator = Validators.Range("myField", 21, 30);
        validator(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.mock.calls.length).toBe(1);
        expect(mockedRes.status.mock.calls.length).toBe(0);
        expect(mockedRes.json.mock.calls.length).toBe(0);
    });

    test("ToDate valid date", () => {

        const mockedReq = {
            body: {
                myDate: "2014-11-03T19:38:34.203Z"
            }
        };
        
        const validator = Validators.ToDate("myDate");
        validator(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.mock.calls.length).toBe(1);
        expect(mockedRes.status.mock.calls.length).toBe(0);
        expect(mockedRes.json.mock.calls.length).toBe(0);
        expect(mockedReq.body.myDate).toBeInstanceOf(Date);
        expect(mockedReq.body.myDate.getUTCDate()).toBe(3);
        expect(mockedReq.body.myDate.getUTCMonth()).toBe(10);
        expect(mockedReq.body.myDate.getUTCFullYear()).toBe(2014);
        expect(mockedReq.body.myDate.getUTCHours()).toBe(19);
        expect(mockedReq.body.myDate.getUTCMinutes()).toBe(38);
        expect(mockedReq.body.myDate.getUTCSeconds()).toBe(34);
        expect(mockedReq.body.myDate.getUTCMilliseconds()).toBe(203);
    });

    test("ToDate wrong date", () => {
        
        const mockedReq = {
            body: {
                myDate: "random junk"
            }
        };
        
        const validator = Validators.ToDate("myDate");
        validator(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.mock.calls.length).toBe(0);
        expect(mockedRes.status.mock.calls.length).toBe(1);
        expect(mockedRes.json.mock.calls.length).toBe(1);
        expect(mockedReq.body.myDate).not.toBeInstanceOf(Date);
        expect(mockedRes.status.mock.calls[0][0]).toBe(400);
        expect(mockedRes.json.mock.calls[0][0]).toMatchObject({ reason: "Date parsing failed" });
    });
});

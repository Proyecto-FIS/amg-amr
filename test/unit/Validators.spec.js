const Validators = require("../../source/middlewares/Validators");
const utils = require("../utils");

describe("Validators", () => {

    test("Required OK", () => {

        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myField: "myValue"
            }
        });

        const validator = Validators.Required("myField");
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(1);
        expect(res.status.mock.calls.length).toBe(0);
        expect(res.json.mock.calls.length).toBe(0);
    });

    test("Required missing field", () => {
        
        const { req, res, next } = utils.mockMiddlewareInput({
            body: {}
        });

        const validator = Validators.Required("myField");
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(0);
        expect(res.status.mock.calls.length).toBe(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls[0][0]).toMatchObject({ reason: "Missing fields" });
    });

    test("Range below minimum", () => {

        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myField: 20
            }
        });

        const validator = Validators.Range("myField", 21, 30);
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(0);
        expect(res.status.mock.calls.length).toBe(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls[0][0]).toMatchObject({ reason: "Exceeded boundaries" });
    });

    test("Range beyond maximum", () => {

        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myField: 31
            }
        });

        const validator = Validators.Range("myField", 21, 30);
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(0);
        expect(res.status.mock.calls.length).toBe(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls[0][0]).toMatchObject({ reason: "Exceeded boundaries" });
    });

    test("Range OK", () => {

        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myField: 25
            }
        });

        const validator = Validators.Range("myField", 21, 30);
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(1);
        expect(res.status.mock.calls.length).toBe(0);
        expect(res.json.mock.calls.length).toBe(0);
    });

    test("ToDate valid date", () => {

        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myDate: "2014-11-03T19:38:34.203Z"
            }
        });
        
        const validator = Validators.ToDate("myDate");
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(1);
        expect(res.status.mock.calls.length).toBe(0);
        expect(res.json.mock.calls.length).toBe(0);
        expect(req.body.myDate).toBeInstanceOf(Date);
        expect(req.body.myDate.getUTCDate()).toBe(3);
        expect(req.body.myDate.getUTCMonth()).toBe(10);
        expect(req.body.myDate.getUTCFullYear()).toBe(2014);
        expect(req.body.myDate.getUTCHours()).toBe(19);
        expect(req.body.myDate.getUTCMinutes()).toBe(38);
        expect(req.body.myDate.getUTCSeconds()).toBe(34);
        expect(req.body.myDate.getUTCMilliseconds()).toBe(203);
    });

    test("ToDate wrong date", () => {
        
        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myDate: "random junk"
            }
        });
        
        const validator = Validators.ToDate("myDate");
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(0);
        expect(res.status.mock.calls.length).toBe(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(req.body.myDate).not.toBeInstanceOf(Date);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls[0][0]).toMatchObject({ reason: "Date parsing failed" });
    });
});

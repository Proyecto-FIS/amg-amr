/**
 * @typedef ValidationError
 * @property {string} reason   - User-friendly reason message
 */

class Validators {

    static Required(fieldName) {
        return (req, res, next) => {
            if(req.body.hasOwnProperty(fieldName)) {
                next();
            } else {
                res.status(400).json({ reason: "Missing fields" });
            }
        }
    }

    static Range(fieldName, minValue, maxValue) {
        return (req, res, next) => {
            if(req.body[fieldName] >= minValue && req.body[fieldName] <= maxValue) {
                next();
            } else {
                res.status(400).json({ reason: "Exceeded boundaries" });
            }
        }
    }

    static ToDate(fieldName) {
        return (req, res, next) => {

            // According to ISO DateTime complete format
            const dateTimeRegex = new RegExp(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);
            
            if(dateTimeRegex.test(req[fieldName])) {
                req[fieldName] = new Date(req[fieldName]);
                next();
            } else {
                res.status(400).json({ reason: "Date parsing failed" });
            }
        }
    }
}

module.exports = Validators;

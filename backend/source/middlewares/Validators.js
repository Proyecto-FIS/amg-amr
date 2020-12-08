/**
 * @typedef ValidationError
 * @property {string} reason   - User-friendly reason message
 */

class Validators {

    static Required(fieldName) {
        return (req, res, next) => {
            if(!req.body.fieldName) {
                res.status(400).json({ reason: "Missing fields"});
            } else {
                next();
            }
        }
    }

    static Min(fieldName, minValue) {
        return (req, res, next) => {
            if(req.body.fieldName >= minValue) {
                next();
            } else {
                res.status(400).json({ reason: "Exceeded boundaries" });
            }
        }
    }

    static Range(fieldName, minValue, maxValue) {
        return (req, res, next) => {
            if(req.body.fieldName >= minValue && req.body.fieldName.maxValue <= maxValue) {
                next();
            } else {
                res.status(400).json({ reason: "Exceeded boundaries" });
            }
        }
    }

    static ToDate(fieldName) {
        return (req, res, next) => {
            const d = new Date(req.fieldName);
            if(d instanceof Date && !isNaN(d)) {
                req.fieldName = d;
                next();
            } else {
                res.status(400).json({ reason: "Date parsing failed" });
            }
        }
    }
}

module.exports = Validators;

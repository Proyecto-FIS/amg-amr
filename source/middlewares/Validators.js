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
            
            const date = new Date(req.body[fieldName]);
            if(date instanceof Date && !isNaN(date.valueOf())) {
                date.getUTC
                req.body[fieldName] = date;
                next();
            } else {
                res.status(400).json({ reason: "Date parsing failed" });
            }
        }
    }
}

module.exports = Validators;

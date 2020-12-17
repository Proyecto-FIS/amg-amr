/**
 * @typedef ValidationError
 * @property {string} reason   - User-friendly reason message
 */

class Validators {

    static Required(fieldName) {
        return (req, res, next) => {
            if(req.body && req.body.hasOwnProperty(fieldName) || req.query && req.query.hasOwnProperty(fieldName)) {
                next();
            } else {
                res.status(400).json({ reason: "Missing fields" });
            }
        }
    }

    static Range(fieldName, minValue, maxValue) {
        return (req, res, next) => {
            const field = req.body[fieldName] || req.query[fieldName];
            if(field >= minValue && field <= maxValue) {
                next();
            } else {
                res.status(400).json({ reason: "Exceeded boundaries" });
            }
        }
    }

    static ToDate(fieldName) {
        return (req, res, next) => {
            
            const date = new Date(req.body[fieldName] || req.query[fieldName]);
            if(date instanceof Date && !isNaN(date.valueOf())) {
                if(req.body[fieldName]) {
                    req.body[fieldName] = date;
                } else {
                    req.query[fieldName] = date;
                }
                next();
            } else {
                res.status(400).json({ reason: "Date parsing failed" });
            }
        }
    }
}

module.exports = Validators;

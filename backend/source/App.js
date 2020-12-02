const express = require("express");

class App {

    constructor() {
        this.app = express();
        this.router = express.Router();
        this.server = null;
        this.app.use(express.json());
        this.registerRoutes();
    }

    registerRoutes() {
        // TODO Register routes
        this.app.use(this.router);
        this.app.use(App.errorHandler);
    }

    static errorHandler(err, req, res, next) {
        res.status(500).json({ status: false, msg: err });
    }

    run(done) {
        this.server = this.app.listen(process.env.PORT, () => {
            done();
        });
    }

    stop(done) {
        if(this.server == null) return;
        this.server.close(() => {
            done();
        })
    }
}

module.exports = App;

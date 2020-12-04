const express = require("express");

class App {

    constructor() {
        this.app = express();
        this.router = express.Router();
        this.server = null;

        this.app.use(express.json());
        this.app.use(this.router);

        // Route registration
        require("./routes/example").register(this.router);

        this.app.use(App.errorHandler);
    }

    static errorHandler(err, req, res, next) {
        res.status(500).json({ status: false, msg: err });
    }

    run(done) {
        const port = process.env.PORT || 8080;
        this.server = this.app.listen(port, () => {
            console.log(`[SERVER] Running at port ${port}`);
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

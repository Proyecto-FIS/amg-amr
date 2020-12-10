const express = require("express");
const swagger = require("./swagger");
const DatabaseConnection = require("./DatabaseConnection");
const HistoryController = require("./routes/HistoryController");

class App {

    constructor() {
        this.app = express();
        this.router = express.Router();
        this.server = null;
        this.port = process.env.PORT || 8080;
        this.db = new DatabaseConnection();

        this.app.use(express.json());
        this.app.use(this.router);

        // Route registration
        const apiPrefix = swagger.getBasePath();
        require("./routes/billing-profile").register(apiPrefix, this.router);
        this.historyController = new HistoryController(apiPrefix, this.router);
        require("./routes/payment").register(apiPrefix, this.router);
        require("./routes/return").register(apiPrefix, this.router);
        require("./routes/subscription").register(apiPrefix, this.router);

        this.app.use(App.errorHandler);

        swagger.setupSwagger(this.app, this.port);
    }

    static errorHandler(err, req, res, next) {
        res.status(500).json({ status: false, msg: err });
    }

    run(done) {

        process.on("SIGINT", () => {
            this.stop(() => console.log("[SERVER] Shut down requested by user"));
        });

        this.db.setup(() => {
            this.server = this.app.listen(this.port, () => {
                console.log(`[SERVER] Running at port ${this.port}`);
                done();
            });
        });
    }

    stop(done) {
        if(this.server == null) return;
        this.server.close(() => {
            this.db.close(done);
        })
    }
}

module.exports = App;

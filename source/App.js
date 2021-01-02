const express = require("express");
const swagger = require("./swagger");
const cors = require("cors");
const DatabaseConnection = require("./DatabaseConnection");
const HistoryController = require("./routes/HistoryController");
const BillingProfileController = require("./routes/BillingProfileController");
const CircuitBreaker = require("./CircuitBreaker");

class App {

    constructor() {
        this.app = express();
        this.router = express.Router();
        this.server = null;
        this.port = process.env.PORT || 8080;
        this.db = new DatabaseConnection();

        this.app.use(cors());       // Needed for SwaggerUI TryIt
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(express.json());
        this.app.use(this.router);

        // Route registration
        const apiPrefix = swagger.getBasePath();
        this.billingProfileController = new BillingProfileController(apiPrefix, this.router);
        this.historyController = new HistoryController(apiPrefix, this.router);
        require("./routes/payment").register(apiPrefix, this.router);
        require("./routes/refund").register(apiPrefix, this.router);
        require("./routes/subscription").register(apiPrefix, this.router);

        CircuitBreaker.initHystrixDashboard(this.app);

        this.app.use(App.errorHandler);

        swagger.setupSwagger(this.app, this.port);
    }

    static errorHandler(err, req, res, next) {
        res.status(500).json({ msg: err });
    }

    run() {
        return new Promise((resolve, reject) => {

            process.on("SIGINT", () => {
                console.log("[SERVER] Shut down requested by user");
                this.stop().then(() => { });
            });

            this.db.setup()
                .then(() => {
                    this.server = this.app.listen(this.port, () => {
                        console.log(`[SERVER] Running at port ${this.port}`);
                        resolve();
                    });
                })
                .catch(reject);
        });
    }

    stop() {
        return new Promise((resolve, reject) => {

            if (this.server == null) {
                reject();
                return;
            }

            this.server.close(err => {
                if(err) {
                    reject(err);
                } else {
                    console.log("[SERVER] Closed successfully");
                    this.db.close().then(resolve).catch(reject);
                }
            });
        });
    }
}

module.exports = App;

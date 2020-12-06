const express = require("express");
const expressSwagger = require('express-swagger-generator');
const swagger = require("express-swagger-generator/lib/swagger");

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            description: 'This is a sample server',
            title: 'Swagger',
            version: '1.0.0',
        },
        host: 'localhost:3000',
        basePath: '/api/v1',
        produces: [
            "application/json",
        ],
        schemes: ['http', 'https'],
		securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./routes/**/*.js'] //Path to the API handle folder
};

class App {

    constructor() {
        this.app = express();
        this.router = express.Router();
        this.server = null;

        this.app.use(express.json());
        this.app.use(this.router);

        // Route registration
        const apiPrefix = swaggerOptions.swaggerDefinition.basePath;
        require("./routes/billing-profile").register(apiPrefix, this.router);
        require("./routes/history").register(apiPrefix, this.router);
        require("./routes/payment").register(apiPrefix, this.router);
        require("./routes/return").register(apiPrefix, this.router);
        require("./routes/subscription").register(apiPrefix, this.router);

        this.app.use(App.errorHandler);

        expressSwagger(this.app)(swaggerOptions);
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

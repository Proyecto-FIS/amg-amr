const expressSwagger = require('express-swagger-generator');

module.exports.getBasePath = () => {
    return "/api/v1";
}

module.exports.setupSwagger = (app, port) => {

    const swaggerOptions = {
        swaggerDefinition: {
            info: {
                description: 'This microservice manages sales, returns and subscriptions',
                title: 'Coffaine - Sales microservice API',
                version: '1.0.0',
            },
            host: process.env.HOSTNAME || ('localhost:' + port),
            basePath: this.getBasePath(),
            produces: [
                "application/json",
            ],
            schemes: ['http'],
            securityDefinitions: {
                JWT: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: "TODO",
                }
            }
        },
        basedir: __dirname,
        files: ['./routes/**/*.js']
    };

    expressSwagger(app)(swaggerOptions);
}

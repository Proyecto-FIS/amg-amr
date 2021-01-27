const axios = require("axios");
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");

module.exports.makeRequest = () => request(`http://localhost:${process.env.PORT}`);

module.exports.mockMiddlewareInput = (req) => {

    let res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);

    return {
        req: req,
        res: res,
        next: jest.fn()
    };
}

module.exports.mockedRouter = () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
});

module.exports.createExpressApp = (controller, path, ...middlewares) => {

    const app = express();
    const router = express.Router();

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(router);
    
    if(typeof controller.getMethod === "function") {
        router.get(path, ...middlewares, controller.getMethod.bind(controller));
    }

    if(typeof controller.postMethod === "function") {
        router.post(path, ...middlewares, controller.postMethod.bind(controller));
    }

    if(typeof controller.putMethod === "function") {
        router.put(path, ...middlewares, controller.putMethod.bind(controller));
    }

    if(typeof controller.deleteMethod === "function") {
        router.delete(path, ...middlewares, controller.deleteMethod.bind(controller));
    }

    return app;
};

module.exports.authTestUser = () => {
    return new Promise((resolve, reject) => {

        let userToken, userID;

        axios.post(`${process.env.USERS_MS}/auth/login`, {
            username: process.env.TEST_USERNAME,
            password: process.env.TEST_PASSWORD
        })
        .then(response => {
            userToken = response.data.token;
            return axios.get(`${process.env.USERS_MS}/auth/${userToken}`);
        })
        .then(response => {
            userID = response.data.account_id;
            resolve({ userID, userToken });
        })
        .catch(err => reject(err));
    });
}

module.exports.getTestProduct = () => {
    return new Promise((resolve, reject) => {
        axios.get(`${process.env.API_PRODUCTS_ENDPOINT}/products`)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
}
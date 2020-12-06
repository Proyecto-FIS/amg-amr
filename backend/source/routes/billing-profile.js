const express = require("express");

const getMethod = (req, res) => {
    res.send("Test");
}

const postMethod = (req, res) => {
    res.send("Coffaine - Sales microservice");
}

const putMethod = (req, res) => {
    res.send("Test");
}

const deleteMethod = (req, res) => {
    res.send("Test");
}

module.exports.register = (apiPrefix, router) => {
    
    router.get(apiPrefix + "/billing-profile", getMethod);
    router.post(apiPrefix + "/billing-profile", postMethod);
    router.put(apiPrefix + "/billing-profile", putMethod);
    router.delete(apiPrefix + "/billing-profile", deleteMethod);
}

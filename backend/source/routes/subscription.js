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
    
    router.get(apiPrefix + "/subscription", getMethod);
    router.post(apiPrefix + "/subscription", postMethod);
    router.put(apiPrefix + "/subscription", putMethod);
    router.delete(apiPrefix + "/subscription", deleteMethod);
}

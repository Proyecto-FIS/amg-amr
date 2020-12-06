const express = require("express");

const getMethod = (req, res) => {
    res.send("Coffaine - Sales microservice");
};

module.exports.register = (apiPrefix, router) => {
    
    router.get(apiPrefix + "/history", getMethod);
}

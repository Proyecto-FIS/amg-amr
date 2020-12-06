const express = require("express");

const postMethod = (req, res) => {
    res.send("Coffaine - Sales microservice");
};

module.exports.register = (apiPrefix, router) => {
    
    router.post(apiPrefix + "/return", postMethod);
}

const express = require("express");

example = (req, res) => {
    res.send("Coffaine - Sales microservice");
}

module.exports.register = (router) => {
    router.get("/", example);
}

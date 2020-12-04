const express = require("express");

example = (req, res) => {
    res.send("GitHub actions working");
}

module.exports.register = (router) => {
    router.get("/", example);
}

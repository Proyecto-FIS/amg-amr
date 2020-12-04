const express = require("express");

example = (req, res) => {
    res.send("OK");
}

module.exports.register = (router) => {
    router.get("/", example);
}

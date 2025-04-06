const express = require("express");
const router = express.Router();
const intentionalErrorController = require("../controllers/intentionalErrorController");
const utilities = require("../utilities");

// Intentional error route
// Middleware causes an error
router.use("/", utilities.handleErrors(async (req, res, next) => {
    //throw new Error("Middleware intentionally throwing an exception") // Comment this line to allow controller to cause the error
    next();
}));

// Route to cause 500 type error
router.get("/", utilities.handleErrors(intentionalErrorController.causeError));

module.exports = router;

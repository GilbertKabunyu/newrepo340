// Needed Resource
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")



// GET route for the "My Account" link
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get('/registration', utilities.handleErrors(accountController.buildRegister));

// POST routes
router.post('/register',
    regValidate.registrationRules(),
    regValidate.checkRegData, 
    utilities.handleErrors(accountController.registerAccount))

module.exports = router
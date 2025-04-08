// Needed Resource
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")



// GET route for the "My Account" link
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Process the login attempt
router.post("/login", 
    (req, res) => {
        res.status(200).send('login process')
    }
);
router.get('/registration', utilities.handleErrors(accountController.buildRegister));

// POST routes
router.post('/register',
    regValidate.registrationRules(),
    regValidate.checkRegData, 
    utilities.handleErrors(accountController.registerAccount))

module.exports = router
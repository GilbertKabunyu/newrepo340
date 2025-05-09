// Needed Resource
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");

// Account management view
router.get(
  "/",
  utilities.checkJWTToken, // Use checkJWTToken to verify and set account data
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagementView)
);

// GET route for the "My Account" link
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Route to logout, unit 5
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

// routes for Registration
router.get(
  "/registration",
  utilities.handleErrors(accountController.buildRegister)
);

router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Update account handlers, unit 5
router.get(
  "/update/:accountId",
  utilities.handleErrors(accountController.buildUpdate)
);

router.post(
  "/update",
  regValidate.updateRules(), // TODO: This needs to have a separate rule set, without existing email check..unless...oh complex
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

router.post(
  "/update-password",
  regValidate.updatePasswordRules(),
  regValidate.checkUpdatePasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;

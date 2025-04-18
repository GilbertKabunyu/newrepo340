/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser") // wk 4
const session = require ("express-session") // week 4
const pool = require ("./database/") // week 4
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/index")
const accountRoute = require("./routes/accountRoute")
const intentionalErrorRoute = require("./routes/intentionalErrorRoute")
const messageRoute = require("./routes/messageRoute")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")// not at views root

/******************************************
* Middleware
*******************************************/
app.use(session({
  store: new (require ("connect-pg-simple") (session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: "sessionId",
}))

/***********************************
* Express Message Middleware 
*********************************/
app.use(require('connect-flash') ())
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded(
  {extended: true}
)) // for parsing application/ x-www-form-unlencoded

//cookieparser middleware
app.use(cookieParser())
// unit 5, login process activity
app.use(utilities.checkJWTToken)

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
//Inventory routes
app.use("/inv", inventoryRoute)
// Intentional error route
app.use("/ierror", intentionalErrorRoute)
// Account routes
app.use("/account", accountRoute)
// Mesaages route
app.use("/message", messageRoute);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

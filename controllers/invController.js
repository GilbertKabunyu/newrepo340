const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/*******************************************************
 * Build inventory by classification view
 ********************************************************/
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + "vehicles",
    nav,
    grid,
  });
};

/***************************************************
 * Build a view for single car
 *****************************************************/
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inventory_Id = req.params.inventoryId;
    const data = await invModel.getInventoryById(inventory_Id);

    if (!data) {
      return res.status(404).send("Vehicle not found.");
    }

    const vehicleView = await utilities.buildVehicleDetail(data);
    let nav = await utilities.getNav();

    res.render("./inventory/details", {
      title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
      nav,
      vehicleView,
    });
  } catch (error) {
    next(error);
  }
};

/**********************************
 * Vehicle Management Controllers
 **********************************/
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Vehicle Management",
    errors: null,
    nav,
    classificationSelect,
  });
};

/**********************************
 * Build the add classification view
 **********************************/
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();

  res.render("inventory/addClassification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

/*****************************************************
 * Handle post request to add a vehicle classification
 *****************************************************/
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;

  const response = await invModel.addClassification(classification_name); // ...to a function within the inventory model...
  let nav = await utilities.getNav(); // After query, so it shows new classification
  if (response) {
    req.flash(
      "notice",
      `The "${classification_name}" classification was successfully added.`
    );
    // **CORRECTED:** Fetch and rebuild classificationSelect
    const classificationSelect = await utilities.buildClassificationList();
    res.render("inventory/management", {
      title: "Vehicle Management",
      errors: null,
      nav,
      classificationSelect, // Now passing the correct HTML
    });
  } else {
    req.flash("notice", `Failed to add ${classification_name}`);
    res.render("inventory/addClassification", {
      title: "Add New Classification",
      errors: null,
      nav,
      classification_name,
    });
  }
};

/**********************************
 * Build the add inventory view
 **********************************/
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav();
  let classifications = await utilities.buildClassificationList();

  res.render("inventory/addInventory", {
    title: "Add Vehicle",
    errors: null,
    nav,
    classifications,
  });
};

/******************************************************************************
 * Handle post request to add a vehicle to the inventory along with redirects
 *******************************************************************************/
invCont.addInventory = async function (req, res, next) {
  const nav = await utilities.getNav();

  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const response = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (response) {
    req.flash(
      "notice",
      `The ${inv_year} ${inv_make} ${inv_model} successfully added.`
    );
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
      errors: null,
    });
  } else {
    // This seems to never get called. Is this just for DB errors?
    req.flash("notice", "There was a problem.");
    res.render("inventory/addInventory", {
      title: "Add Vehicle",
      nav,
      errors: null,
    });
  }
};

module.exports = invCont;

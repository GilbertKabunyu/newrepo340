const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/*******************************************************
* Build inventory by classification view
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
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
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
 *****************************************************/
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inventory_Id = req.params.inventoryId;
    const data = await invModel.getInventoryById(inventory_Id);
    console.log(data);
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
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
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
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
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
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
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
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
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
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
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

/* ***********************************************
 *  Unit 5, Return Inventory by Classification As JSON
 * ************************************************/
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/****************************
*  Build edit inventory view, Unit 5
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
***************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventoryId);
  const nav = await utilities.getNav();

  const inventoryData = await invModel.getInventoryById(inventory_id);

  if (inventoryData) {
    let classifications = await invModel.getClassification(); // Fetch all classifications
    const classificationList = utilities.buildClassificationList(
      classifications,
      inventoryData.classification_id
    );
    const name = `${inventoryData.inv_make} ${inventoryData.inv_model}`;

    res.render("inventory/editInventory", {
      title: "Edit " + name,
      errors: null,
      nav,
      classifications: classificationList, // Use the built list
      inv_id: inventoryData.inv_id,
      inv_make: inventoryData.inv_make,
      inv_model: inventoryData.inv_model,
      inv_year: inventoryData.inv_year,
      inv_description: inventoryData.inv_description,
      inv_image: inventoryData.inv_image,
      inv_thumbnail: inventoryData.inv_thumbnail,
      inv_price: inventoryData.inv_price,
      inv_miles: inventoryData.inv_miles,
      inv_color: inventoryData.inv_color,
      classification_id: inventoryData.classification_id,
    });
  } else {
    req.flash("notice", "Sorry, no vehicle with that ID was found.");
    return res.redirect("/inv/"); // Redirect to inventory management
  }
};

/*********************************************************
 * Handle post request to update a vehicle to the inventory along with redirects
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
 ************************************************************/
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav();

  const {
    inv_id,
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

  const response = await invModel.updateInventory(
    inv_id,
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
    const itemName = response.inv_make + " " + response.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classifications = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/editInventory", {
      title: "Edit " + itemName,
      nav,
      errors: null,
      classifications,
      inv_id,
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
    });
  }
};

/****************************************************
 * Build the delete inventory view, unit 5
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
 ******************************************************/
invCont.buildDeleteInventory = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventoryId);
  const nav = await utilities.getNav();

  const inventoryData = (
    await invModel.getInventoryByInventoryId(inventory_id)
  )[0]; // Change this function to return the first item
  const name = `${inventoryData.inv_make} ${inventoryData.inv_model}`;

  res.render("inventory/delete-confirm", {
    title: "Delete " + name,
    errors: null,
    nav,
    inv_id: inventoryData.inv_id,
    inv_make: inventoryData.inv_make,
    inv_model: inventoryData.inv_model,
    inv_year: inventoryData.inv_year,
    inv_price: inventoryData.inv_price,
  });
};

/*****************************************************
 * Handle post request to delete a vehicle from the inventory along with redirects
 *@param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
 ************************************************/
invCont.deleteInventory = async function (req, res, next) {
  const nav = await utilities.getNav();
  const inventory_id = parseInt(req.body.inv_id);
  const { inv_id, inv_make, inv_model, inv_year, inv_price } = req.body;

  const queryResponse = await invModel.deleteInventory(inventory_id);
  const itemName = `${inv_make} ${inv_model}`;

  if (queryResponse) {
    // const itemName = queryResponse.inv_make + " " + queryResponse.inv_model;
    req.flash("notice", `The ${itemName} was successfully deleted.`);
    res.redirect("/inv/");
  } else {
    // const classifications = await utilities.buildClassificationList(
    //   classification_id
    // );

    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/deleteInventory", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    });
  }
};

module.exports = invCont;

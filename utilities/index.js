const invModel = require("../models/inventory-model");
const Util = {};

/*************************************
 * Constructs the nav HTML unordered list
 *****************************************/
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassification();
  //console.log(data)
  let list = "<ul>";
  list += '<li><a href="/" title="home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '"title= See our inventory of' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/************************************************************
 * Build the classification HTML
 ***********************************************************/
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/*********************************************
 * Build a single listing element from data Week 3
 *******************************************/
Util.buildVehicleDetail = async function (data) {
  let listingHTML = "";
  console.dir({ data });
  if (data) {
    listingHTML = `
      <section class="car-listing">
        <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
        <div class="car-information">
          <div>
            <h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>
          </div>
          <div>
            ${Number.parseFloat(data.inv_price).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </div>
          <div class="description">
            <p>
              ${data.inv_description}
            </p>
            <dl>
              <dt>MILEAGE</dt>
              <dd>${data.inv_miles.toLocaleString("en-US", {
                style: "decimal",
              })}</dd>
              <dt>COLOR</dt>
              <dd>${data.inv_color}</dd>
              <dt>CLASS</dt>
              <dd>${data.classification_name}</dd>
            </dl>
          </div>

        </div>
      </section>
    `;
   
  } else {
    listingHTML = `
      <p>Sorry, no matching vehicles could be found.</p>
    `;
  }
  return listingHTML;
};


/*********************************************
 * Build an HTML select element with classification data
 *******************************************/
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassification();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  })
  classificationList += "</select>";
  return classificationList;
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;

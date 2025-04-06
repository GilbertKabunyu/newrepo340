const pool = require("../database/");

/******************************
 * Get all classification data
 *******************************/
async function getClassification() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

async function addClassification(classification_name) {
  // ..for insertion to the database.
  const sql = `INSERT INTO public.classification (classification_name) 
    VALUES ($1)`;

  try {
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    return error.message;
  }
}

/*****************************************************
 * Get all inventory items and classidfication_name by classification_Id
 *****************************************************************/
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `
            SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
      [classification_id]
    );
    //console.log("Query Result:", data.rows); // 🔍 Log output
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    return [];
  }
}

/* ***************************
 *  Get a single inventory item by id
 * ************************** */
async function getInventoryById(inventoryId) {
  try {
      const data = await pool.query(
          `SELECT * FROM public.inventory
        INNER JOIN public.classification
        ON public.inventory.classification_id = public.classification.classification_id
        WHERE inv_id = $1`,
          [inventoryId]
      );
      return data.rows[0]; // Return single vehicle
  } catch (error) {
      console.error("getInventoryById error: " + error);
      throw error;
  }
}

/*******************************
 * Add a single inventory item
 *******************************/
async function addInventory(
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
) {
  const sql = `INSERT INTO public.inventory 
    ( inv_make,
      inv_model, 
      inv_year, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_price, 
      inv_miles, 
      inv_color, 
      classification_id)
      VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )`;
  try {
    return await pool.query(sql, [
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
    ]);
  } catch (error) {
    console.error("editInventory error. " + error);
  }
}

module.exports = {
  getClassification,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addInventory,
};

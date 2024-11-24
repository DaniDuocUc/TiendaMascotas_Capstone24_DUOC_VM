const db = require('../../database/dbConnection');

const checkProductRegistration = async product_id => {
  try {
    const result = await db.query('SELECT * FROM farming_product WHERE id = $1', [product_id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error in productService:', error);
    throw new Error('Database query failed.');
  }
};

module.exports = {
  checkProductRegistration,
};

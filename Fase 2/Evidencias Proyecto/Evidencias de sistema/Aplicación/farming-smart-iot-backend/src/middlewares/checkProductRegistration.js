const productService = require('../modules/product/productService');

const checkProductRegistrationMiddleware = async (req, res, next) => {
  const { product_id } = req.body;

  try {
    const productExists = await productService.checkProductRegistration(product_id);

    if (!productExists) {
      return res.status(400).send({
        message: 'Product not registered. Please check the product_id or register the product.',
      });
    }

    next();
  } catch (error) {
    console.error('Error in checkProductRegistration middleware:', error);
    return res.status(500).send({
      message: 'An error occurred while checking product registration.',
    });
  }
};

module.exports = checkProductRegistrationMiddleware;

const Joi = require("joi");

const createOrderSchema = Joi.object({
  items: Joi.array()
    .min(1)
    .required()
    .items(
      Joi.object({
        product: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
      }),
    ),
});

module.exports = {createOrderSchema};

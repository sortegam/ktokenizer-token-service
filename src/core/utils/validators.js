import Joi from 'joi';

// #############################################################################

// FIX: Improve better credit card validation
export const isValidCardData = (cardData) => {
  if (!cardData) {
    return new Promise(resolve => resolve(false));
  }
  const schema = Joi.object().keys({
    pan: Joi.string()
      .creditCard()
      .required(),
    expiration: Joi.number().required(),
    cvv: Joi.number(),
    cardHolder: Joi.string().required(),
    address: Joi.string(),
  });
  return new Promise((resolve) => {
    Joi.validate(cardData, schema, (err) => {
      if (err === null) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};
// #############################################################################

export const isValidFormattedToken = (token) => {
  if (!token) {
    return new Promise(resolve => resolve(false));
  }
  const schema = Joi.string()
    .uuid()
    .required();
  return new Promise((resolve) => {
    Joi.validate(token, schema, (err) => {
      if (err === null) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

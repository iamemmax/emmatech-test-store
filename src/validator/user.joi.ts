import Joi from "joi";

export const registerSchema = Joi.object({
  first_name: Joi.string().trim().min(2).max(60).required().messages({
    "string.min": "First name must be at least 2 characters",
    "any.required": "First name is required",
  }),
  last_name: Joi.string().trim().min(2).max(60).required().messages({
    "string.min": "Last name must be at least 2 characters",
    "any.required": "last name is required",
  }),
  username: Joi.string().trim().min(3).required().messages({
    "string.min": "Username must be at least 3 characters",
    "any.required": "Username is required",
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[0-9]/, "number")
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.name": "Password must contain at least one {#name}",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});
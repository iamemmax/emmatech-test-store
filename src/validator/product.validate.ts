import Joi from "joi"
import { CategoryProps } from "../schema/category/category.model"
import { productsProps, productReviewProps } from "../schema/product/prodect.model"

export const productCategory = Joi.object<Pick<CategoryProps, "name">>({
    name: Joi.string().required(),

})
// export const validateProductSlider = Joi.object<productSliderProps>({
//     title: Joi.string().required(),
//     category: Joi.required(),
//     postedBy: Joi.required(),
//     img: Joi.string().required()

// })
export const validateProduct = Joi.object<productsProps>({
    title: Joi.string().required(),
    description: Joi.string().required(),
    brand: Joi.string(),
    category: Joi.required(),
    userId: Joi.required(),
    // productImgs isn't in req.body — multer diverts uploaded files to
    // req.files, and createNewProduct reads them from there directly.
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    // .single() lets a form field sent once (a plain string, not an array —
    // how multipart/form-data behaves when there's only one value) still
    // pass; Joi normally requires an actual array.
    size: Joi.array<string>().items(Joi.string()).single().required(),
    colors: Joi.array<string>().items(Joi.string()).single().required()

})

export const validateReviewProduct = Joi.object<productReviewProps>({
    comment: Joi.string().required(),
    review: Joi.number().required(),
    userId: Joi.required(),
    reviewDate: Joi.date()

})

import { isValidObjectId } from "mongoose";

const objectId = Joi.string().custom((value, helpers) => {
  if (!isValidObjectId(value)) return helpers.error("any.invalid");
  return value;
}, "ObjectId validation").messages({
  "any.invalid": "must be a valid id",
});

// multipart sends one value as a string, several as an array — accept both
const stringList = Joi.alternatives().try(
  Joi.array().items(Joi.string().trim()),
  Joi.string().trim()
).custom(v => (Array.isArray(v) ? v : [v]));

export const updateProductSchema = Joi.object({
  brand: Joi.string().trim().min(1).max(100),
  title: Joi.string().trim().min(1).max(200),
  category: objectId,
  description: Joi.string().trim().max(5000).allow(""),
  price: Joi.number().positive().precision(2),
  quantity: Joi.number().integer().min(0),
  size: stringList,
  colors: stringList,
  removeImages: stringList,
})
  .min(1)
  .messages({
    "object.min": "no fields to update",
  });
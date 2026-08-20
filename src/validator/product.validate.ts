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
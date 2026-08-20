import {Router} from "express"
import { createNewProduct, deleteProduct, getProductsList, getSingleProduct, updateProduct } from "../../controllers/products/product.controller";
import uploadMiddleware from "../../middlewares/upload.middleware";
import { admin, protect } from "../../middlewares/auth";
import { validate } from "../../validator/validate";
import { updateProductSchema, validateProduct } from "../../validator/product.validate";

const productRouter = Router()
productRouter.post(
  "/create",
  protect, admin,
  uploadMiddleware("products").array("productImgs", 5), // field name, max count — must run before validate() so multer can parse the multipart body into req.body first
  validate(validateProduct),
  createNewProduct
);
productRouter.delete("/delete/:identifier", protect, admin, deleteProduct);
productRouter.get("/:identifier", protect, getSingleProduct);
productRouter.patch(
  "/update/:identifier",
  protect,
  admin,
  uploadMiddleware("products").array("productImgs", 6),
  validate(updateProductSchema),
  updateProduct
);
productRouter.get("/", protect, getProductsList)

export default productRouter
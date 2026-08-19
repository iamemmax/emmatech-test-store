import  {Router}  from "express";
import { createProductCategory, deleteCategoryById, getCategoryList,getSingleCategory, updateCategory } from "../../controllers/categories/category.controller";
import { admin, protect } from "../../middlewares/auth";

const categoryRouter = Router()
categoryRouter.post("/create",protect, admin, createProductCategory)
categoryRouter.get("/:categoryId",protect, getSingleCategory)
categoryRouter.patch("/update/:categoryId",protect, admin, updateCategory)
categoryRouter.delete("/delete/:categoryId",protect, admin, deleteCategoryById)
categoryRouter.get("/",protect, getCategoryList)

export default categoryRouter
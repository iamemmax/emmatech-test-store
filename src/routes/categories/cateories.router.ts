import  {Router}  from "express";
import { createProductCategory, getCategoryList,getSingleCategory } from "../../controllers/categories/category.controller";
import { admin, protect } from "../../middlewares/auth";

const categoryRouter = Router()
categoryRouter.post("/create",protect, admin, createProductCategory)
categoryRouter.get("/:categoryId",protect, getSingleCategory)
categoryRouter.get("/",protect, getCategoryList)

export default categoryRouter
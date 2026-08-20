import categoryModel, { CategoryProps } from "../../schema/category/category.model";
import { Request, Response } from 'express';
import AsyncHandler from 'express-async-handler';
import { HydratedDocument } from "mongoose";


//@DESC:create a product category
//@METHOD:Post
//@ROUTES:localhost:5000/api/category/create
export const createProductCategory = async (req: Request<{}, {}, CategoryProps>, res: Response) => {
    const { name } = req.body
    try {
        const categoryExist = await categoryModel.findOne<CategoryProps>({ name })


        if (categoryExist) {
            return res.status(401).json({
                success: false,
                message: "Category already exist"
            })
        } else {
            const createCategory: HydratedDocument<CategoryProps> = await categoryModel.create({
                name
            })
            if (createCategory) {
                return res.status(200).json({
                    success: true,
                    message: "Category created successfully",
                    data: createCategory
                })
            } else {
                res.status(401).json({
                    success: false,
                    message: "Error creating category"
                })
            }
        }
    } catch (error) {
        res.status(401);
        throw new Error("Invalid category data");
    }
}


// @DESC:list all categorys
//@METHOD:get
//@ROUTES:localhost:5000/api/categories

export const getCategoryList = AsyncHandler(async (req: Request, res: Response) => {
    try {
        const categories = await categoryModel.find().select("-__v ")
        if (categories) {
            res.status(200).json({
                success: true,
                count: categories.length,
                message: "Categories retrieved successfully",
                data: categories
            })
        } else {
            res.status(401).json({
                success: false,
                message: "Error retrieving categories"
            })
        }
    } catch (error: any) {
        res.status(405).json({ msg: error.message })
    }
})



// @DESC:get single category
//@METHOD:GET
//@ROUTES:localhost:3001/api/category/:categoryId
export const getSingleCategory = AsyncHandler(async (req: Request<{ categoryId: string }>, res: Response) => {
    const { categoryId } = req.params
    try {
        if (!categoryId) {
            res.status(401).json({
                success: false,
                message: "category id is required"
            })
        } else {
            const category = await categoryModel.findOne({ categoryId }).select("-__v")
            if (category) {
                res.status(200).json({
                    success: true,
                    message: "Category retrieved successfully",
                    data: category
                })
            } else {
                res.status(401).json({
                    success: false,
                    message: "Category not found"
                })
            }
        }
    } catch (error: any) {
        res.status(405).json({ msg: error.message })
    }
})

//@DESC:update a category
//@METHOD:patch
//@ROUTES:localhost:5000/api/category/update/:categoryId

export const updateCategory = AsyncHandler(async (req: Request<{ categoryId: string }>, res: Response) => {
    const { categoryId } = req.params
    const { name } = req.body
    try {
        if (!categoryId) {
            res.status(401).json({
                success: false,
                message: "category id is required"
            })
        } else {
            const category = await categoryModel.findOne({ categoryId }).select("-__v")
            const updatedCategory = await categoryModel.findOneAndUpdate({ categoryId }, { $set: { name: name || category?.name } }, { new: true }).select("-__v -_id")
            if (updatedCategory) {

                res.status(200).json({
                    success: true,
                    message: "Category updated successfully",
                    data: updatedCategory
                })

            } else {
                res.status(401).json({
                    success: false,
                    message: "Error updating category"
                })
            }
        }
    } catch (error: any) {
        res.status(405).json({ msg: error.message })
    }

})


// @DESC:delete category by admin
//@METHOD:Delete
//@ROUTES:localhost:3001/api/category/:categoryId

export const deleteCategoryById = AsyncHandler(async (req: Request<{ categoryId: string }>, res: Response) => {
    const { categoryId } = req.params
    try {
        if (!categoryId) {
            res.status(401).json({
                success: false,
                message: "category id is required"
            })
        } else {
            const category = await categoryModel.findOne({ categoryId })
            if (category) {
                const deletedCategory = await categoryModel.findOneAndDelete({ categoryId })
                if (deletedCategory) {
                    res.status(200).json({
                        success: true,
                        message: "Category deleted successfully",
                        data: deletedCategory
                    })
                } else {
                    res.status(401).json({
                        success: false,
                        message: "Error deleting category"
                    })
                }
            } else {
                res.status(401).json({
                    success: false,
                    message: "Category not found"
                })
            }
        }
    } catch (error: any) {
        res.status(405).json({ msg: error.message })
    }

})


import { Request, Response } from 'express';
import AsyncHandler from 'express-async-handler';
import { HydratedDocument, isValidObjectId } from "mongoose";
import productModel, { productsProps } from '../../schema/product/prodect.model';
import { destroyImages } from '../../middlewares/upload.middleware';
// in the controller
// await productModel.create({ ...req.body, productImgs });


//@DESC:create a product category
//@METHOD:Post
//@ROUTES:localhost:5000/api/category/create
export const createNewProduct = async (req: Request<{}, {}, productsProps>, res: Response) => {
    const { brand, title, category, description, price, quantity, userId, size, colors } = req.body

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400);
        throw new Error(
            "No images received — make sure this request is sent as multipart/form-data (not JSON), with at least one file under the 'productImgs' field."
        );
    }
    const productImgs = (req.files as Express.Multer.File[]).map(f => ({
        img_url: f.path,
        img_id: f.filename,
    }));
    
    try {
        const productExist = await productModel.findOne({ title })
        if (productExist) {
            return res.status(401).json({ msg: `product already exist` })
        } else {
            const saveProduct: HydratedDocument<productsProps> = await productModel.create({ brand, title, category, description, price, productImgs, quantity, userId, size, colors })
            if (saveProduct) {
                return res.status(201).json({
                    res: "ok",
                    msg: "product created successfully",
                    products: saveProduct
                })
            } else {
                return res.status(401).json({
                    res: "fail",
                    msg: "unable to created product",
                })
            }
        }
    } catch (error: any) {
        res.status(501).json({
            res: "fail",
            msg: error.message
        })
    }

}


//@DESC:get all products
//@METHOD:get
//@ROUTES:localhost:5000/api/proucts

export const getProductsList = AsyncHandler(async (req: Request, res: Response) => {
   try {
     const productList = await productModel.find<productsProps>({}).populate("userId category", " -password -__v -token -updatedAt -createdAt").select("-__v").sort({ "createdAt": -1 })

    res.json({
        msg: "product list retrieved successfully",
        count:productList.length,
        res: "ok",
        data: productList
    })
   } catch (error:any) {
     res.status(501).json({
            res: "fail",
            msg: error.message
        })
   }
})


//@DESC:get single products
//@METHOD:get
//@ROUTES:localhost:5000/api/proucts/slug or id

export const getSingleProduct = AsyncHandler(
  async (req: Request<{ identifier: string }>, res: Response) => {
    const { identifier } = req.params;

   try {
     const query = isValidObjectId(identifier)
      ? { _id: identifier }
      : { slug: identifier };

    const product = await productModel
      .findOne(query)
      .populate("userId", "-password -__v -token -updatedAt -createdAt")
      .populate("category", "-__v -_id -createdAt -updatedAt")
      .select("-__v");

    if (!product) {
      res.status(404);
      throw new Error("product not found");
    }

    res.status(200).json({ res: "ok", product });
   } catch (error:any) {
     res.status(501).json({
            res: "fail",
            msg: error.message
        })
   }
  }
);


//@DESC:get single products
//@METHOD:get
//@ROUTES:localhost:5000/api/proucts/delete/slug or id

export const deleteProduct = AsyncHandler(
  async (req: Request<{ identifier: string }>, res: Response) => {
    const { identifier } = req.params;

   try {
     const query = isValidObjectId(identifier)
      ? { _id: identifier }
      : { slug: identifier };

    const product = await productModel
      .findOne(query)
      .populate("userId", "-password -__v -token -updatedAt -createdAt")
      .populate("category", "-__v -_id -createdAt -updatedAt")
      .select("-__v");

    if (!product) {
      res.status(404);
      throw new Error("product not found");
    }

    const imageIds = product.productImgs.map(img => img.img_id);
    if(product){
        await destroyImages(imageIds);
        const deleteProduct = await productModel.findOneAndDelete(query)
        if(deleteProduct){
    
            res.status(200).json({ res: "products deleted successfully", product });
        }
    }
   } catch (error:any) {
     res.status(501).json({
            res: "fail",
            msg: error.message
        })
   }
  }
);


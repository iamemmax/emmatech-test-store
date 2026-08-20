

import { NextFunction, Request, Response } from 'express';
import AsyncHandler from 'express-async-handler';
import { HydratedDocument, isValidObjectId } from "mongoose";
import productModel, { productsProps } from '../../schema/product/prodect.model';
import { destroyImages } from '../../middlewares/upload.middleware';
import slugify from "slugify"
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
      count: productList.length,
      res: "ok",
      data: productList
    })
  } catch (error: any) {
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
    } catch (error: any) {
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
      if (product) {
        await destroyImages(imageIds);
        const deleteProduct = await productModel.findOneAndDelete(query)
        if (deleteProduct) {

          res.status(200).json({ res: "products deleted successfully", product });
        }
      }
    } catch (error: any) {
      res.status(501).json({
        res: "fail",
        msg: error.message
      })
    }
  }
);

// export const updateProduct = async (



//   req: Request<{ identifier: string }>,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { identifier } = req.params;
//   const files = req.files as Express.Multer.File[] | undefined;

//   // files are already on Cloudinary by the time we get here —
//   // clean them up on any path that doesn't commit them
//   const cleanup = async () => {
//     if (files?.length) {
//       await destroyImages(files.map(f => f.filename)).catch(() => {});
//     }
//   };

//   try {
//     const { removeImages = [], ...updates } = req.body as Record<string, any> & {
//       removeImages?: string[];
//     };

//     const query = isValidObjectId(identifier)
//       ? { _id: identifier }
//       : { slug: identifier };

//     const product = await productModel.findOne(query);
//     if (!product) {
//       await cleanup();
//       return res.status(404).json({ res: "error", msg: "product not found" });
//     }

//     if (updates.title && updates.title !== product.title) {
//       updates.slug = slugify(updates.title, { lower: true, strict: true });
//     }

//     const ownedIds = product.productImgs.map(img => img.img_id);
//     const invalid = removeImages.filter((id: string) => !ownedIds.includes(id));
//     if (invalid.length) {
//       await cleanup();
//       return res.status(400).json({
//         res: "error",
//         msg: `these images do not belong to this product: ${invalid.join(", ")}`,
//       });
//     }

//     const kept = product.productImgs.filter(img => !removeImages.includes(img.img_id));
//     const added = (files ?? []).map(f => ({ img_url: f.path, img_id: f.filename }));

//     if (removeImages.length || added.length) {
//       const nextImgs = [...kept, ...added];

//       if (nextImgs.length === 0) {
//         await cleanup();
//         return res.status(400).json({
//           res: "error",
//           msg: "a product must keep at least one image",
//         });
//       }

//       if (nextImgs.length > 5) {
//         await cleanup();
//         return res.status(400).json({
//           res: "error",
//           msg: `maximum 5 images per product — this product has ${kept.length} and you are adding ${added.length}`,
//         });
//       }

//       updates.productImgs = nextImgs;
//     }

//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({ res: "error", msg: "no changes submitted" });
//     }

//     const updated = await productModel
//       .findByIdAndUpdate(
//         product._id,
//         { $set: updates },
//         { new: true, runValidators: true }
//       )
//       .populate("userId", "-password -__v -token -updatedAt -createdAt")
//       .populate("category", "-__v -_id -createdAt -updatedAt")
//       .select("-__v");

//     // only destroy the OLD images once the write has succeeded
//     if (removeImages.length) {
//       await destroyImages(removeImages);
//     }

//     return res.status(200).json({
//       res: "ok",
//       msg: "product updated successfully",
//       products: updated,
//     });
//   } catch (error) {
//     await cleanup();
//     next(error);
//   }
// };



export const updateProduct = async (
  req: Request<{ identifier: string }>,
  res: Response,
  next: NextFunction
) => {
  const { identifier } = req.params;
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  const cleanup = async () => {
    if (files.length) {
      await destroyImages(files.map(f => f.filename)).catch(() => {});
    }
  };

  try {
    const query = isValidObjectId(identifier)
      ? { _id: identifier }
      : { slug: identifier };

    const product = await productModel.findOne(query);

    if (!product) {
      await cleanup();
      return res.status(404).json({ res: "fail", msg: "product not found" });
    }

    console.log("")
    const raw = req.body.removeImages;
    const removeImages: string[] = raw ? (Array.isArray(raw) ? raw : [raw]) : [];

    const ownedIds = product.productImgs.map(img => img.img_id);
    const invalid = removeImages.filter(id => !ownedIds.includes(id));
    if (invalid.length) {
      await cleanup();
      return res.status(400).json({
        res: "fail",
        msg: `these images do not belong to this product: ${invalid.join(", ")}`,
      });
    }

    const kept = product.productImgs.filter(img => !removeImages.includes(img.img_id));
    const added = files.map(f => ({ img_url: f.path, img_id: f.filename }));
    const nextImgs = [...kept, ...added];

    if (removeImages.length || added.length) {
      if (nextImgs.length === 0) {
        await cleanup();
        return res.status(400).json({
          res: "fail",
          msg: "a product must keep at least one image",
        });
      }
      if (nextImgs.length > 56) {
        await cleanup();
        return res.status(400).json({
          res: "fail",
          msg: `maximum 5 images — product has ${kept.length}, you are adding ${added.length}`,
        });
      }
    }

    const updated = await productModel
      .findByIdAndUpdate(
        product._id,
        {
          $set: {
            brand: req.body.brand ?? product.brand,
            title: req.body.title ?? product.title,
            category: req.body.category ?? product.category,
            description: req.body.description ?? product.description,
            price: req.body.price ?? product.price,
            quantity: req.body.quantity ?? product.quantity,
            size: req.body.size ?? product.size,
            colors: req.body.colors ?? product.colors,
            productImgs: nextImgs,
          },
        },
        { new: true, runValidators: true }
      )
      .populate("userId", "-password -__v -token -updatedAt -createdAt")
      .populate("category", "-__v -_id -createdAt -updatedAt")
      .select("-__v");

    // destroy old images only after the write succeeds
    if (removeImages.length) {
      await destroyImages(removeImages);
    }

    return res.status(200).json({
      res: "ok",
      msg: "product updated successfully",
      data: updated,
    });
  } catch (error: any) {
    await cleanup();
    return res.status(500).json({ res: "fail", msg: error.message });
  }
};
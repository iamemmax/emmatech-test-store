import mongoose, { Schema, Types } from "mongoose";
import crypto from "crypto";
import slugify from "slugify"



export interface productReviewProps {
    userId: Types.ObjectId;
    review: number
    comment: string
    reviewDate: Date
}
export interface productImgProps {
    img_url: string;
    img_id: string;
}
export interface productsProps {
    productId: string;
    title: string;
    slug: string;
    brand: string;
    description: string;
    category: Types.ObjectId;
    productImgs: productImgProps[];
    size: string[];
    colors: string[];
    price: number;
    quantity: number;
    sold: number;
    userId: Types.ObjectId;
    numReview: number;
    rating: number;
    updatedAt?: Date;
    createdAt?: Date;
    productReviews: productReviewProps[]
}

const productImgSchema = new mongoose.Schema<productImgProps>(
    {
        img_url: { type: String, required: true },
        img_id: { type: String, required: true },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema<productsProps>({
    productId: {
        type: String,
        default: () => `productId_${crypto.randomUUID().slice(0, 8)}`
    },
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        require: true,

    },

    productImgs: [productImgSchema],
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "categories",
        required: true,
        trim: true,
    },
    size: {
        type: [],
        required: true
    },
    colors: {
        type: [],
        required: true
    },

    brand: {
        type: String,
        // required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    sold: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    productReviews: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },

        review: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true,

        },
        reviewDate: { type: Date, required: true },

    }],
    numReview: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.pre("validate", function () {
    this.slug = slugify(this.title, {
        lower: true,
        // strict:true
    })
})
const productModel = mongoose.model<productsProps>("products", productSchema)
export default productModel
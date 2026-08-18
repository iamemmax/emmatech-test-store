import mongoose from "mongoose";
import crypto from "crypto";
export interface CategoryProps extends mongoose.Document {
    name: string;
    categoryId: string;
    updatedAt?: Date;
    createdAt?: Date;
}

const categorySchema = new mongoose.Schema<CategoryProps>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    categoryId: {
        type: String,
        unique: true,
        default: () => `categoryId_${crypto.randomUUID().slice(0, 8)}`
    }

}, { timestamps: true });


const categoryModel = mongoose.model<CategoryProps>("categories", categorySchema)
export default categoryModel 
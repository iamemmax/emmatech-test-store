import mongoose from "mongoose";
import { Role } from "../../schema/users/user.model";
export interface UserProps extends mongoose.Document {
    userId: string
    first_name: string;
    email: string;
    username: string;
    last_name: string;
    password: string;
    roles: Role[];
    verified: boolean;
    token: number;
    phone: string;
    updatedAt?: Date;
    createdAt?: Date;
}
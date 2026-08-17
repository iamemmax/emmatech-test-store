import mongoose from "mongoose";
import "dotenv/config";
import { env } from "../utils/require-env";

const connectDb = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`Database connected: ${conn.connection.host}`.blue);
  } catch (error) {
    console.error("Database error:".red, error);
    process.exit(1);
  }
};

export default connectDb;
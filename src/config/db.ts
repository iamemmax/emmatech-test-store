import mongoose from "mongoose";
import "dotenv/config";
import { env } from "../utils/require-env";

const MAX_RETRIES = 8;
const RETRY_DELAY_MS = 3000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Connects to MongoDB, retrying on failure (e.g. a transient DNS SRV
 * lookup blip) instead of killing the whole process on the first hiccup.
 * Only exits after MAX_RETRIES straight failures.
 */
const connectDb = async (): Promise<void> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(env.mongoUri);
      console.log(`Database connected: ${conn.connection.host}`.blue);
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${MAX_RETRIES} failed:`.red, error);

      if (attempt === MAX_RETRIES) {
        console.error("Giving up after max retries.".red);
        process.exit(1);
      }

      await sleep(RETRY_DELAY_MS);
    }
  }
};

export default connectDb;
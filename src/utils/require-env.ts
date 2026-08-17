import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

const required = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required env variable: ${key}`);
    return value;
};

// jwt.sign's `expiresIn` wants `number | StringValue` (a branded duration
// string like "15m"/"7d"), not a plain `string` — cast once here so callers
// can just pass env.jwtAccessExpiresIn straight into SignOptions.
const asExpiresIn = (value: string): SignOptions["expiresIn"] =>
    value as SignOptions["expiresIn"];

export const env = {
    port: Number(process.env.PORT) || 5000,
    mongoUri: required("MONGO_URI"),
    nodeEnv: process.env.NODE_ENV ?? "development",
    jwtSecret: required("JWT_SECRET"),
    jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
    jwtAccessExpiresIn: asExpiresIn(process.env.JWT_ACCESS_EXPIRES_IN ?? "15m"),
    jwtRefreshExpiresIn: asExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN ?? "30d"),
} as const;
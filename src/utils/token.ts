import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Response } from "express";
import { env } from "./require-env";
import { IUserDocument } from "../schema/users/user.model";

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "strict" as const,
  maxAge,
});

export const generateAccessToken = (userId: string): string =>
  jwt.sign({ userId, jti: crypto.randomUUID() }, env.jwtSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });

// jti makes every refresh token unique even when issued within the same
// second, so rotation always produces a distinct token to compare against.
export const generateRefreshToken = (userId: string): string =>
  jwt.sign({ userId, jti: crypto.randomUUID() }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });

/**
 * Issues a fresh access + refresh token pair for `user`, sets both as
 * httpOnly cookies ("jwt" / "refreshToken"), and persists a hash of the new
 * refresh token on the user doc so it can be verified and revoked
 * server-side. Call this on login, register, and every successful refresh
 * (rotation — the previous refresh token stops matching once this runs).
 *
 * Returns the access token string too, so callers that want it in the JSON
 * body (mobile clients, manual testing, Authorization-header auth) can
 * include it. The refresh token stays cookie-only — it's longer-lived and
 * more damaging if leaked, so it's never handed back in a response body.
 */
export const issueTokens = async (
  res: Response,
  user: IUserDocument
): Promise<string> => {
  const userId = user.id as string;

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  user.setRefreshToken(refreshToken, new Date(Date.now() + REFRESH_COOKIE_MAX_AGE));
  // validateModifiedOnly: this save only persists token bookkeeping — it
  // shouldn't fail because an unrelated profile field (e.g. username on an
  // older account) doesn't pass today's schema requirements.
  await user.save({ validateModifiedOnly: true });

  res.cookie("jwt", accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE));
  res.cookie("refreshToken", refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE));

  return accessToken;
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie("jwt");
  res.clearCookie("refreshToken");
};

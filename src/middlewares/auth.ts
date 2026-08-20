import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AsyncHandler from "express-async-handler";
import userModel, { Role } from "../schema/users/user.model";
import { env } from "../utils/require-env";

interface TokenPayload extends JwtPayload {
  userId: string;
}

/**
 * Verifies the access token and attaches the current user to the request.
 * Accepts either the httpOnly "jwt" cookie or an "Authorization: Bearer
 * <token>" header — login/register/refresh all return the token in the
 * JSON body specifically so non-cookie clients (Authorization header,
 * mobile, etc.) have a way to authenticate too.
 */
export const protect = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const token = req.cookies?.jwt ?? bearerToken;

    if (!token) {
      res.status(401);
      throw new Error("Not authorised, no token");
    }

    let decoded: TokenPayload;

    // Only the verify call belongs in the try — otherwise this catch
    // swallows your own errors and relabels them "token failed".
    try {
      decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    } catch {
      res.status(401);
      throw new Error("Not authorised, token failed");
    }

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      res.status(401);
      throw new Error("Not authorised, user no longer exists");
    }

    req.user = user;
    next();
  }
);

/** Allows only users holding an elevated role. Must run after `protect`. */
export const admin = (req: Request, res: Response, next: NextFunction): void => {
  const allowed: Role[] = ["admin", "super-admin"];

  if (!req.user?.roles?.some((role) => allowed.includes(role))) {
    res.status(403);
    throw new Error("Admin access required");
  }

  next();
};

/** Factory for arbitrary role checks: authorise("super-admin") */
export const authorise = (...allowed: Role[]) =>(req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.roles?.some((role) => allowed.includes(role))) {
      res.status(403);
      throw new Error("Insufficient permissions");
    }
    next();
  };
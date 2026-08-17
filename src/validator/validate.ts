import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validate =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({
        message: "Request body is missing or not JSON. Set Content-Type: application/json",
      });
      return;
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((d) => ({
          field: d.path.join("."),
          message: d.message,
        })),
      });
      return;
    }

    req.body = value;
    next();
  };
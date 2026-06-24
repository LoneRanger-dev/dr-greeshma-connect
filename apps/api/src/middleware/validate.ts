import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { zodErrorsToObject } from "@dr-greeshma/shared";

type Target = "body" | "query" | "params";

/** Validates req[target] against the Zod schema; replaces it with the parsed (coerced) value. */
export function validate(schema: ZodSchema, target: Target = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: zodErrorsToObject(result.error),
      });
      return;
    }
    // Replace with coerced/defaulted values from Zod
    if (target === "body")   req.body   = result.data;
    if (target === "query")  req.query  = result.data as typeof req.query;
    if (target === "params") req.params = result.data as typeof req.params;
    next();
  };
}

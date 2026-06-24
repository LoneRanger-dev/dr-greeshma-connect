import { Router, IRouter } from "express";
import { validate } from "../../middleware/validate";
import { GetSlotsSchema, GetAvailabilitySchema } from "@dr-greeshma/shared";
import { getSlotsHandler, getAvailabilityHandler } from "./slots.controller";

const router: IRouter = Router();

// GET /slots?serviceId=&date=YYYY-MM-DD
router.get("/", validate(GetSlotsSchema, "query"), getSlotsHandler);

// GET /slots/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/availability", validate(GetAvailabilitySchema, "query"), getAvailabilityHandler);

export { router as slotsRouter };

import { Router } from "express";
import passport from "passport";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
  addManager,
  removeManager,
} from "../controllers/location.controller.js";
import { validateRequest } from "../middleware/validate.js";
import {
  createLocationSchema,
  updateLocationSchema,
  fetchLocationsSchema,
  managerActionSchema,
} from "../validations/location.js";
import { idParamSchema } from "../validations/common.js";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);

router.get("/view", validateRequest(fetchLocationsSchema, "query"), getAll);

router.get(
  "/:id",
  validateRequest(idParamSchema, "params"),
  getOne
);

router.post(
  "/create",
  validateRequest(createLocationSchema, "body"),
  create
);

router
  .route("/edit/:id")
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(updateLocationSchema, "body"),
    update
  );

router
  .route("/delete/:id")
  .delete(validateRequest(idParamSchema, "params"), remove);

// manager assignment
router
  .route("/:id/managers")
  .post(
    validateRequest(idParamSchema, "params"),
    validateRequest(managerActionSchema, "body"),
    addManager
  )
  .delete(
    validateRequest(idParamSchema, "params"),
    validateRequest(managerActionSchema, "body"),
    removeManager
  );

export default router;
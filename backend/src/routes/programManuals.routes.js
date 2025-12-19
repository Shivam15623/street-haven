import { Router } from "express";
import {
  AddProgramManual,
  DeleteProgramManual,
  EditProgramManual,
  GetProgramManuals,
} from "../controllers/programManual.controller.js";
import passport from "passport";
import { upload } from "../middleware/multer.js";
import { validateRequest } from "../middleware/validate.js";
import {
  createProgramManualSchema,
  editProgramManualSchema,
  fetchProgramMannuals,
} from "../validations/ProgramManualSchema.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { idParamSchema } from "../validations/common.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));

router.route("/view").get(validateRequest(fetchProgramMannuals),GetProgramManuals);
router
  .route("/create")
  .post(
    upload.single("attachment"),
    validateRequest(createProgramManualSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.CREATE_PROGRAM_MANUAL }),
    AddProgramManual
  );
router
  .route("/edit/:id")
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(editProgramManualSchema, "body"),
    upload.single("attachment"),
    authorizePermissions({ action: PERMISSIONS.EDIT_PROGRAM_MANUAL }),
    EditProgramManual
  );
router
  .route("/delete/:id")
  .delete(
    authorizePermissions({ action: PERMISSIONS.DELETE_PROGRAM_MANUAL }),
    validateRequest(idParamSchema, "params"),
    DeleteProgramManual
  );

export default router;

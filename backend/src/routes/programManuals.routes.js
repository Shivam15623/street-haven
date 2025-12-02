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
} from "../validations/ProgramManualSchema.js";
import { authorizePermissions } from "../middleware/AuthRole.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));

router.route("/view").get(GetProgramManuals);
router
  .route("/create")
  .post(
    upload.single("attachment"),
    authorizePermissions({ moduleKey: "program_mannuals", action: "create" }),
    AddProgramManual
  );
router
  .route("/edit/:id")
  .patch(
    validateRequest(editProgramManualSchema, "body"),
    upload.single("attachment"),
    authorizePermissions({ moduleKey: "program_mannuals", action: "update" }),
    EditProgramManual
  );
router
  .route("/delete/:id")
  .delete(
    authorizePermissions({ moduleKey: "program_mannuals", action: "delete" }),
    DeleteProgramManual
  );

export default router;

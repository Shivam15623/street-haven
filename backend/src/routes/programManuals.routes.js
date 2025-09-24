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
import requireAdminRole from "../middleware/AuthRole.js";
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));

router.route("/view").get(GetProgramManuals);
router
  .route("/create")
  .post(upload.single("attachment"), requireAdminRole, AddProgramManual);
router
  .route("/edit/:id")
  .patch(
    validateRequest(editProgramManualSchema, "body"),
    upload.single("attachment"),
    requireAdminRole,
    EditProgramManual
  );
router.route("/delete/:id").delete(requireAdminRole, DeleteProgramManual);

export default router;

import { Router } from "express";
import passport from "passport";
import { upload } from "../middleware/multer.js";
import {
  createCollectiveAgreement,
  deleteCollectiveAgreement,
  editCollectiveAgreement,
  fetchCollectiveAgreements,
} from "../controllers/CollectiveAgreement.controller.js";
import { validateRequest } from "../middleware/validate.js";
import { Agreementschema } from "../validations/agreement.js";
import { idParamSchema } from "../validations/common.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);
router
  .route("/create")
  .post(
    upload.single("attachment"),
    validateRequest(Agreementschema, "body"),
    authorizePermissions({ action: PERMISSIONS.CREATE_COLLECTIVE_AGREEMENT }),
    createCollectiveAgreement
  );
router.route("/").get(fetchCollectiveAgreements);
router
  .route("/edit/:id")
  .patch(
    validateRequest(idParamSchema, "params"),
    upload.single("attachment"),
    validateRequest(Agreementschema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_COLLECTIVE_AGREEMENT }),
    editCollectiveAgreement
  );
router
  .route("/delete/:id")
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_COLLECTIVE_AGREEMENT }),
    deleteCollectiveAgreement
  );
export default router;

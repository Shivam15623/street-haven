import { Router } from "express";
import { createClientFeedback, createClientIncident, createEmployeeIncident, createFAF, createPaymentRequisition } from "../controllers/form.controller.js";
import { upload } from "../middleware/multer.js";
import { functionalAbiltiesData } from "../validations/formSchemas.js";
import { validateRequest } from "../middleware/validate.js";

const router = Router();

router.route("/clientIncident").post(createClientIncident)
router.route("/clientFeedback").post(createClientFeedback)
router.route("/employeeIncident").post(createEmployeeIncident)
router.route("/paymentRequistion").post(upload.single("invoiceAttachment"),createPaymentRequisition)
router.route("/functionalAbilties").post(validateRequest(functionalAbiltiesData, "body"),createFAF)
export default router

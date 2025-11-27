import { Router } from "express";
import { createClientFeedback, createClientIncident, createEmployeeIncident, createPaymentRequisition } from "../controllers/form.controller.js";
import { upload } from "../middleware/multer.js";

const router = Router();

router.route("/clientIncident").post(createClientIncident)
router.route("/clientFeedback").post(createClientFeedback)
router.route("/employeeIncident").post(createEmployeeIncident)
router.route("/paymentRequistion").post(upload.single("invoiceAttachment"),createPaymentRequisition)
export default router

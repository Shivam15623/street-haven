import { Router } from "express";
import {
  createClientFeedback,
  createClientIncident,
  createEmployeeIncident,
  createFAF,
  createMediaConsent,
  createPaymentRequisition,
  deleteClientFeedback,
  deleteClientIncident,
  deleteEmployeeIncident,
  deleteFAF,
  deleteMediaConsent,
  deletePaymentRequisition,
  editClientFeedback,
  editClientIncident,
  editEmployeeIncident,
  editFAF,
  editMediaConsent,
  editPaymentRequisition,
  generateFilledclientFeedbackPdf,
  generateFilledClientIncident,
  generateFilledEmployeeIncidentPdf,
  generateFilledFAF,
  generateFilledIncidentReport,
  generateFilledMediaConsent,
  generatefilledPaymentPdf,
  generatefilledStaffFeedbackpdf,
  GetAllClientFeedback,
  GetAllClientIncidents,
  GetAllEmployeeIncidents,
  GetAllFunctionalAbilities,
  GetAllMediaConsent,
  GetAllPaymentRequisitions,
  getClientFeedbackById,
  getClientIncidentById,
  getEmployeeIncidentById,
  getFAFById,
  getPaymentRequisitionById,
} from "../controllers/form.controller.js";
import { upload } from "../middleware/multer.js";

import { validateRequest } from "../middleware/validate.js";
import {
  ClientFeedbackFormSchema,
  clientIncidentFormSchema,
  employeeIncidentReportSchema,
  functionalAbilitiesSchema,
  MediaConsentFormSchema,
  paymentRequistionSchema,
} from "../validations/formSchemas.js";
import { idParamSchema } from "../validations/common.js";

const router = Router();

router
  .route("/clientIncident")
  .post(
    validateRequest(clientIncidentFormSchema, "body"),
    createClientIncident
  );
router
  .route("/clientFeedback")
  .post(
    validateRequest(ClientFeedbackFormSchema, "body"),
    createClientFeedback
  );
router
  .route("/employeeIncident")
  .post(
    validateRequest(employeeIncidentReportSchema, "body"),
    createEmployeeIncident
  );
router
  .route("/paymentRequistion")
  .post(
    upload.single("invoiceAttachment"),
    validateRequest(paymentRequistionSchema, "body"),
    createPaymentRequisition
  );
router
  .route("/functionalAbilties")
  .post(validateRequest(functionalAbilitiesSchema, "body"), createFAF);
router
  .route("/mediaConsent")
  .post(validateRequest(MediaConsentFormSchema, "body"), createMediaConsent);

// -------------------- GET routes --------------------
// Client Feedback
router.route("/clientFeedback").get(GetAllClientFeedback);

// Client Incident
router.route("/clientIncident").get(GetAllClientIncidents);

// Employee Incident
router.route("/employeeIncident").get(GetAllEmployeeIncidents);

// Functional Abilities
router.route("/functionalAbilties").get(GetAllFunctionalAbilities);

// Media Consent
router.route("/mediaConsent").get(GetAllMediaConsent);

// Payment Requisition
router.route("/paymentRequistion").get(GetAllPaymentRequisitions);

router
  .route("/clientIncident/:id")
  .get(validateRequest(idParamSchema, "params"), getClientIncidentById)
  .delete(validateRequest(idParamSchema, "params"), deleteClientIncident)
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(clientIncidentFormSchema, "body"),
    editClientIncident
  );

router
  .route("/clientFeedback/:id")
  .get(validateRequest(idParamSchema, "params"), getClientFeedbackById)
  .delete(validateRequest(idParamSchema, "params"), deleteClientFeedback)
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(ClientFeedbackFormSchema, "body"),
    editClientFeedback
  );

router
  .route("/mediaConsent/:id")
  .delete(validateRequest(idParamSchema, "params"), deleteMediaConsent)
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(MediaConsentFormSchema, "body"),
    editMediaConsent
  );

router
  .route("/paymentRequistion/:id")
  .get(validateRequest(idParamSchema, "params"), getPaymentRequisitionById)
  .delete(validateRequest(idParamSchema, "params"), deletePaymentRequisition)
  .patch(
    validateRequest(idParamSchema, "params"),
    upload.single("invoiceAttachment"),
    validateRequest(paymentRequistionSchema, "body"),
    editPaymentRequisition
  );
router
  .route("/employeeIncident/:id")
  .get(validateRequest(idParamSchema, "params"), getEmployeeIncidentById)
  .delete(validateRequest(idParamSchema, "params"), deleteEmployeeIncident)
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(employeeIncidentReportSchema, "body"),
    editEmployeeIncident
  );
router
  .route("/functionalAbilties/:id")
  .get(getFAFById)
  .delete(deleteFAF)
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(functionalAbilitiesSchema, "body"),
    editFAF
  );
router
  .route("/paymentRequistion/pdfForm/:id")
  .get(validateRequest(idParamSchema, "params"), generatefilledPaymentPdf);

router
  .route("/staffFeedback/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    generatefilledStaffFeedbackpdf
  );
router
  .route("/clientIncident/pdfForm/:id")
  .get(validateRequest(idParamSchema, "params"), generateFilledClientIncident);
router
  .route("/clientFeedback/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    generateFilledclientFeedbackPdf
  );
router
  .route("/incidentReport/pdfForm/:id")
  .get(validateRequest(idParamSchema, "params"), generateFilledIncidentReport);
router
  .route("/mediaConsent/pdfForm/:id")
  .get(validateRequest(idParamSchema, "params"), generateFilledMediaConsent);
router
  .route("/employeeIncident/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    generateFilledEmployeeIncidentPdf
  );
router
  .route("/getFaf/pdfForm/:id")
  .get(validateRequest(idParamSchema, "params"), generateFilledFAF);
export default router;

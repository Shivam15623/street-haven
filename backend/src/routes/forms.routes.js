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
import passport from "passport";
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
import { PERMISSIONS } from "../auth/permissions.js";
import { authorizePermissions } from "../middleware/AuthRole.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router
  .route("/clientIncident")
  .post(
    validateRequest(clientIncidentFormSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
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
router
  .route("/clientFeedback")
  .get(
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    GetAllClientFeedback
  );

// Client Incident
router
  .route("/clientIncident")
  .get(
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    GetAllClientIncidents
  );

// Employee Incident
router
  .route("/employeeIncident")
  .get(
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    GetAllEmployeeIncidents
  );

// Functional Abilities
router
  .route("/functionalAbilties")
  .get(
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    GetAllFunctionalAbilities
  );

// Media Consent
router
  .route("/mediaConsent")
  .get(
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    GetAllMediaConsent
  );

// Payment Requisition
router
  .route("/paymentRequistion")
  .get(
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    GetAllPaymentRequisitions
  );

router
  .route("/clientIncident/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    getClientIncidentById
  )
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_FORM }),
    deleteClientIncident
  )
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(clientIncidentFormSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_FORM }),
    editClientIncident
  );

router
  .route("/clientFeedback/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    getClientFeedbackById
  )
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_FORM }),
    deleteClientFeedback
  )
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(ClientFeedbackFormSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_FORM }),
    editClientFeedback
  );

router
  .route("/mediaConsent/:id")
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_FORM }),
    deleteMediaConsent
  )
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(MediaConsentFormSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_FORM }),
    editMediaConsent
  );

router
  .route("/paymentRequistion/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    getPaymentRequisitionById
  )
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_FORM }),
    deletePaymentRequisition
  )
  .patch(
    validateRequest(idParamSchema, "params"),
    upload.single("invoiceAttachment"),
    validateRequest(paymentRequistionSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_FORM }),
    editPaymentRequisition
  );
router
  .route("/employeeIncident/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    getEmployeeIncidentById
  )
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_FORM }),
    deleteEmployeeIncident
  )
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(employeeIncidentReportSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_FORM }),
    editEmployeeIncident
  );
router
  .route("/functionalAbilties/:id")
  .get(
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    getFAFById
  )
  .delete(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.DELETE_FORM }),
    deleteFAF
  )
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(functionalAbilitiesSchema, "body"),
    authorizePermissions({ action: PERMISSIONS.EDIT_FORM }),
    editFAF
  );
router
  .route("/paymentRequistion/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    generatefilledPaymentPdf
  );

router
  .route("/staffFeedback/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    generatefilledStaffFeedbackpdf
  );
router
  .route("/clientIncident/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    generateFilledClientIncident
  );
router
  .route("/clientFeedback/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    generateFilledclientFeedbackPdf
  );
router
  .route("/incidentReport/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    generateFilledIncidentReport
  );
router
  .route("/mediaConsent/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    generateFilledMediaConsent
  );
router
  .route("/employeeIncident/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    generateFilledEmployeeIncidentPdf
  );
router
  .route("/getFaf/pdfForm/:id")
  .get(
    validateRequest(idParamSchema, "params"),
    authorizePermissions({ action: PERMISSIONS.VIEW_SUBMISSIONS }),
    generateFilledFAF
  );
export default router;

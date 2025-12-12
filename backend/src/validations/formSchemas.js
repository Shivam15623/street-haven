import Joi from "joi";
function parseLocalDate(val) {
  const [year, month, day] = val.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

function isSameOrBeforeToday(val) {
  if (!val) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = parseLocalDate(val);

  selected.setHours(0, 0, 0, 0);

  return selected <= today;
}

// Helper for conditional object stripping
const stripIfNot = (condition, schema) =>
  condition ? schema : Joi.forbidden();

export const functionalAbilitiesSchema = Joi.object({
  claimNo: Joi.string().required(),

  worker: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    telephone: Joi.string().required(),
    address: Joi.string().required(),
    cityTown: Joi.string().required(),
    province: Joi.string().required(),
    postalCode: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
  }),

  dateOfAccident: Joi.date().required(),
  employerFaxNo: Joi.string().required(),

  employer: Joi.object({
    fullName: Joi.string().required(),
    telephone: Joi.string().required(),
    address: Joi.string().required(),
    cityTown: Joi.string().required(),
    province: Joi.string().required(),
    postalCode: Joi.string().required(),
  }),

  typeOfJobAtAccident: Joi.string().required(),
  areasOfInjury: Joi.string().required(),

  discussedRTW: Joi.boolean().required(),
  nodateOfDiscusswill: Joi.when("discussedRTW", {
    is: false,
    then: Joi.date()
      .required()
      .messages({ "any.required": "Please fill this field" }),
    otherwise: Joi.forbidden(),
  }),

  employerContactName: Joi.string().optional(),
  position: Joi.string().required(),
  designationOfHealthPro: Joi.string().required(),
  otherDesignation: Joi.when("designationOfHealthPro", {
    is: "Other",
    then: Joi.string()
      .required()
      .messages({ "any.required": "Please specify" }),
    otherwise: Joi.forbidden(),
  }),

  iswsibRegistered: Joi.boolean().optional(),
  wsibId: Joi.string().optional(),
  invoiceNo: Joi.string().optional(),
  srvCode: Joi.string().optional(),
  hstRegNo: Joi.string().optional(),
  hstSrvcCode: Joi.string().optional(),
  hstAmount: Joi.number().optional(),

  healthProfessionalName: Joi.string().optional(),
  hproAddress: Joi.string().optional(),
  hprocityTown: Joi.string().optional(),
  hproProvince: Joi.string().optional(),
  hproPostalCode: Joi.string().optional(),
  hproFax: Joi.string().optional(),

  assesmentDate: Joi.date().required(),

  returnToWorkStatus: Joi.string()
    .valid("noRestrictions", "withRestrictions", "unable")
    .required(),

  abilities: Joi.when("returnToWorkStatus", {
    is: "withRestrictions",
    then: Joi.object({
      walking: Joi.string().required(),
      standing: Joi.string().required(),
      sitting: Joi.string().required(),
      liftingFloorToWaist: Joi.string().required(),
      liftingWaistToShoulder: Joi.string().required(),
      stairClimbing: Joi.string().required(),
      ladderClimbing: Joi.string().required(),
      travelToWork: Joi.object({
        publicTransit: Joi.string().valid("yes", "no").required(),
        car: Joi.string().valid("yes", "no").required(),
      }),
    }),
    otherwise: Joi.forbidden(),
  }),

  restrictions: Joi.when("returnToWorkStatus", {
    is: "withRestrictions",
    then: Joi.object({
      bendingTwisting: Joi.string().optional(),
      chemicalExposure: Joi.string().optional(),
      environmentalExposure: Joi.string().optional(),
      operatingMotorizedEquipment: Joi.string().optional(),
      medicationSideEffects: Joi.string().optional(),
      workAboveShoulder: Joi.string().optional(),

      limitedPushingPulling: Joi.object({
        leftArm: Joi.boolean(),
        rightArm: Joi.boolean(),
        other: Joi.boolean(),
      }),

      exposureToVibration: Joi.object({
        wholeBody: Joi.boolean(),
        handArm: Joi.boolean(),
      }),

      limitedUseOfHands: Joi.object({
        left: Joi.object({
          gripping: Joi.boolean(),
          pinching: Joi.boolean(),
          other: Joi.boolean(),
        }),
        right: Joi.object({
          gripping: Joi.boolean(),
          pinching: Joi.boolean(),
          other: Joi.boolean(),
        }),
      }),
    }),
    otherwise: Joi.forbidden(),
  }),

  commentsOnAbilities: Joi.when("returnToWorkStatus", {
    is: "withRestrictions",
    then: Joi.string()
      .required()
      .messages({ "any.required": "Comments required" }),
    otherwise: Joi.forbidden(),
  }),

  assessmentDuration: Joi.when("returnToWorkStatus", {
    is: "withRestrictions",
    then: Joi.string()
      .valid("1-2 days", "3-7 days", "8-14 days", "14+ days")
      .required()
      .messages({ "any.required": "Assessment duration is required" }),
    otherwise: Joi.forbidden(),
  }),

  isDiscussRTWtoPatient: Joi.when("returnToWorkStatus", {
    is: "withRestrictions",
    then: Joi.boolean().required(),
    otherwise: Joi.forbidden(),
  }),

  nextAppointmentDate: Joi.when("returnToWorkStatus", {
    is: "noRestrictions",
    then: Joi.date().optional(),
    otherwise: Joi.date()
      .required()
      .messages({ "any.required": "Please fill next appointment date" }),
  }),
});

//staff feedback

export const staffFeedbackSchema = Joi.object({
  date: Joi.date().required(),
  location: Joi.string().optional(),
  category: Joi.string()
    .valid("Other", "Behavior", "Equipment", "Safety")
    .default("Other")
    .required()
    .messages({ "any.required": "Category is required to fill" }),
  description: Joi.string().max(500).required(),
  witnesses: Joi.array().items(Joi.string().required()).min(1),
  actionsTaken: Joi.string().max(500).required(),
  reporterName: Joi.string().required(),
});

//incident report

export const incidentReportSchema = Joi.object({
  date: Joi.date().required(),
  location: Joi.string().required(),
  description: Joi.string().max(500).required(),
  witnesses: Joi.array().items(Joi.string().required()).min(1),
  actionsTaken: Joi.string().max(500).required(),
  reporterName: Joi.string().required(),
});

//////////////////////////////////////////////////////Employee Incident Report

export const employeeIncidentReportSchema = Joi.object({
  type: Joi.string().valid("Injury", "Illness", "Near Miss").required(),
  name: Joi.string().required(),
  jobTitle: Joi.string().required(),
  supervisor: Joi.string().required(),
  informedSupervisor: Joi.string().required(),
  injuryDate: Joi.date().required(),
  injuryTime: Joi.string().required(),
  witnessName: Joi.string().allow(null, ""),
  location: Joi.string().required(),
  activityAtTime: Joi.string().required(),
  description: Joi.string().required(),
  preventionSuggestion: Joi.string().required(),
  injuredBodyPartOrRisk: Joi.string().required(),
  sawDoctor: Joi.boolean().required(),
  doctorName: Joi.when("sawDoctor", {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.allow(null, ""),
  }),
  doctorPhone: Joi.when("sawDoctor", {
    is: true,
    then: Joi.string()
      .pattern(
        /^(?:\+1\s?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/
      )
      .required(),
    otherwise: Joi.allow(null, ""),
  }),
  doctorVisitDate: Joi.when("sawDoctor", {
    is: true,
    then: Joi.date().required(),
    otherwise: Joi.allow(null, ""),
  }),
  doctorVisitTime: Joi.when("sawDoctor", {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.allow(null, ""),
  }),
  previousInjury: Joi.boolean().required(),
  previousInjuryDate: Joi.when("previousInjury", {
    is: true,
    then: Joi.date().required(),
    otherwise: Joi.allow(null, ""),
  }),
});

// import * as yup from "yup";

// export const ClientFeedbackFormSchema = yup.object({
//   date: yup.date().required("Date is required").typeError("Invalid date"),

//   location: yup.string().required("Location is required"),

//   clientAddress: yup.string().nullable(), // optional
//   clientEmail: yup.string().email("Enter a valid email").nullable(), // optional

//   clientPhone: yup
//     .string()
//     .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number")
//     .nullable(), // optional

//   clientName: yup.string().nullable(), // optional

//   type: yup
//     .string()
//     .oneOf(
//       [
//         "Disaster",
//         "Drugs",
//         "Property Destruction",
//         "Theft",
//         "Medical / Injury / Health Emergency",
//         "Intruders",
//         "Police Action",
//         "Actual Physical / Sexual Violence",
//         "Threat of Physical / Sexual Violence",
//         "Bomb Threat",
//         "Other",
//       ],
//       "Select a valid incident type"
//     )
//     .required("Feedback type is required"),

//   otherComplaint: yup.string().nullable(),

//   impact: yup.string().required("Impact is required"),

//   outcome: yup.string().required("Outcome is required"),

//   description: yup.string().required("Description is required"),
// });

// export const clientIncidentSchema = yup.object({
//   date: yup
//     .date()
//     .required("Date is required")
//     .typeError("Invalid date"),

//   time: yup
//     .string()
//     .required("Time is required"),

//   place: yup
//     .string()
//     .required("Place of incident is required"),

//   type: yup
//     .string()
//     .oneOf(
//       ["Accident", "Behavior", "Medical", "Property Damage", "Other"],
//       "Invalid incident type"
//     )
//     .required("Incident type is required"),

//   affectedClient: yup
//     .string()
//     .required("Affected client is required"),

//   staffName: yup
//     .string()
//     .required("Staff name is required"),

//   staffEmail: yup
//     .string()
//     .email("Enter a valid email")
//     .nullable(),

//   witnessName: yup.string().nullable(),

//   otherincidentType: yup.string().nullable(),

//   description: yup
//     .string()
//     .required("Description is required"),

//   action: yup
//     .string()
//     .required("Actions taken are required"),

//   debrief: yup.string().required("debrief is required").nullable(),

//   reportingStaffName: yup
//     .string()
//     .required("Reporting staff name is required"),

//   reportedTo: yup
//     .string()
//     .required("Reported to (name/role) is required"),

//   reportingDate: yup
//     .date()
//     .required("Reporting date is required")
//     .typeError("Invalid reporting date"),

//   followUp: yup.string().required("follow up is required").nullable(),

//   reportedToDate: yup
//     .date()
//     .nullable()
//     .typeError("Invalid follow-up date"),
// });

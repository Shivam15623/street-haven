import * as yup from "yup";

export const functionalAbiltiesData = yup.object({
  claimNo: yup.string().required(),
  worker: yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    telephone: yup.string().required(),
    address: yup.string().required(),
    cityTown: yup.string().required(),
    province: yup.string().required(),
    postalCode: yup.string().required(),
    dateOfBirth: yup.date().required(),
  }),

  dateOfAccident: yup.date().required(),
  employerFaxNo: yup.string().required(),

  employer: yup.object({
    fullName: yup.string().required(),
    telephone: yup.string().required(),
    address: yup.string().required(),
    cityTown: yup.string().required(),
    province: yup.string().required(),
    postalCode: yup.string().required(),
  }),

  typeOfJobAtAccident: yup.string().required(),
  areasOfInjury: yup.string().required(),

  discussedRTW: yup.boolean().required(),
  nodateOfDiscusswill: yup.date().when("discussedRTW", {
    is: false,
    then: (s) => s.required("Please fill this field"),
    otherwise: (s) => s.notRequired(),
  }),

  employerContactName: yup.string(),
  position: yup.string().required(),
  designationOfHealthPro: yup.string().required(),
  otherDesignation: yup.string().when("designationOfHealthPro", {
    is: "Other",
    then: (s) => s.required("Please specify"),
  }),

  iswsibRegistered: yup.boolean(),
  wsibId: yup.string(),
  invoiceNo: yup.string(),
  srvCode: yup.string(),
  hstRegNo: yup.string(),
  hstSrvcCode: yup.string(),
  hstAmount: yup.number(),

  healthProfessionalName: yup.string(),
  hproAddress: yup.string(),
  hprocityTown: yup.string(),
  hproProvince: yup.string(),
  hproPostalCode: yup.string(),
  hproFax: yup.string(),

  assesmentDate: yup.date().required(),

  returnToWorkStatus: yup
    .string()
    .oneOf(["noRestrictions", "withRestrictions", "unable"])
    .required(),

  // ------------------------------
  // CONDITIONAL FIELDS START HERE
  // ------------------------------
  abilities: yup.object().when("returnToWorkStatus", {
    is: "withRestrictions",
    then: (schema) =>
      schema.shape({
        walking: yup.string().required("walking is required"),
        standing: yup.string().required("standing is required"),
        sitting: yup.string().required("sitting is required"),
        liftingFloorToWaist: yup
          .string()
          .required("liftingFloorToWaist is required"),
        liftingWaistToShoulder: yup
          .string()
          .required("liftingWaistToShoulder is required"),
        stairClimbing: yup.string().required("stair climb is required"),
        ladderClimbing: yup.string().required("ladder climb is required"),
        travelToWork: yup.object({
          publicTransit: yup
            .string()
            .oneOf(["yes", "no"])
            .required("publicTransit answer is required"),
          car: yup.string().oneOf(["yes", "no"]).required("car is required"),
        }),
      }),
    otherwise: (schema) => schema.strip(),
  }),

  restrictions: yup.object().when("returnToWorkStatus", {
    is: "withRestrictions",
    then: (schema) =>
      schema.shape({
        bendingTwisting: yup.string(),
        chemicalExposure: yup.string(),
        environmentalExposure: yup.string(),
        operatingMotorizedEquipment: yup.string(),
        medicationSideEffects: yup.string(),
        workAboveShoulder: yup.string(),

        limitedPushingPulling: yup.object({
          leftArm: yup.boolean(),
          rightArm: yup.boolean(),
          other: yup.boolean(),
        }),

        exposureToVibration: yup.object({
          wholeBody: yup.boolean(),
          handArm: yup.boolean(),
        }),

        limitedUseOfHands: yup.object({
          left: yup.object({
            gripping: yup.boolean(),
            pinching: yup.boolean(),
            other: yup.boolean(),
          }),
          right: yup.object({
            gripping: yup.boolean(),
            pinching: yup.boolean(),
            other: yup.boolean(),
          }),
        }),
      }),

    otherwise: (schema) => schema.strip(),
  }),

  commentsOnAbilities: yup.string().when("returnToWorkStatus", {
    is: "withRestrictions",
    then: (s) => s.required("Comments required"),
    otherwise: (s) => s.strip(),
  }),

  assessmentDuration: yup
    .string()
    .oneOf(["1-2 days", "3-7 days", "8-14 days", "14+ days"])
    .when("returnToWorkStatus", {
      is: "withRestrictions",
      then: (s) => s.required("Assessment duration is required"),
      otherwise: (s) => s.strip(),
    }),

  isDiscussRTWtoPatient: yup.boolean().when("returnToWorkStatus", {
    is: "withRestrictions",
    then: (s) => s.required(),
    otherwise: (s) => s.strip(),
  }),

  nextAppointmentDate: yup.date().when("returnToWorkStatus", {
    is: "noRestrictions",
    then: (s) => s.notRequired(),
    otherwise: (s) => s.required("please fill next Appointment date"),
  }),
});

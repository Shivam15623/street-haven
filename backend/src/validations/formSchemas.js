import * as yup from "yup";

export const functionalAbiltiesData = yup.object({
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
  discussedRTW: yup.boolean(),
  nodateOfDiscusswill: yup.date(),
  employerContactName: yup.string(),
  position: yup.string(),
  designationOfHealthPro: yup.string(),
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
  returnToWorkStatus: yup.string().oneOf([
    "noRestrictions",
    "withRestrictions",
    "unable",
    "",
  ]),
  abilities: yup.object({
    walking: yup.object({
      option: yup.string().oneOf([
        "fullAbilities",
        "upto100",
        "100to200",
        "other",
        "",
      ]),
      otherText: yup.string(),
    }),
    standing: yup.object({
      option: yup.string().oneOf([
        "fullAbilities",
        "upto15",
        "15to30",
        "other",
        "",
      ]),
      otherText: yup.string(),
    }),
    sitting: yup.object({
      option: yup.string().oneOf([
        "fullAbilities",
        "upto30",
        "30to60",
        "other",
        "",
      ]),
      otherText: yup.string(),
    }),
    liftingFloorToWaist: yup.object({
      option: yup.string().oneOf([
        "fullAbilities",
        "upto5kg",
        "5to10kg",
        "other",
        "",
      ]),
      otherText: yup.string(),
    }),
    liftingWaistToShoulder: yup.object({
      option: yup.string().oneOf([
        "fullAbilities",
        "upto5kg",
        "5to10kg",
        "other",
        "",
      ]),
      otherText: yup.string(),
    }),
    stairClimbing: yup.object({
      option: yup.string().oneOf([
        "fullAbilities",
        "upto5steps",
        "5to10steps",
        "other",
        "",
      ]),
      otherText: yup.string(),
    }),
    ladderClimbing: yup.object({
      option: yup.string().oneOf([
        "fullAbilities",
        "1to3steps",
        "4to6steps",
        "other",
        "",
      ]),
      otherText: yup.string(),
    }),
    travelToWork: yup.object({
      publicTransit: yup.string().oneOf(["yes", "no", ""]),
      car: yup.string().oneOf(["yes", "no", ""]),
    }),
  }),
  restrictions: yup.object({
    bendingTwisting: yup.object({
      checked: yup.boolean(),
      details: yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Please specify details"),
      }),
    }),

    chemicalExposure: yup.object({
      checked: yup.boolean(),
      details: yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Please specify chemical"),
      }),
    }),

    environmentalExposure: yup.object({
      checked: yup.boolean(),
      details: yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Please specify environment type"),
      }),
    }),

    operatingMotorizedEquipment: yup.object({
      checked: yup.boolean(),
      details: yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Specify equipment"),
      }),
    }),

    medicationSideEffects: yup.object({
      checked: yup.boolean(),
      details: yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Specify side effects"),
      }),
    }),

    workAboveShoulder: yup.object({
      checked: yup.boolean(),
      details: yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Specify side or activity"),
      }),
    }),
    limitedPushingPulling: yup.object({
      checked: yup.boolean(),
      leftArm: yup.boolean(),
      rightArm: yup.boolean(),
      other: yup.boolean(),
      otherText: yup.string(),
    }),

    exposureToVibration: yup.object({
      checked: yup.boolean(),
      wholeBody: yup.boolean(),
      handArm: yup.boolean(),
    }),
    limitedUseOfHands: yup.object({
      checked: yup.boolean(),
      left: yup.object({
        gripping: yup.boolean(),
        pinching: yup.boolean(),
        other: yup.boolean(),
        otherText: yup.string(),
      }),
      right: yup.object({
        gripping: yup.boolean(),
        pinching: yup.boolean(),
        other: yup.boolean(),
        otherText: yup.string(),
      }),
    }),
  }),
  commentsOnAbilities: yup.string(),
  assessmentDuration: yup.string().oneOf([
    "1-2 days",
    "3-7 days",
    "8-14 days",
    "14+ days",
    "",
  ]),
  isDiscussRTWtoPatient: yup.boolean(),
  nextAppointmentDate: yup.date(),
});

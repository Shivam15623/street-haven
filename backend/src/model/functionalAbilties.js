import mongoose from "mongoose";

// ------------------------------
// Reusable Sub-schemas
// ------------------------------
const AddressSchema = {
  address: String,
  cityTown: String,
  province: String,
  postalCode: String,
};

const AbilityOptionSchema = {
  option: String, // selected option
  otherText: String, // when "other" is selected
};

const HandSideSchema = {
  gripping: Boolean,
  pinching: Boolean,
  other: Boolean,
  otherText: String,
};

const RestrictionWithDetailsSchema = {
  checked: Boolean,
  details: String, // required if checked
};

// ------------------------------
// Main Schema
// ------------------------------
const FunctionalAbilitySchema = new mongoose.Schema(
  {
    // ------------------------------
    // SECTION A – Worker
    // ------------------------------
    worker: {
      firstName: String,
      lastName: String,
      telephone: String,
      ...AddressSchema,
      dateOfBirth: Date,
    },

    dateOfAccident: Date,
    employerFaxNo: String,

    // ------------------------------
    // Employer Details
    // ------------------------------
    employer: {
      fullName: String,
      telephone: String,
      ...AddressSchema,
    },

    typeOfJobAtAccident: String,
    areasOfInjury: String,

    discussedRTW: Boolean,
    nodateOfDiscusswill: Date,
    employerContactName: String,
    position: String,

    // ------------------------------
    // SECTION C — Health Professional
    // ------------------------------
    designationOfHealthPro: String,
    otherDesignation: String,

    iswsibRegistered: Boolean,
    wsibId: String,
    invoiceNo: String,
    srvCode: String,

    // HST
    hstRegNo: String,
    hstSrvcCode: String,
    hstAmount: Number,

    healthProfessionalName: String,
    hproAddress: String,
    hprocityTown: String,
    hproProvince: String,
    hproPostalCode: String,
    hproFax: String,

    // ------------------------------
    // SECTION D — Assessment
    // ------------------------------
    assesmentDate: Date,
    returnToWorkStatus: {
      type: String,
      enum: ["noRestrictions", "withRestrictions", "unable"],
      required:true
    },

    // ------------------------------
    // SECTION E — Abilities
    // ------------------------------
    abilities: {
      walking: AbilityOptionSchema,
      standing: AbilityOptionSchema,
      sitting: AbilityOptionSchema,
      liftingFloorToWaist: AbilityOptionSchema,
      liftingWaistToShoulder: AbilityOptionSchema,
      stairClimbing: AbilityOptionSchema,
      ladderClimbing: AbilityOptionSchema,

      travelToWork: {
        publicTransit: { type: String, enum: ["yes", "no"] },
        car: { type: String, enum: ["yes", "no"] },
      },
    },

    // ------------------------------
    // SECTION E — Restrictions
    // ------------------------------
    restrictions: {
      bendingTwisting: RestrictionWithDetailsSchema,
      chemicalExposure: RestrictionWithDetailsSchema,
      environmentalExposure: RestrictionWithDetailsSchema,
      operatingMotorizedEquipment: RestrictionWithDetailsSchema,
      medicationSideEffects: RestrictionWithDetailsSchema,
      workAboveShoulder: RestrictionWithDetailsSchema,

      limitedPushingPulling: {
        checked: Boolean,
        leftArm: Boolean,
        rightArm: Boolean,
        other: Boolean,
        otherText: String,
      },

      exposureToVibration: {
        checked: Boolean,
        wholeBody: Boolean,
        handArm: Boolean,
      },

      limitedUseOfHands: {
        checked: Boolean,
        left: HandSideSchema,
        right: HandSideSchema,
      },
    },

    commentsOnAbilties: String,

    assessmentDuration: {
      type: String,
      enum: ["1-2 days", "3-7 days", "8-14 days", "14+ days"],
    },

    isDiscussRTWtoPatient: Boolean,
    nextAppointmentDate: Date,
  },
  { timestamps: true }
);

const FunctionalAbility= mongoose.model("FunctionalAbility", FunctionalAbilitySchema);
export default FunctionalAbility;
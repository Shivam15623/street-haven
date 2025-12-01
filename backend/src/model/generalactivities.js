import mongoose from "mongoose";

const FunctionalAbilitiesSchema = new mongoose.Schema(
  {
    sectionA: {
      worker: {
        firstName: String,
        lastName: String,
        telephone: String,
        dateOfBirth: String, // dd/mm/yyyy
        ...AddressSchema.obj,
      },

      employer: {
        name: String,
        telephone: String,
        fax: String,
        ...AddressSchema.obj,
      },
      dateofAccidentorawarenessOfillness: String,

      areaOfInjury: String,
      jobType: String,
      returnToWorkDiscussed: Boolean,
      returnToWorkDiscussionDate: String, // optional
      employerContactName: String,
      employerPosition: String,
    },

    sectionC: {
      healthProfessionalDesignation: String,
      wsibProviderId: String,
      invoiceNumber: String,

      name: String,
      hstNumber: String,
      hstAmount: Number,
      addressInfo: AddressSchema,
      telephone: String,
      date: String,
   
    },

    sectionD: {
      assessmentDate: String,
      status: {
        type: String,
        enum: ["noRestrictions", "withRestrictions", "unableToReturn"],
      },
    },
    sectionE: {
      abilities: {
        walking: String,
        standing: String,
        sitting: String,
        liftFloorToWaist: String,
        liftWaistToShoulder: String,
        ladderClimbing: String,
        stairClimbing: String,
        travelToWork: String,
      },

      restrictions: {
        limitedUseHands: {
          left: Boolean,
          right: Boolean,
          gripping: Boolean,
          pinching: Boolean,
        },
        environmentalExposure: String,
        workAboveShoulder: Boolean,
        chemicalExposure: String,
        bendingTwisting: String,
        pushingPulling: {
          left: Boolean,
          right: Boolean,
        },
        motorizedEquipment: Boolean,
        medicationSideEffects: String,
        vibrationExposure: {
          wholeBody: Boolean,
          handArm: Boolean,
        },
      },

      additionalComments: String,
      duration: String, // "1-2 days", "3-7 days", etc.
      discussedRTW: Boolean, // return to work
      startDate: String,
      workHours: String, // regular / modified / graduated
    },

    // -------------------
    // SECTION F (Next appointment)
    // -------------------
    sectionF: {
      nextAppointmentDate: String,
    },
  },
  { timestamps: true }
);

const FunctionalAbilities = mongoose.model(
  "FunctionalAbilities",
  FunctionalAbilitiesSchema
);
export default FunctionalAbilities;

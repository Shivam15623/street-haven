import type { FunctionalAbilityFormValues } from "../pages/Common/FormsNreports/components/forms/FunctionalAbiltiesForm";
import type { FunctionalAbility } from "../services/FormApi";

export const extractAbilities = (
  abilities: FunctionalAbilityFormValues["abilities"]
) =>
  Object.fromEntries(
    Object.entries(abilities).map(([key, value]) => {
      if (key === "travelToWork") return [key, value]; // keep as is
      // Narrow the type
      if ("option" in value) {
        return [key, value.option === "other" ? value.otherText : value.option];
      }
      return [key, value]; // fallback
    })
  );

export const extractRestrictions = (
  restrictions: FunctionalAbilityFormValues["restrictions"]
) => {
  const result: Record<string, any> = {};

  Object.entries(restrictions).forEach(([key, value]) => {
    if (value.checked) {
      if (
        key === "limitedUseOfHands" ||
        key === "limitedPushingPulling" ||
        key === "exposureToVibration"
      ) {
        result[key] = { ...value };
        delete result[key].checked;
      } else if ("details" in value) {
        result[key] = value.details;
      }
    }
  });

  return result;
};

export const ABILITY_OPTIONS_MAP = {
  walking: ["fullAbilities", "upto100", "100to200", "other"],
  standing: ["fullAbilities", "upto15", "15to30", "other"],
  sitting: ["fullAbilities", "upto30", "30to60", "other"],
  liftingFloorToWaist: ["fullAbilities", "upto5kg", "5to10kg", "other"],
  liftingWaistToShoulder: ["fullAbilities", "upto5kg", "5to10kg", "other"],
  stairClimbing: ["fullAbilities", "upto5steps", "5to10steps", "other"],
  ladderClimbing: ["fullAbilities", "1to3steps", "4to6steps", "other"],
} as const;

const normalizeAbility = (
  field: keyof typeof ABILITY_OPTIONS_MAP,
  value?: string
) => {
  const allowedOptions = ABILITY_OPTIONS_MAP[field];
  if (!value) {
    return {
      option: "",
      otherText: "",
    };
  }

  // ✅ If option is valid → keep it
  if (allowedOptions.includes(value as any)) {
    return {
      option: value,
      otherText: "",
    };
  }

  // ❌ If invalid → force "other"
  return {
    option: "other",
    otherText: value, // move invalid value here
  };
};
const normalizeRestriction = (value?: string) => {
  if (!value) {
    return {
      checked: false,
      details: "",
    };
  }
  return {
    checked: true,
    details: value,
  };
};
const buildAbilities = (data?: FunctionalAbility["abilities"]) => ({
  walking: normalizeAbility("walking", data?.walking),
  standing: normalizeAbility("standing", data?.standing),
  sitting: normalizeAbility("sitting", data?.sitting),
  liftingFloorToWaist: normalizeAbility(
    "liftingFloorToWaist",
    data?.liftingFloorToWaist
  ),
  liftingWaistToShoulder: normalizeAbility(
    "liftingWaistToShoulder",
    data?.liftingWaistToShoulder
  ),
  stairClimbing: normalizeAbility("stairClimbing", data?.stairClimbing),
  ladderClimbing: normalizeAbility("ladderClimbing", data?.ladderClimbing),

  travelToWork: {
    publicTransit: data?.travelToWork?.publicTransit ?? "",
    car: data?.travelToWork?.car ?? "",
  },
});

export const buildInitialValues = (
  data: FunctionalAbility
): FunctionalAbilityFormValues => {
  return {
    claimNo: data.claimNo,

    worker: data.worker,
    employer: data.employer,

    employerFaxNo: data.employerFaxNo,
    typeOfJobAtAccident: data.typeOfJobAtAccident,
    areasOfInjury: data.areasOfInjury,

    discussedRTW: data.discussedRTW,
    nodateOfDiscusswill: data.nodateOfDiscusswill ?? null,

    employerContactName: data.employerContactName,
    position: data.position,
    dateOfAccident: data.dateOfAccident,

    designationOfHealthPro: data.designationOfHealthPro,
    otherDesignation:
      data.designationOfHealthPro === "Other"
        ? data.designationOfHealthPro ?? ""
        : "",

    iswsibRegistered: data.iswsibRegistered,
    wsibId: data.wsibId ?? "",

    invoiceNo: data.invoiceNo,
    srvCode: data.srvCode,
    hstRegNo: data.hstRegNo ?? "",
    hstSrvcCode: data.hstSrvcCode ?? "",
    hstAmount: data.hstAmount ?? "",

    healthProfessionalName: data.healthProfessionalName,
    hproAddress: data.hproAddress,
    hprocityTown: data.hprocityTown,
    hproProvince: data.hproProvince,
    hproPostalCode: data.hproPostalCode,
    hproFax: data.hproFax,

    assesmentDate: data.assesmentDate,
    assessmentDuration: data.assessmentDuration ?? "1-2 days",

    commentsOnAbilties: data.commentsOnAbilties ?? "",
    isDiscussRTWtoPatient: data.isDiscussRTWtoPatient ?? false,
    nextAppointmentDate: data.nextAppointmentDate ?? new Date(),
    recomendedHours: data.recomendedHours ?? "",
    startDate: data.startDate ?? new Date(),
    returnToWorkStatus: data.returnToWorkStatus,

    providedTo: {
      worker: data.providedTo?.worker ?? false,
      employer: data.providedTo?.employer ?? false,
    },

    // ✅ MERGE DEFAULTS + DATA
    abilities: buildAbilities(data.abilities),

    restrictions: {
      bendingTwisting: normalizeRestriction(data.restrictions?.bendingTwisting),
      chemicalExposure: normalizeRestriction(
        data.restrictions?.chemicalExposure
      ),
      environmentalExposure: normalizeRestriction(
        data.restrictions?.environmentalExposure
      ),
      operatingMotorizedEquipment: normalizeRestriction(
        data.restrictions?.operatingMotorizedEquipment
      ),
      medicationSideEffects: normalizeRestriction(
        data.restrictions?.medicationSideEffects
      ),
      workAboveShoulder: normalizeRestriction(
        data.restrictions?.workAboveShoulder
      ),
      limitedPushingPulling: {
        checked: data.restrictions?.limitedPushingPulling ? true : false,
        leftArm: data.restrictions?.limitedPushingPulling?.leftArm
          ? true
          : false,
        rightArm: data.restrictions?.limitedPushingPulling?.rightArm
          ? true
          : false,
        other: data.restrictions?.limitedPushingPulling?.other ? true : false,
      },

      exposureToVibration: {
        checked: data.restrictions?.exposureToVibration ? true : false,
        wholeBody: data.restrictions?.exposureToVibration?.wholeBody
          ? true
          : false,
        handArm: data.restrictions?.exposureToVibration?.handArm ? true : false,
      },

      limitedUseOfHands: {
        checked: data.restrictions?.limitedUseOfHands ? true : false,
        left: {
          gripping: data.restrictions?.limitedUseOfHands?.left?.gripping
            ? true
            : false,
          pinching: data.restrictions?.limitedUseOfHands?.left?.pinching
            ? true
            : false,
          other: data.restrictions?.limitedUseOfHands?.left?.other
            ? true
            : false,
        },
        right: {
          gripping: data.restrictions?.limitedUseOfHands?.right?.gripping
            ? true
            : false,
          pinching: data.restrictions?.limitedUseOfHands?.right?.pinching
            ? true
            : false,
          other: data.restrictions?.limitedUseOfHands?.right?.other
            ? true
            : false,
        },
      },
    },
  };
};
type ReturnToWorkStatus = "withRestrictions" | "noRestrictions" | "unable";
export const SECTION_VISIBILITY: Record<
  "abilities" | "restrictions",
  ReturnToWorkStatus[]
> = {
  abilities: ["withRestrictions"],
  restrictions: ["withRestrictions"],
};
export const SECTION_FIELD_MAP: Record<string, string[]> = {
  "claim-worker": [
    "claimNo",
    "worker.firstName",
    "worker.lastName",
    "worker.telephone",
    "worker.dateOfBirth",
    "worker.postalCode",
    "worker.address",
    "worker.province",
    "worker.cityTown",
  ],

  employer: [
    "employer.fullName",
    "employer.telephone",
    "employer.address",
    "employer.postalCode",
    "employer.cityTown",
    "employer.province",
    "employerFaxNo",
  ],

  job: ["typeOfJobAtAccident", "areasOfInjury", "dateOfAccident"],

  "healthPro&bill": [
    "healthProfessionalName",
    "invoiceNo",
    "srvCode",
    "hstSrvcCode",
    "hstAmount",
    "hproFax",
    "hproAddress",
    "hprocityTown",
    "hproProvince",
    "hproPostalCode",
    "designationOfHealthPro",
    "otherDesignation",
    "iswsibRegistered",
    "wsibId",
  ],

  assessment: [
    "commentsOnAbilties",
    "assessmentDuration",
    "returnToWorkStatus",
    "providedTo",
    "returnToWorkStatus",
    "assesmentDate",
    "nextAppointmentDate",
  ],

  abilities: ["abilities.walking"],

  restrictions: ["restrictions.limitedUseOfHands"],
};

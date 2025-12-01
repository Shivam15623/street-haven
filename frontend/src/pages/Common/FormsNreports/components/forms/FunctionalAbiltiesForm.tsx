import { Formik } from "formik";
import * as Yup from "yup";
import { Col, Form, Row } from "react-bootstrap";
import CustomDatePicker from "../../../../../components/child/DatePicker";
import { PatternFormat } from "react-number-format";
import AbilityBlock from "../AbiltyBlock";
// type AbilityOption = "fullAbilities" | "upto100" | "100to200" | "other";
// type StandingOption = "fullAbilities" | "upto15" | "15to30" | "other";
// type SittingOption = "fullAbilities" | "upto30" | "30to60" | "other";

// interface Ability {
//   option: AbilityOption | "";
//   otherText: string;
// }

// interface TravelToWork {
//   publicTransit: "yes" | "no" | "";
//   car: "yes" | "no" | "";
// }

// interface LimitedUseHand {
//   gripping: boolean;
//   pinching: boolean;
//   other: boolean;
//   otherText: string;
// }

// interface Restrictions {
//   bendingTwisting: boolean;
//   workAboveShoulder: boolean;
//   chemicalExposure: boolean;
//   environmentalExposure: boolean;
//   limitedPushingPulling: {
//     checked: boolean;
//     leftArm: boolean;
//     rightArm: boolean;
//     other: boolean;
//     otherText: string;
//   };
//   operatingMotorizedEquipment: boolean;
//   medicationSideEffects: boolean;
//   exposureToVibration: {
//     checked: boolean;
//     wholeBody: boolean;
//     handArm: boolean;
//   };
//   limitedUseOfHands: {
//     checked: boolean;
//     left: LimitedUseHand;
//     right: LimitedUseHand;
//   };
// }

const functionalAbilityFormSchema = Yup.object({
  worker: Yup.object({
    firstName: Yup.string().required(),
    lastName: Yup.string().required(),
    telephone: Yup.string().required(),
    address: Yup.string().required(),
    cityTown: Yup.string().required(),
    province: Yup.string().required(),
    postalCode: Yup.string().required(),
    dateOfBirth: Yup.date().required(),
  }),
  dateOfAccident: Yup.date().required(),
  employerFaxNo: Yup.string().required(),
  employer: Yup.object({
    fullName: Yup.string().required(),
    telephone: Yup.string().required(),
    address: Yup.string().required(),
    cityTown: Yup.string().required(),
    province: Yup.string().required(),
    postalCode: Yup.string().required(),
  }),
  typeOfJobAtAccident: Yup.string().required(),
  areasOfInjury: Yup.string().required(),
  discussedRTW: Yup.boolean(),
  nodateOfDiscusswill: Yup.date(),
  employerContactName: Yup.string(),
  position: Yup.string(),
  designationOfHealthPro: Yup.string(),
  otherDesignation: Yup.string().when("designationOfHealthPro", {
    is: "Other",
    then: (s) => s.required("Please specify"),
  }),
  iswsibRegistered: Yup.boolean(),
  wsibId: Yup.string(),
  invoiceNo: Yup.string(),
  srvCode: Yup.string(),
  hstRegNo: Yup.string(),
  hstSrvcCode: Yup.string(),
  hstAmount: Yup.number(),
  healthProfessionalName: Yup.string(),
  hproAddress: Yup.string(),
  hprocityTown: Yup.string(),
  hproProvince: Yup.string(),
  hproPostalCode: Yup.string(),
  hproFax: Yup.string(),
  assesmentDate: Yup.date().required(),
  returnToWorkStatus: Yup.string().oneOf([
    "noRestrictions",
    "withRestrictions",
    "unable",
    "",
  ]),
  abilities: Yup.object({
    walking: Yup.object({
      option: Yup.string().oneOf([
        "fullAbilities",
        "upto100",
        "100to200",
        "other",
        "",
      ]),
      otherText: Yup.string(),
    }),
    standing: Yup.object({
      option: Yup.string().oneOf([
        "fullAbilities",
        "upto15",
        "15to30",
        "other",
        "",
      ]),
      otherText: Yup.string(),
    }),
    sitting: Yup.object({
      option: Yup.string().oneOf([
        "fullAbilities",
        "upto30",
        "30to60",
        "other",
        "",
      ]),
      otherText: Yup.string(),
    }),
    liftingFloorToWaist: Yup.object({
      option: Yup.string().oneOf([
        "fullAbilities",
        "upto5kg",
        "5to10kg",
        "other",
        "",
      ]),
      otherText: Yup.string(),
    }),
    liftingWaistToShoulder: Yup.object({
      option: Yup.string().oneOf([
        "fullAbilities",
        "upto5kg",
        "5to10kg",
        "other",
        "",
      ]),
      otherText: Yup.string(),
    }),
    stairClimbing: Yup.object({
      option: Yup.string().oneOf([
        "fullAbilities",
        "upto5steps",
        "5to10steps",
        "other",
        "",
      ]),
      otherText: Yup.string(),
    }),
    ladderClimbing: Yup.object({
      option: Yup.string().oneOf([
        "fullAbilities",
        "1to3steps",
        "4to6steps",
        "other",
        "",
      ]),
      otherText: Yup.string(),
    }),
    travelToWork: Yup.object({
      publicTransit: Yup.string().oneOf(["yes", "no", ""]),
      car: Yup.string().oneOf(["yes", "no", ""]),
    }),
  }),
  restrictions: Yup.object({
    bendingTwisting: Yup.object({
      checked: Yup.boolean(),
      details: Yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Please specify details"),
      }),
    }),

    chemicalExposure: Yup.object({
      checked: Yup.boolean(),
      details: Yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Please specify chemical"),
      }),
    }),

    environmentalExposure: Yup.object({
      checked: Yup.boolean(),
      details: Yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Please specify environment type"),
      }),
    }),

    operatingMotorizedEquipment: Yup.object({
      checked: Yup.boolean(),
      details: Yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Specify equipment"),
      }),
    }),

    medicationSideEffects: Yup.object({
      checked: Yup.boolean(),
      details: Yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Specify side effects"),
      }),
    }),

    workAboveShoulder: Yup.object({
      checked: Yup.boolean(),
      details: Yup.string().when("checked", {
        is: true,
        then: (s) => s.required("Specify side or activity"),
      }),
    }),
    limitedPushingPulling: Yup.object({
      checked: Yup.boolean(),
      leftArm: Yup.boolean(),
      rightArm: Yup.boolean(),
      other: Yup.boolean(),
      otherText: Yup.string(),
    }),

    exposureToVibration: Yup.object({
      checked: Yup.boolean(),
      wholeBody: Yup.boolean(),
      handArm: Yup.boolean(),
    }),
    limitedUseOfHands: Yup.object({
      checked: Yup.boolean(),
      left: Yup.object({
        gripping: Yup.boolean(),
        pinching: Yup.boolean(),
        other: Yup.boolean(),
        otherText: Yup.string(),
      }),
      right: Yup.object({
        gripping: Yup.boolean(),
        pinching: Yup.boolean(),
        other: Yup.boolean(),
        otherText: Yup.string(),
      }),
    }),
  }),
  commentsOnAbilties: Yup.string(),
  assessmentDuration: Yup.string().oneOf([
    "1-2 days",
    "3-7 days",
    "8-14 days",
    "14+ days",
    "",
  ]),
  isDiscussRTWtoPatient: Yup.boolean(),
  nextAppointmentDate: Yup.date(),
});
const handleSubmit = () => {
  console.log("uihewfuhweuihf");
};
const HandFields: Array<{
  label: string;
  value: "gripping" | "pinching" | "other";
}> = [
  { label: "Gripping", value: "gripping" },
  { label: "Pinching", value: "pinching" },
  { label: "Other", value: "other" },
];
const travelWorkField: Array<{ label: string; key: "publicTransit" | "car" }> =
  [
    {
      key: "publicTransit",
      label: "Ability to use public transit",
    },
    { key: "car", label: "Ability to drive a car" },
  ];
const FunctionalAbiltiesForm = () => {
  const initialValues = {
    worker: {
      firstName: "",
      lastName: "",
      telephone: "",
      address: "",
      cityTown: "",
      province: "",
      postalCode: "",
      dateOfBirth: "",
    },
    dateOfAccident: "",
    employerFaxNo: "",
    employer: {
      fullName: "",
      telephone: "",
      address: "",
      cityTown: "",
      province: "",
      postalCode: "",
    },
    typeOfJobAtAccident: "",
    areasOfInjury: "",
    discussedRTW: false,
    nodateOfDiscusswill: "",
    employerContactName: "",
    position: "",
    designationOfHealthPro: "",
    otherDesignation: "",
    iswsibRegistered: false,
    wsibId: "",
    invoiceNo: "",
    srvCode: "",
    hstRegNo: "",
    hstSrvcCode: "",
    hstAmount: "",
    healthProfessionalName: "",
    hproAddress: "",
    hprocityTown: "",
    hproProvince: "",
    hproPostalCode: "",
    hproFax: "",
    assesmentDate: "",
    returnToWorkStatus: "",
    abilities: {
      walking: { option: "", otherText: "" },
      standing: { option: "", otherText: "" },
      sitting: { option: "", otherText: "" },
      liftingFloorToWaist: { option: "", otherText: "" },
      liftingWaistToShoulder: { option: "", otherText: "" },
      stairClimbing: { option: "", otherText: "" },
      ladderClimbing: { option: "", otherText: "" },
      travelToWork: { publicTransit: "", car: "" },
    },
    restrictions: {
      bendingTwisting: {
        checked: false,
        details: "",
      },
      workAboveShoulder: {
        checked: false,
        details: "",
      },
      chemicalExposure: {
        checked: false,
        details: "",
      },
      environmentalExposure: {
        checked: false,
        details: "",
      },
      limitedPushingPulling: {
        checked: false,
        leftArm: false,
        rightArm: false,
        other: false,
        otherText: "",
      },
      operatingMotorizedEquipment: {
        checked: false,
        details: "",
      },
      medicationSideEffects: {
        checked: false,
        details: "",
      },
      exposureToVibration: { checked: false, wholeBody: false, handArm: false },
      limitedUseOfHands: {
        checked: false,
        left: { gripping: false, pinching: false, other: false, otherText: "" },
        right: {
          gripping: false,
          pinching: false,
          other: false,
          otherText: "",
        },
      },
    },
    commentsOnAbilties: "",
    assessmentDuration: "",
    isDiscussRTWtoPatient: false,
    nextAppointmentDate: "",
  };

  return (
    <div className="d-flex flex-column gap-24 ">
      <Formik
        validationSchema={functionalAbilityFormSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
          handleBlur,
        }) => (
          <Form onSubmit={handleSubmit} className="d-flex flex-column gap-24 ">
            {/* Header card */}
            <div className="card">
              <div className="card-body d-flex flex-row align-items-center gap-20 px-24 py-16">
                <img src="/assets/images/wsibo.svg" width={273} height={93} />
                <div className="d-flex flex-row justify-content-between align-items-center flex-grow-1">
                  <div className="d-flex flex-column ">
                    <h3 className="text-xxl fw-semibold text-street-dark mb-0">
                      Functional Abilities Form
                    </h3>
                    <p className="text-md fw-semibold text-street-dark">
                      for Planning Early and Safe Return to Work
                    </p>
                  </div>
                  <div
                    className="d-flex flex-row align-items-center"
                    style={{ gap: 15 }}
                  >
                    <div className="d-flex flex-column" style={{ gap: 5 }}>
                      <p className="text-xs text-street-dark fw-normal">
                        Mail to:
                      </p>
                      <p className="text-xs text-street-dark fw-normal">
                        200 Front Street West
                      </p>
                      <p className="text-xs text-street-dark fw-normal">
                        Toronto ON M5V 3J1
                      </p>
                    </div>
                    <div className="d-flex flex-column" style={{ gap: 5 }}>
                      <p className="text-xs text-street-dark fw-normal">
                        Or Fax to:
                      </p>
                      <p className="text-xs text-street-dark fw-normal">
                        416-344-4684
                      </p>
                      <p className="text-xs text-street-dark fw-normal">
                        or 1-888-313-7373
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section A */}
            <div className="card">
              <div className="card-body d-flex flex-column gap-20 px-24 py-16">
                <h3 className="text-xl text-street-dark fw-semibold mb-0">
                  A. Section A to be completed by the employer and/or worker.
                </h3>

                {/* Worker basic row */}
                <Row>
                  <Col sm={12} md={4}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        style={{ height: "40px" }}
                        name="worker.firstName"
                        value={values.worker.firstName}
                        onChange={handleChange}
                      />
                      {touched.worker?.firstName &&
                        errors.worker?.firstName && (
                          <div className="text-danger text-sm">
                            {errors.worker.firstName}
                          </div>
                        )}
                    </Form.Group>
                  </Col>

                  <Col sm={12} md={4}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        style={{ height: "40px" }}
                        name="worker.lastName"
                        value={values.worker.lastName}
                        onChange={handleChange}
                      />
                      {touched.worker?.lastName && errors.worker?.lastName && (
                        <div className="text-danger text-sm">
                          {errors.worker.lastName}
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col sm={12} md={4}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>Telephone</Form.Label>
                      <PatternFormat
                        format="+1 (###) ###-####"
                        allowEmptyFormatting
                        mask="_"
                        name="worker.telephone"
                        className={`form-control ${
                          touched.worker?.telephone && errors.worker?.telephone
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="+1 (123) 456-7890"
                        value={values.worker.telephone}
                        onValueChange={(valuesObj) =>
                          setFieldValue(
                            "worker.telephone",
                            valuesObj.formattedValue
                          )
                        }
                      />
                      {touched.worker?.telephone &&
                        errors.worker?.telephone && (
                          <div className="text-danger text-sm">
                            {errors.worker.telephone}
                          </div>
                        )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Address row */}
                <Row>
                  <Col sm={12} md={4}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>Address (no., street, apt.)</Form.Label>
                      <Form.Control
                        style={{ height: "40px" }}
                        name="worker.address"
                        value={values.worker.address}
                        onChange={handleChange}
                      />
                      {touched.worker?.address && errors.worker?.address && (
                        <div className="text-danger text-sm">
                          {errors.worker.address}
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col sm={12} md={8}>
                    <Row>
                      <Col sm={12} md={4}>
                        <Form.Group className="d-flex flex-column gap-2 mb-3">
                          <Form.Label>City/Town</Form.Label>
                          <Form.Control
                            style={{ height: "40px" }}
                            name="worker.cityTown"
                            value={values.worker.cityTown}
                            onChange={handleChange}
                          />
                          {touched.worker?.cityTown &&
                            errors.worker?.cityTown && (
                              <div className="text-danger text-sm">
                                {errors.worker.cityTown}
                              </div>
                            )}
                        </Form.Group>
                      </Col>

                      <Col sm={12} md={2}>
                        <Form.Group className="d-flex flex-column gap-2 mb-3">
                          <Form.Label>Province</Form.Label>
                          <Form.Control
                            style={{ height: "40px" }}
                            name="worker.province"
                            value={values.worker.province}
                            onChange={handleChange}
                          />
                          {touched.worker?.province &&
                            errors.worker?.province && (
                              <div className="text-danger text-sm">
                                {errors.worker.province}
                              </div>
                            )}
                        </Form.Group>
                      </Col>

                      <Col sm={12} md={6}>
                        <Form.Group className="d-flex flex-column gap-2 mb-3">
                          <Form.Label>Postal Code</Form.Label>
                          <Form.Control
                            style={{ height: "40px" }}
                            name="worker.postalCode"
                            value={values.worker.postalCode}
                            onChange={handleChange}
                          />
                          {touched.worker?.postalCode &&
                            errors.worker?.postalCode && (
                              <div className="text-danger text-sm">
                                {errors.worker.postalCode}
                              </div>
                            )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* Employer block + DOB & Date of Accident */}
                <Row>
                  <Col sm={12} md={8}>
                    <div
                      className="d-flex flex-column gap-20 radius-8 p-10"
                      style={{ border: "1px solid #0000001A" }}
                    >
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>Employer's Name</Form.Label>
                        <Form.Control
                          style={{ height: "40px" }}
                          name="employer.fullName"
                          value={values.employer.fullName}
                          onChange={handleChange}
                        />
                        {touched.employer?.fullName &&
                          errors.employer?.fullName && (
                            <div className="text-danger text-sm">
                              {errors.employer.fullName}
                            </div>
                          )}
                      </Form.Group>

                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>
                          Full Address (No., Street, Apt.)
                        </Form.Label>
                        <Form.Control
                          style={{ height: "40px" }}
                          name="employer.address"
                          value={values.employer.address}
                          onChange={handleChange}
                        />
                        {touched.employer?.address &&
                          errors.employer?.address && (
                            <div className="text-danger text-sm">
                              {errors.employer.address}
                            </div>
                          )}
                      </Form.Group>

                      <Row>
                        <Col sm={12} md={4}>
                          <Form.Group className="d-flex flex-column gap-2 mb-3">
                            <Form.Label>City/Town</Form.Label>
                            <Form.Control
                              style={{ height: "40px" }}
                              name="employer.cityTown"
                              value={values.employer.cityTown}
                              onChange={handleChange}
                            />
                            {touched.employer?.cityTown &&
                              errors.employer?.cityTown && (
                                <div className="text-danger text-sm">
                                  {errors.employer.cityTown}
                                </div>
                              )}
                          </Form.Group>
                        </Col>

                        <Col sm={12} md={2}>
                          <Form.Group className="d-flex flex-column gap-2 mb-3">
                            <Form.Label>Province</Form.Label>
                            <Form.Control
                              style={{ height: "40px" }}
                              name="employer.province"
                              value={values.employer.province}
                              onChange={handleChange}
                            />
                            {touched.employer?.province &&
                              errors.employer?.province && (
                                <div className="text-danger text-sm">
                                  {errors.employer.province}
                                </div>
                              )}
                          </Form.Group>
                        </Col>

                        <Col sm={12} md={6}>
                          <Form.Group className="d-flex flex-column gap-2 mb-3">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control
                              style={{ height: "40px" }}
                              name="employer.postalCode"
                              value={values.employer.postalCode}
                              onChange={handleChange}
                            />
                            {touched.employer?.postalCode &&
                              errors.employer?.postalCode && (
                                <div className="text-danger text-sm">
                                  {errors.employer.postalCode}
                                </div>
                              )}
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </Col>

                  <Col sm={12} md={4}>
                    <div className="d-flex flex-column gap-20">
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>Date Of Birth</Form.Label>
                        <CustomDatePicker
                          className="h-40-px"
                          value={
                            values.worker.dateOfBirth
                              ? new Date(values.worker.dateOfBirth)
                              : null
                          }
                          onChange={(date) => {
                            const newDate = date
                              ? date.toISOString().split("T")[0]
                              : "";
                            setFieldValue("worker.dateOfBirth", newDate, true);
                            setFieldTouched("worker.dateOfBirth", true, false);
                          }}
                          isInvalid={Boolean(
                            touched.worker?.dateOfBirth &&
                              errors.worker?.dateOfBirth
                          )}
                        />
                        {touched.worker?.dateOfBirth &&
                          errors.worker?.dateOfBirth && (
                            <div className="text-danger text-sm">
                              {String(errors.worker.dateOfBirth)}
                            </div>
                          )}
                      </Form.Group>

                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>
                          Date of Accident / Awareness of Illness
                        </Form.Label>
                        <CustomDatePicker
                          className="h-40-px"
                          value={
                            values.dateOfAccident
                              ? new Date(values.dateOfAccident)
                              : null
                          }
                          onChange={(date) => {
                            const newDate = date
                              ? date.toISOString().split("T")[0]
                              : "";
                            setFieldValue("dateOfAccident", newDate, true);
                            setFieldTouched("dateOfAccident", true, false);
                          }}
                          isInvalid={Boolean(
                            touched.dateOfAccident && errors.dateOfAccident
                          )}
                        />
                        {touched.dateOfAccident && errors.dateOfAccident && (
                          <div className="text-danger text-sm">
                            {String(errors.dateOfAccident)}
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>Employer's Telephone</Form.Label>
                        <PatternFormat
                          format="+1 (###) ###-####"
                          allowEmptyFormatting
                          mask="_"
                          className={`form-control ${
                            touched.employer?.telephone &&
                            errors.employer?.telephone
                              ? "is-invalid"
                              : ""
                          }`}
                          placeholder="+1 (123) 456-7890"
                          value={values.employer.telephone}
                          onValueChange={(valuesObj) =>
                            setFieldValue(
                              "employer.telephone",
                              valuesObj.formattedValue
                            )
                          }
                          name="employer.telephone"
                        />
                        {touched.employer?.telephone &&
                          errors.employer?.telephone && (
                            <div className="text-danger text-sm">
                              {errors.employer.telephone}
                            </div>
                          )}
                      </Form.Group>

                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>Employer's Fax No.</Form.Label>
                        <Form.Control
                          name="employerFaxNo"
                          value={values.employerFaxNo}
                          onChange={handleChange}
                        />
                        {touched.employerFaxNo && errors.employerFaxNo && (
                          <div className="text-danger text-sm">
                            {errors.employerFaxNo}
                          </div>
                        )}
                      </Form.Group>
                    </div>
                  </Col>
                </Row>

                {/* Other fields: job, injuries, RTW, contact, position */}
                <Row>
                  <Col sm={12} md={8}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>
                        1. Type of job at time of accident (where available,
                        please attach description of job activities)
                      </Form.Label>
                      <Form.Control
                        className="h-40-px"
                        name="typeOfJobAtAccident"
                        value={values.typeOfJobAtAccident}
                        onChange={handleChange}
                      />
                      {touched.typeOfJobAtAccident &&
                        errors.typeOfJobAtAccident && (
                          <div className="text-danger text-sm">
                            {errors.typeOfJobAtAccident}
                          </div>
                        )}
                    </Form.Group>
                  </Col>

                  <Col sm={12} md={4}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>
                        Area(s) of injury(ies)/illness(es)
                      </Form.Label>
                      <Form.Control
                        className="h-40-px"
                        name="areasOfInjury"
                        value={values.areasOfInjury}
                        onChange={handleChange}
                      />
                      {touched.areasOfInjury && errors.areasOfInjury && (
                        <div className="text-danger text-sm">
                          {errors.areasOfInjury}
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col sm={12} md={8}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        2. Have the worker and the employer discussed Return To
                        Work
                      </Form.Label>

                      <div className="d-flex flex-row gap-3 p-3  rounded">
                        {[
                          { label: "Yes", value: true },
                          { label: "No", value: false },
                        ].map((opt) => (
                          <label
                            key={opt.label}
                            className="d-flex align-items-center gap-2"
                            style={{ cursor: "pointer" }}
                          >
                            <input
                              type="checkbox"
                              checked={values.discussedRTW === opt.value}
                              onChange={() =>
                                setFieldValue(
                                  "discussedRTW",
                                  values.discussedRTW === opt.value
                                    ? ""
                                    : opt.value
                                )
                              }
                              className="form-check-input"
                            />
                            <span className="text-xs xs:text-sm">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>

                      {touched.discussedRTW && errors.discussedRTW && (
                        <div className="text-danger text-xs mt-1">
                          {errors.discussedRTW}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={4}>
                    {values.discussedRTW === false && (
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>lf no, will be discussed on</Form.Label>
                        <CustomDatePicker
                          className="h-40-px"
                          value={
                            values.nodateOfDiscusswill
                              ? new Date(values.nodateOfDiscusswill)
                              : null
                          }
                          onChange={(date) => {
                            const newDate = date
                              ? date.toISOString().split("T")[0]
                              : "";
                            setFieldValue("nodateOfDiscusswill", newDate, true);
                            setFieldTouched("nodateOfDiscusswill", true, false);
                          }}
                          isInvalid={Boolean(
                            touched.nodateOfDiscusswill &&
                              errors.nodateOfDiscusswill
                          )}
                        />
                        {touched.nodateOfDiscusswill &&
                          errors.nodateOfDiscusswill && (
                            <div className="text-danger text-sm">
                              {String(errors.nodateOfDiscusswill)}
                            </div>
                          )}
                      </Form.Group>
                    )}
                  </Col>
                </Row>
                <Row>
                  {" "}
                  <Col sm={12} md={8}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>3. Employer contact name</Form.Label>
                      <Form.Control
                        className="h-40-px"
                        name="employerContactName"
                        value={values.employerContactName}
                        onChange={handleChange}
                      />
                      {touched.employerContactName &&
                        errors.employerContactName && (
                          <div className="text-danger text-sm">
                            {errors.employerContactName}
                          </div>
                        )}
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={4}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>Position</Form.Label>
                      <Form.Control
                        className="h-40-px"
                        name="position"
                        style={{ height: "40px" }}
                        value={values.position}
                        onChange={handleChange}
                      />
                      {touched.position && errors.position && (
                        <div className="text-danger text-sm">
                          {errors.position}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>

            <div className="card">
              <div className="card-body d-flex flex-row align-items-center gap-20 px-24 py-16">
                <h3 className="text-xl text-street-dark fw-semibold mb-0">
                  B. Worker's Signature
                </h3>
              </div>
            </div>

            <div className="card">
              <div className="card-body d-flex flex-column  gap-20 px-24 py-16">
                <h3 className="text-xl text-street-dark fw-semibold mb-0 ">
                  C. Health Professional's Billing Information
                </h3>
                <Form.Group className="d-flex flex-column gap-8">
                  <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                    Health Professional's Designation
                  </Form.Label>

                  <div className="d-flex flex-row gap-20 p-3 flex-wrap">
                    {[
                      "Chiropractor",
                      "Physician",
                      "Physiotherapist",
                      "Registered Nurse (Extended Class)",
                      "Other",
                    ].map((option) => (
                      <div
                        key={option}
                        className="d-flex align-items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={values.designationOfHealthPro === option}
                          onChange={() =>
                            setFieldValue(
                              "designationOfHealthPro",
                              values.designationOfHealthPro === option
                                ? ""
                                : option
                            )
                          }
                          className="form-check-input"
                        />

                        <span className="text-xs xs:text-sm">{option}</span>

                        {/* 👉 Show input field only if "Other" is selected */}
                        {option === "Other" &&
                          values.designationOfHealthPro === "Other" && (
                            <Form.Control
                              type="text"
                              name="otherDesignation"
                              placeholder="Please specify"
                              value={values.otherDesignation}
                              onChange={handleChange}
                              className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                              style={{ width: "200px", height: "auto" }}
                            />
                          )}
                      </div>
                    ))}
                  </div>

                  {touched.designationOfHealthPro &&
                    errors.designationOfHealthPro && (
                      <div className="text-danger text-xs mt-1">
                        {errors.designationOfHealthPro}
                      </div>
                    )}

                  {/* Error for Other field */}
                  {values.designationOfHealthPro === "Other" &&
                    touched.otherDesignation &&
                    errors.otherDesignation && (
                      <div className="text-danger text-xs mt-1">
                        {errors.otherDesignation}
                      </div>
                    )}
                </Form.Group>
                <div
                  className="p-12  d-flex flex-column gap-20 radius-12 "
                  style={{ border: "1px solid #0000001A" }}
                >
                  <h4 className="text-xl text-street-dark fw-semibold mb-0">
                    PROVIDER BILLING INFORMATION IN THE BOLDED AREA OF SECTION C
                    SHOULD NOT BE PROVIDED TO THE WORKER OR EMPLOYER
                  </h4>
                  <Form.Group className="d-flex flex-row align-items-center gap-20">
                    <Form.Label
                      style={{ width: "185px" }}
                      className="text-md xs:text-xl fw-medium text-street-dark"
                    >
                      Are you registered with the WSIB?
                    </Form.Label>

                    <div
                      className="d-flex flex-row  rounded"
                      style={{ gap: "57px" }}
                    >
                      <div className="d-flex flex-column gap-10">
                        {[
                          { label: "Yes", value: true },
                          { label: "No", value: false },
                        ].map((opt) => (
                          <label
                            key={opt.label}
                            className="d-flex align-items-center gap-2"
                            style={{ cursor: "pointer" }}
                          >
                            <input
                              type="checkbox"
                              checked={values.iswsibRegistered === opt.value}
                              onChange={() =>
                                setFieldValue(
                                  "iswsibRegistered",
                                  values.iswsibRegistered === opt.value
                                    ? ""
                                    : opt.value
                                )
                              }
                              className="form-check-input"
                            />
                            <span className="text-xs xs:text-sm">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div className="d-flex flex-column justify-content-evenly gap-10">
                        <p className="text-xs text-street-base">
                          {" "}
                          Please enter the{" "}
                          <span className="text-street-dark fw-semibold">
                            WSIB Provider ID.
                          </span>{" "}
                          in the box provided
                        </p>
                        <p className="text-xs text-street-base">
                          {" "}
                          Please call{" "}
                          <span className="text-street-dark fw-semibold">
                            1 - 800-569-7919
                          </span>{" "}
                          to register
                        </p>
                      </div>
                    </div>

                    {touched.iswsibRegistered && errors.iswsibRegistered && (
                      <div className="text-danger text-xs mt-1">
                        {errors.iswsibRegistered}
                      </div>
                    )}
                  </Form.Group>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>WSIB Provider ID.</Form.Label>
                        <Form.Control
                          className="h-40-px"
                          name="wsibId"
                          style={{ height: "40px" }}
                          value={values.wsibId}
                          onChange={handleChange}
                        />
                        {touched.wsibId && errors.wsibId && (
                          <div className="text-danger text-sm">
                            {errors.wsibId}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>Your Invoice Number </Form.Label>
                        <Form.Control
                          className="h-40-px"
                          name="invoiceNo"
                          style={{ height: "40px" }}
                          value={values.invoiceNo}
                          onChange={handleChange}
                        />
                        {touched.invoiceNo && errors.invoiceNo && (
                          <div className="text-danger text-sm">
                            {errors.invoiceNo}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>Service Code</Form.Label>
                        <Form.Control
                          className="h-40-px"
                          name="srvCode"
                          style={{ height: "40px" }}
                          value={values.srvCode}
                          onChange={handleChange}
                        />
                        {touched.srvCode && errors.srvCode && (
                          <div className="text-danger text-sm">
                            {errors.srvCode}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <p className="text-xs text-street-dark fw-semibold">
                    Complete these fields if HST is applicable to this form
                  </p>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>WSIB Provider ID.</Form.Label>
                        <Form.Control
                          className="h-40-px"
                          name="wsibId"
                          style={{ height: "40px" }}
                          value={values.wsibId}
                          onChange={handleChange}
                        />
                        {touched.wsibId && errors.wsibId && (
                          <div className="text-danger text-sm">
                            {errors.wsibId}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>Your Invoice Number </Form.Label>
                        <Form.Control
                          className="h-40-px"
                          name="invoiceNo"
                          style={{ height: "40px" }}
                          value={values.invoiceNo}
                          onChange={handleChange}
                        />
                        {touched.invoiceNo && errors.invoiceNo && (
                          <div className="text-danger text-sm">
                            {errors.invoiceNo}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label>Service Code</Form.Label>
                        <Form.Control
                          className="h-40-px"
                          name="srvCode"
                          style={{ height: "40px" }}
                          value={values.srvCode}
                          onChange={handleChange}
                        />
                        {touched.srvCode && errors.srvCode && (
                          <div className="text-danger text-sm">
                            {errors.srvCode}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Row>
                  <Col sm={12} md={8}>
                    <Row>
                      <Col sm={4} md={4}>
                        <Form.Group className="d-flex flex-column gap-2 mb-3">
                          <Form.Label>City/Town</Form.Label>
                          <Form.Control
                            className="h-40-px"
                            name="hprocityTown"
                            style={{ height: "40px" }}
                            value={values.hprocityTown}
                            onChange={handleChange}
                          />
                          {touched.hprocityTown && errors.hprocityTown && (
                            <div className="text-danger text-sm">
                              {errors.hprocityTown}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                      <Col sm={2} md={2}>
                        {" "}
                        <Form.Group className="d-flex flex-column gap-2 mb-3">
                          <Form.Label>Service Code</Form.Label>
                          <Form.Control
                            className="h-40-px"
                            name="hproProvince"
                            style={{ height: "40px" }}
                            value={values.hproProvince}
                            onChange={handleChange}
                          />
                          {touched.hproProvince && errors.hproProvince && (
                            <div className="text-danger text-sm">
                              {errors.hproProvince}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                      <Col sm={6} md={6}>
                        {" "}
                        <Form.Group className="d-flex flex-column gap-2 mb-3">
                          <Form.Label>Postal Code</Form.Label>
                          <Form.Control
                            className="h-40-px"
                            name="hproPostalCode"
                            style={{ height: "40px" }}
                            value={values.hproPostalCode}
                            onChange={handleChange}
                          />
                          {touched.hproPostalCode && errors.hproPostalCode && (
                            <div className="text-danger text-sm">
                              {errors.hproPostalCode}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={12} md={4}>
                    {" "}
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>Fax</Form.Label>
                      <Form.Control
                        className="h-40-px"
                        name="hproFax"
                        style={{ height: "40px" }}
                        value={values.hproFax}
                        onChange={handleChange}
                      />
                      {touched.hproFax && errors.hproFax && (
                        <div className="text-danger text-sm">
                          {errors.hproFax}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>

            {/* D, E, F placeholders */}
            <div className="card">
              <div className="card-body d-flex flex-column  gap-20 px-24 py-16">
                <h3 className="text-xl text-street-dark fw-semibold mb-0">
                  D. The following information should be completed by the
                  Health. Professional to identify the patient's overall
                  abilities and restrictions.
                </h3>
                <Row>
                  <Col sm={12} md={4}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>1. Date of Assessment</Form.Label>
                      <CustomDatePicker
                        className="h-40-px"
                        value={
                          values.assesmentDate
                            ? new Date(values.assesmentDate)
                            : null
                        }
                        onChange={(date) => {
                          const newDate = date
                            ? date.toISOString().split("T")[0]
                            : "";
                          setFieldValue("assesmentDate", newDate, true);
                          setFieldTouched("assesmentDate", true, false);
                        }}
                        isInvalid={Boolean(
                          touched.assesmentDate && errors.assesmentDate
                        )}
                      />
                      {touched.assesmentDate && errors.assesmentDate && (
                        <div className="text-danger text-sm">
                          {String(errors.assesmentDate)}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={8} className="justify-content-end">
                    <Form.Group className="d-flex flex-column gap-10">
                      <Form.Label>2</Form.Label>{" "}
                      <div className="d-flex flex-column flex-sm-row gap-20">
                        <Form.Check
                          type="radio"
                          id="noRestrictions"
                          className="d-flex flex-row gap-10"
                          label={
                            <p className="text-xs">
                              Patient is capable of returning to work with{" "}
                              <strong>no restrictions.</strong>
                            </p>
                          }
                          name="returnToWorkStatus"
                          value="noRestrictions"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={
                            values.returnToWorkStatus === "noRestrictions"
                          }
                        />

                        {/* Option 2 */}
                        <Form.Check
                          type="radio"
                          className="d-flex flex-row gap-10"
                          id="withRestrictions"
                          label={
                            <p className="text-xs">
                              Patient is capable of returning to work{" "}
                              <strong>with restrictions.</strong> Complete
                              sections <strong>E and F.</strong>
                            </p>
                          }
                          name="returnToWorkStatus"
                          value="withRestrictions"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={
                            values.returnToWorkStatus === "withRestrictions"
                          }
                        />

                        {/* Option 3 */}
                        <Form.Check
                          type="radio"
                          className="d-flex flex-row gap-10"
                          id="unable"
                          label={
                            <p className="text-xs">
                              Patient is physically unable to return to work at
                              this time. Complete section <strong>F.</strong>
                            </p>
                          }
                          name="returnToWorkStatus"
                          value="unable"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.returnToWorkStatus === "unable"}
                        />
                      </div>
                      {/* Error Message */}
                      {errors.returnToWorkStatus &&
                        touched.returnToWorkStatus && (
                          <div className="text-danger mt-2">
                            {errors.returnToWorkStatus}
                          </div>
                        )}
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>

            <div className="card">
              <div className="card-body d-flex flex-column gap-20 px-24 py-16">
                <h3 className="text-xl text-street-dark fw-semibold mb-0">
                  E. Abilities and/or Restrictions
                </h3>

                <p className="text-xs text-street-dark fw-normal">
                  1. Please indicate Abilities that apply. Include additional
                  details in section 3
                </p>
                <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-3">
                  <AbilityBlock
                    label="Walking"
                    fieldPath="walking"
                    values={values}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                    options={[
                      { label: "Full abilities", value: "fullAbilities" },
                      { label: "Up to 100 metres", value: "upto100" },
                      { label: "100 - 200 metres", value: "100to200" },
                      { label: "Other", value: "other" },
                    ]}
                  />

                  <AbilityBlock
                    label="Standing"
                    fieldPath="standing"
                    values={values}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                    options={[
                      { label: "Full abilities", value: "fullAbilities" },
                      { label: "Up to 15 minutes", value: "upto15" },
                      { label: "15 - 30 minutes", value: "15to30" },
                      { label: "Other", value: "other" },
                    ]}
                  />

                  <AbilityBlock
                    label="Sitting"
                    fieldPath="sitting"
                    values={values}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                    options={[
                      { label: "Full abilities", value: "fullAbilities" },
                      { label: "Up to 30 minutes", value: "upto30" },
                      { label: "30 - 60 minutes", value: "30to60" },
                      { label: "Other", value: "other" },
                    ]}
                  />

                  <AbilityBlock
                    label="Lifting Floor to Waist"
                    fieldPath="liftingFloorToWaist"
                    values={values}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                    options={[
                      { label: "Full abilities", value: "fullAbilities" },
                      { label: "Up to 5 kg", value: "upto5kg" },
                      { label: "5 - 10 kg", value: "5to10kg" },
                      { label: "Other", value: "other" },
                    ]}
                  />

                  <AbilityBlock
                    label="Lifting Waist to Shoulder"
                    fieldPath="liftingWaistToShoulder"
                    values={values}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                    options={[
                      { label: "Full abilities", value: "fullAbilities" },
                      { label: "Up to 5 kg", value: "upto5kg" },
                      { label: "5 - 10 kg", value: "5to10kg" },
                      { label: "Other", value: "other" },
                    ]}
                  />
                  <AbilityBlock
                    label="Stair climbing"
                    fieldPath="stairClimbing"
                    values={values}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                    options={[
                      { label: "Full abilities", value: "fullAbilities" },
                      { label: "Up to 5 steps", value: "upto5steps" },
                      { label: "5 - 10 steps", value: "5to10steps" },
                      { label: "Other", value: "other" },
                    ]}
                  />
                  <AbilityBlock
                    label="Ladder climbing"
                    fieldPath="ladderClimbing"
                    values={values}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                    options={[
                      { label: "Full abilities", value: "fullAbilities" },
                      { label: "1 to 3 steps", value: "1to3steps" },
                      { label: "4 - 6 steps", value: "4to6steps" },
                      { label: "Other", value: "other" },
                    ]}
                  />

                  <div className="col">
                    <Form.Group className="d-flex flex-column gap-10">
                      {" "}
                      <Form.Label className="fw-medium">
                        Travel to work
                      </Form.Label>
                      <div className="d-flex flex-row gap-8">
                        {" "}
                        {travelWorkField.map((item) => (
                          <div
                            key={item.key}
                            className="d-flex flex-column gap-1"
                          >
                            <span className="text-xs xs:text-sm fw-medium">
                              {item.label}
                            </span>

                            <div className="d-flex flex-column gap-3">
                              {/* YES */}
                              <label className="d-flex align-items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    values.abilities.travelToWork[item.key] ===
                                    "yes"
                                  }
                                  onChange={() =>
                                    setFieldValue(
                                      `abilities.travelToWork.${item.key}`,
                                      values.abilities.travelToWork[
                                        item.key
                                      ] === "yes"
                                        ? "" // unselect
                                        : "yes"
                                    )
                                  }
                                  className="form-check-input"
                                />
                                Yes
                              </label>

                              {/* NO */}
                              <label className="d-flex align-items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    values.abilities.travelToWork[item.key] ===
                                    "no"
                                  }
                                  onChange={() =>
                                    setFieldValue(
                                      `abilities.travelToWork.${item.key}`,
                                      values.abilities.travelToWork[
                                        item.key
                                      ] === "no"
                                        ? "" // unselect
                                        : "no"
                                    )
                                  }
                                  className="form-check-input"
                                />
                                No
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Form.Group>
                  </div>
                </div>
                <p className="text-xs text-street-dark fw-normal">
                  2. Please indicate Restrictions that apply. Include additional
                  details in section 3
                </p>
                <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-3">
                  {/* 1. BENDING / TWISTING */}
                  <div className="col">
                    <Form.Group className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={values.restrictions.bendingTwisting.checked}
                          onChange={(e) =>
                            setFieldValue(
                              "restrictions.bendingTwisting.checked",
                              e.target.checked
                            )
                          }
                        />
                        <span className="text-xs">
                          Bending/twisting repetitive movement of (please
                          specify)
                        </span>
                      </label>
                    </Form.Group>
                    {values.restrictions.bendingTwisting.checked && (
                      <Form.Control
                        type="text"
                        placeholder="Please specify"
                        name="restrictions.bendingTwisting.details"
                        value={
                          values.restrictions.bendingTwisting.details
                        }
                        onChange={handleChange}
                        className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                        style={{ height: "auto", width: "200px" }}
                      />
                    )}
                  </div>

                  {/* 2. WORK ABOVE SHOULDER */}
                  <div className="col">
                    <Form.Group className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={
                            values.restrictions.workAboveShoulder.checked
                          }
                          onChange={(e) =>
                            setFieldValue(
                              "restrictions.workAboveShoulder.checked",
                              e.target.checked
                            )
                          }
                        />
                        <span className="text-xs">
                          Work at or above shoulder activity
                        </span>
                      </label>
                    </Form.Group>
                    {values.restrictions.workAboveShoulder.checked && (
                      <Form.Control
                        type="text"
                        placeholder="Please specify"
                        name="restrictions.workAboveShoulder.details"
                        value={values.restrictions.workAboveShoulder.details}
                        onChange={handleChange}
                        className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                        style={{ height: "auto", width: "200px" }}
                      />
                    )}
                  </div>

                  {/* 3. CHEMICAL EXPOSURE */}
                  <div className="col">
                    <Form.Group className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={values.restrictions.chemicalExposure.checked}
                          onChange={(e) =>
                            setFieldValue(
                              "restrictions.chemicalExposure.checked",
                              e.target.checked
                            )
                          }
                        />
                        <span className="text-xs">Chemical exposure to</span>
                      </label>
                    </Form.Group>
                    {values.restrictions.chemicalExposure.checked && (
                      <Form.Control
                        type="text"
                        placeholder="Please specify"
                        name="restrictions.chemicalExposure.details"
                        value={values.restrictions.chemicalExposure.details}
                        onChange={handleChange}
                        className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                        style={{ height: "auto", width: "200px" }}
                      />
                    )}
                  </div>

                  {/* 4. ENVIRONMENTAL EXPOSURE */}
                  <div className="col">
                    <Form.Group className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={
                            values.restrictions.environmentalExposure.checked
                          }
                          onChange={(e) =>
                            setFieldValue(
                              "restrictions.environmentalExposure.checked",
                              e.target.checked
                            )
                          }
                        />
                        <span className="text-xs">
                          Environmental exposure to: (e.g. heat, cold, noise or
                          scents)
                        </span>
                      </label>
                    </Form.Group>
                    {values.restrictions.environmentalExposure.checked && (
                      <Form.Control
                        type="text"
                        placeholder="Please specify"
                        name="restrictions.environmentalExposure.details"
                        value={
                          values.restrictions.environmentalExposure.details
                        }
                        onChange={handleChange}
                        className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                        style={{ height: "auto", width: "200px" }}
                      />
                    )}
                  </div>

                  {/* 5. LIMITED PUSHING / PULLING */}
                  <div className="col">
                    <Form.Group className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={
                            values.restrictions.limitedPushingPulling.checked
                          }
                          onChange={(e) =>
                            setFieldValue(
                              "restrictions.limitedPushingPulling.checked",
                              e.target.checked
                            )
                          }
                        />
                        <span className="text-xs">
                          Limited Pushing / Pulling
                        </span>
                      </label>

                      {values.restrictions.limitedPushingPulling.checked && (
                        <div className="d-flex flex-column gap-1 ms-3 text-xs">
                          <label className="d-flex align-items-center gap-2">
                            <input
                              type="checkbox"
                              checked={
                                values.restrictions.limitedPushingPulling
                                  .leftArm
                              }
                              onChange={(e) =>
                                setFieldValue(
                                  "restrictions.limitedPushingPulling.leftArm",
                                  e.target.checked
                                )
                              }
                              className="form-check-input"
                            />
                            Left Arm
                          </label>

                          <label className="d-flex align-items-center gap-2">
                            <input
                              type="checkbox"
                              checked={
                                values.restrictions.limitedPushingPulling
                                  .rightArm
                              }
                              onChange={(e) =>
                                setFieldValue(
                                  "restrictions.limitedPushingPulling.rightArm",
                                  e.target.checked
                                )
                              }
                              className="form-check-input"
                            />
                            Right Arm
                          </label>
                          <label className="d-flex flex-row  gap-2">
                            <input
                              type="checkbox"
                              checked={
                                values.restrictions.limitedPushingPulling.other
                              }
                              onChange={(e) =>
                                setFieldValue(
                                  "restrictions.limitedPushingPulling.other",
                                  e.target.checked
                                )
                              }
                              className="form-check-input"
                            />
                            <span>Other</span>{" "}
                            {values.restrictions.limitedPushingPulling.other ===
                              true && (
                              <Form.Control
                                type="text"
                                placeholder="Other details"
                                name="restrictions.limitedPushingPulling.otherText"
                                value={
                                  values.restrictions.limitedPushingPulling
                                    .otherText
                                }
                                onChange={handleChange}
                                className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                                style={{ height: "auto", width: "200px" }}
                              />
                            )}
                          </label>
                        </div>
                      )}
                    </Form.Group>
                  </div>

                  {/* 6. OPERATING MOTORIZED EQUIPMENT */}
                  <div className="col">
                    <Form.Group className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={
                            values.restrictions.operatingMotorizedEquipment
                              .checked
                          }
                          onChange={(e) =>
                            setFieldValue(
                              "restrictions.operatingMotorizedEquipment.checked",
                              e.target.checked
                            )
                          }
                        />
                        <span className="text-xs">
                          Operating motorized equipment: (e.g. forklift)
                        </span>
                      </label>
                    </Form.Group>
                    {values.restrictions.operatingMotorizedEquipment
                      .checked && (
                      <Form.Control
                        type="text"
                        placeholder="Please specify"
                        name="restrictions.operatingMotorizedEquipment.details"
                        value={
                          values.restrictions.operatingMotorizedEquipment
                            .details
                        }
                        onChange={handleChange}
                        className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                        style={{ height: "auto", width: "200px" }}
                      />
                    )}
                  </div>

                  {/* 7. MEDICATION SIDE EFFECTS */}
                  <div className="col">
                    <Form.Group className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={
                            values.restrictions.medicationSideEffects.checked
                          }
                          onChange={(e) =>
                            setFieldValue(
                              "restrictions.medicationSideEffects.checked",
                              e.target.checked
                            )
                          }
                        />
                        <span className="text-xs">
                          {" "}
                          Potential side effects from medications (please
                          specify) Do not include names of medications.
                        </span>
                      </label>
                    </Form.Group>
                    {values.restrictions.medicationSideEffects.checked && (
                      <Form.Control
                        type="text"
                        placeholder="Please specify"
                        name="restrictions.medicationSideEffects.details"
                        value={
                          values.restrictions.medicationSideEffects.details
                        }
                        onChange={handleChange}
                        className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                        style={{ height: "auto", width: "200px" }}
                      />
                    )}
                  </div>

                  {/* 8. EXPOSURE TO VIBRATION */}
                  <div className="col">
                    <Form.Group className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={
                            values.restrictions.exposureToVibration.checked
                          }
                          onChange={(e) =>
                            setFieldValue(
                              "restrictions.exposureToVibration.checked",
                              e.target.checked
                            )
                          }
                        />
                        <span className="text-xs"> Exposure to Vibration</span>
                      </label>

                      {values.restrictions.exposureToVibration.checked && (
                        <div className="d-flex flex-column gap-1 ms-3">
                          <label className="d-flex align-items-center text-xs gap-2">
                            <input
                              type="checkbox"
                              checked={
                                values.restrictions.exposureToVibration
                                  .wholeBody
                              }
                              onChange={(e) =>
                                setFieldValue(
                                  "restrictions.exposureToVibration.wholeBody",
                                  e.target.checked
                                )
                              }
                              className="form-check-input"
                            />
                            Whole Body
                          </label>

                          <label className="d-flex align-items-center text-xs gap-2">
                            <input
                              type="checkbox"
                              checked={
                                values.restrictions.exposureToVibration.handArm
                              }
                              onChange={(e) =>
                                setFieldValue(
                                  "restrictions.exposureToVibration.handArm",
                                  e.target.checked
                                )
                              }
                              className="form-check-input "
                            />
                            Hand / Arm
                          </label>
                        </div>
                      )}
                    </Form.Group>
                  </div>

                  {/* 9. LIMITED USE OF HANDS */}
                  <div className="col">
                    <Form.Group className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={
                            values.restrictions.limitedUseOfHands.checked
                          }
                          onChange={(e) =>
                            setFieldValue(
                              "restrictions.limitedUseOfHands.checked",
                              e.target.checked
                            )
                          }
                        />
                        <span className="text-xs ">Limited Use Of Hands</span>
                      </label>
                      {values.restrictions.limitedUseOfHands.checked === true &&
                        HandFields.map((field) => (
                          <div
                            key={field.label}
                            className="d-flex align-items-center text-xs justify-content-between my-2"
                            style={{ width: "260px" }}
                          >
                            {/* LEFT CHECKBOX */}
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={
                                values.restrictions.limitedUseOfHands.left[
                                  field.value
                                ]
                              }
                              onChange={(e) =>
                                setFieldValue(
                                  `restrictions.limitedUseOfHands.left.${field.value}`,
                                  e.target.checked
                                )
                              }
                            />
                            {/* LABEL */}{" "}
                            <span className="text-center flex-grow-1">
                              {field.label}
                            </span>
                            {/* RIGHT CHECKBOX */}
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={
                                values.restrictions.limitedUseOfHands.right[
                                  field.value
                                ]
                              }
                              onChange={(e) =>
                                setFieldValue(
                                  `restrictions.limitedUseOfHands.right.${field.value}`,
                                  e.target.checked
                                )
                              }
                            />
                          </div>
                        ))}

                      {values.restrictions.limitedUseOfHands.left.other && (
                        <Form.Control
                          type="text"
                          placeholder="Left Hand – Please specify"
                          name="restrictions.limitedUseOfHands.left.otherText"
                          value={
                            values.restrictions.limitedUseOfHands.left.otherText
                          }
                          onChange={handleChange}
                          className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                          style={{ height: "auto", width: "200px" }}
                        />
                      )}

                      {values.restrictions.limitedUseOfHands.right.other && (
                        <Form.Control
                          type="text"
                          placeholder="Right Hand – Please specify"
                          name="restrictions.limitedUseOfHands.right.otherText"
                          value={
                            values.restrictions.limitedUseOfHands.right
                              .otherText
                          }
                          onChange={handleChange}
                          className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                          style={{ height: "auto", width: "200px" }}
                        />
                      )}
                    </Form.Group>
                  </div>
                </div>
                <Form.Group className="d-flex flex-column gap-2 mb-3">
                  <Form.Label className="text-xs text-street-dark fw-normal">
                    {" "}
                    3. Additional Comments on Abilities and/or Restrictions
                  </Form.Label>
                  <Form.Control
                    style={{ height: "40px" }}
                    name="commentsOnAbilties"
                    value={values.commentsOnAbilties}
                    onChange={handleChange}
                  />
                  {touched.commentsOnAbilties && errors.commentsOnAbilties && (
                    <div className="text-danger text-sm">
                      {errors.commentsOnAbilties}
                    </div>
                  )}
                </Form.Group>
                <Form.Group className="d-flex flex-column gap-2 mb-3">
                  <Form.Label className="text-xs text-street-dark fw-normal">
                    4. From the date of this assessment, the above will apply
                    for approximately
                  </Form.Label>
                  <div className="d-flex flex-row gap-20 align-items-center">
                    {[
                      { label: "1-2 days", value: "1-2 days" },
                      { label: "3-7 days", value: "3-7 days" },
                      { label: "8-14 days", value: "8-14 days" },
                      { label: "14+ days", value: "14+ days" },
                    ].map((opt) => (
                      <div
                        key={opt.label}
                        className="d-flex align-items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={values.assessmentDuration === opt.value}
                          onChange={() =>
                            setFieldValue(
                              "assessmentDuration",
                              values.assessmentDuration === opt.value
                                ? ""
                                : opt.value
                            )
                          }
                          className="form-check-input"
                        />

                        <span className="text-xs ">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </Form.Group>
                <Form.Group className="d-flex flex-column gap-2 mb-3">
                  <Form.Label className="text-xs text-street-dark fw-normal">
                    5. Have you discussed return to work with your patient?
                  </Form.Label>
                  <div className="d-flex flex-row gap-20 align-items-center">
                    {[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ].map((opt) => (
                      <div
                        key={opt.label}
                        className="d-flex align-items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={values.isDiscussRTWtoPatient === opt.value}
                          onChange={() =>
                            setFieldValue(
                              "assessmentDuration",
                              values.isDiscussRTWtoPatient === opt.value
                                ? ""
                                : opt.value
                            )
                          }
                          className="form-check-input"
                        />

                        <span className="text-xs ">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </div>
            </div>

            <div className="card">
              <div className="card-body d-flex flex-column  gap-20 px-24 py-16">
                <h3 className="text-xl text-street-dark fw-semibold mb-0">
                  F. Date of Next Appointment
                </h3>
                <Form.Group className="d-flex flex-column gap-2 mb-3">
                  <Form.Label className="text-xs text-street-dark fw-normal">
                    {" "}
                    Recommended date of next appointment to review Abilities
                    and/or Restrictions.
                  </Form.Label>
                  <div style={{ maxWidth: "300px" }}>
                    <CustomDatePicker
                      className="h-40-px"
                      value={
                        values.nextAppointmentDate
                          ? new Date(values.nextAppointmentDate)
                          : null
                      }
                      onChange={(date) => {
                        setFieldValue("nextAppointmentDate", date, true);
                        setFieldTouched("nextAppointmentDate", true, false);
                      }}
                      isInvalid={Boolean(
                        touched.nextAppointmentDate &&
                          errors.nextAppointmentDate
                      )}
                    />
                  </div>

                  {touched.nextAppointmentDate &&
                    errors.nextAppointmentDate && (
                      <div className="text-danger text-sm">
                        {String(errors.nextAppointmentDate)}
                      </div>
                    )}
                </Form.Group>
              </div>
            </div>
            <div className="card">
              <div className="card-body d-flex flex-column  gap-20 px-24 py-16"></div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FunctionalAbiltiesForm;

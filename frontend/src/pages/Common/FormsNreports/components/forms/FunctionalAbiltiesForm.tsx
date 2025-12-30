import { Formik } from "formik";

import { Col, Form, Row } from "react-bootstrap";
import CustomDatePicker from "../../../../../components/child/DatePicker";
import { PatternFormat } from "react-number-format";
import ReactInputMask from "react-input-mask";
import {
  CANADA_PROVINCES,
  useCreateFAfMutation,
} from "../../../../../services/FormApi";
import { showSuccess } from "../../../../../utills/toastutills";

import AbilitiesRestrictions from "../AbilitiesRestrictions";
import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";
import {
  extractAbilities,
  extractRestrictions,
} from "../../../../../utills/functionalAbiltyHelpers";
import { functionalAbilityFormSchema } from "../../validations";
export interface FunctionalAbilityFormValues {
  claimNo: string;

  worker: {
    firstName: string;
    lastName: string;
    telephone: string;
    address: string;
    cityTown: string;
    province: string;
    postalCode: string;
    dateOfBirth: Date | string;
  };

  dateOfAccident: Date | string;
  employerFaxNo: string;

  employer: {
    fullName: string;
    telephone: string;
    address: string;
    cityTown: string;
    province: string;
    postalCode: string;
  };

  typeOfJobAtAccident: string;
  areasOfInjury: string;
  discussedRTW: boolean;

  nodateOfDiscusswill: Date | string | null;

  employerContactName: string;
  position: string;

  designationOfHealthPro: string;
  otherDesignation: string;

  iswsibRegistered: boolean;
  wsibId: string;
  invoiceNo: string;
  srvCode: string;
  hstRegNo: string;
  hstSrvcCode: string;
  hstAmount: number | string;

  healthProfessionalName: string;
  hproAddress: string;
  hprocityTown: string;
  hproProvince: string;
  hproPostalCode: string;
  hproFax: string;

  assesmentDate: Date | string;

  returnToWorkStatus: "noRestrictions" | "withRestrictions" | "unable";

  abilities: {
    walking: {
      option: string;
      otherText: string;
    };
    standing: {
      option: string;
      otherText: string;
    };
    sitting: {
      option: string;
      otherText: string;
    };
    liftingFloorToWaist: {
      option: string;
      otherText: string;
    };
    liftingWaistToShoulder: {
      option: string;
      otherText: string;
    };
    stairClimbing: {
      option: string;
      otherText: string;
    };
    ladderClimbing: {
      option: string;
      otherText: string;
    };
    travelToWork: {
      publicTransit: string;
      car: string;
    };
  };

  restrictions: {
    bendingTwisting: {
      checked: boolean;
      details: string;
    };
    chemicalExposure: {
      checked: boolean;
      details: string;
    };
    environmentalExposure: {
      checked: boolean;
      details: string;
    };
    operatingMotorizedEquipment: {
      checked: boolean;
      details: string;
    };
    medicationSideEffects: {
      checked: boolean;
      details: string;
    };
    workAboveShoulder: {
      checked: boolean;
      details: string;
    };

    limitedPushingPulling: {
      checked: boolean;
      leftArm: boolean;
      rightArm: boolean;
      other: boolean;
    };

    exposureToVibration: {
      checked: boolean;
      wholeBody: boolean;
      handArm: boolean;
    };

    limitedUseOfHands: {
      checked: boolean;

      left: {
        gripping: boolean;
        pinching: boolean;
        other: boolean;
      };

      right: {
        gripping: boolean;
        pinching: boolean;
        other: boolean;
      };
    };
  };

  commentsOnAbilities: string;

  assessmentDuration: "1-2 days" | "3-7 days" | "8-14 days" | "14+ days";

  isDiscussRTWtoPatient: boolean;

  nextAppointmentDate: Date | string;
  providedTo: {
    worker: boolean;
    employer: boolean;
  };
}

const handleDownload = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl); // Free memory
  } catch (err) {
    console.error("Download failed:", err);
  }
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
  const [createFaf, { isLoading }] = useCreateFAfMutation();

  const handleSubmit = async (values: FunctionalAbilityFormValues) => {
    try {
      const payload: any = { ...values };
      if (!values.hstAmount) {
        delete payload.hstAmount;
      }
      if (!values.hstRegNo) {
        delete payload.hstRegNo;
      }
      if (!values.hstSrvcCode) {
        delete payload.hstSrvcCode;
      }
      if (values.returnToWorkStatus === "withRestrictions") {
        payload.abilities = extractAbilities(values.abilities);
        payload.restrictions = extractRestrictions(values.restrictions);
      } else if (values.returnToWorkStatus === "noRestrictions") {
        delete payload.abilities;
        delete payload.restrictions;
        delete payload.commentsOnAbilities;
        delete payload.isDiscussRTWtoPatient;
        delete payload.assessmentDuration;
      } else if (values.returnToWorkStatus === "unable") {
        delete payload.abilities;
        delete payload.restrictions;
        delete payload.commentsOnAbilities;
        delete payload.assessmentDuration;
      }

      // Conditional fields

      if (values.discussedRTW) delete payload.nodateOfDiscusswill;
      if (values.designationOfHealthPro !== "Other")
        delete payload.otherDesignation;
      if (!values.iswsibRegistered) delete payload.wsibId;

      const res = await createFaf(payload).unwrap();

      if (res.success) showSuccess(res.message);
    } catch (error) {
      console.log(error);
    }
  };

  const initialValues: FunctionalAbilityFormValues = {
    claimNo: "",
    worker: {
      firstName: "",
      lastName: "",
      telephone: "",
      address: "",
      cityTown: "",
      province: "",
      postalCode: "",
      dateOfBirth: new Date(),
    },
    dateOfAccident: new Date(),
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
    assesmentDate: new Date(),
    returnToWorkStatus: "noRestrictions", // valid default
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
      bendingTwisting: { checked: false, details: "" },
      workAboveShoulder: { checked: false, details: "" },
      chemicalExposure: { checked: false, details: "" },
      environmentalExposure: { checked: false, details: "" },
      limitedPushingPulling: {
        checked: false,
        leftArm: false,
        rightArm: false,
        other: false,
      },
      operatingMotorizedEquipment: { checked: false, details: "" },
      medicationSideEffects: { checked: false, details: "" },
      exposureToVibration: { checked: false, wholeBody: false, handArm: false },
      limitedUseOfHands: {
        checked: false,
        left: { gripping: false, pinching: false, other: false },
        right: { gripping: false, pinching: false, other: false },
      },
    },
    commentsOnAbilities: "",
    assessmentDuration: "1-2 days", // ✅ fixed
    isDiscussRTWtoPatient: false,
    nextAppointmentDate: new Date(),
    providedTo: {
      worker: false,
      employer: false,
    },
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
                    <h3 className="text-lg xl:text-xxl fw-semibold text-street-dark mb-0">
                      Functional Abilities Form
                    </h3>
                    <p className="text-sm xl:text-md fw-semibold text-street-dark">
                      for Planning Early and Safe Return to Work
                    </p>
                  </div>
                  <div
                    className="d-flex flex-row align-items-center"
                    style={{ gap: 15 }}
                  >
                    <div className="d-flex flex-row align-items-center gap-18">
                      {" "}
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
                    <Form.Group className="d-flex flex-column gap-10 ">
                      <Form.Label>claim No:</Form.Label>
                      <Form.Control
                        style={{ height: "40px" }}
                        name="claimNo"
                        value={values.claimNo}
                        onChange={handleChange}
                      />
                      {touched.claimNo && errors.claimNo && (
                        <div className="text-danger text-sm">
                          {errors.claimNo}
                        </div>
                      )}
                    </Form.Group>
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
                          <Form.Label>
                            Province <span className="text-danger">*</span>
                          </Form.Label>

                          <Form.Select
                            style={{ height: "40px" }}
                            name="worker.province"
                            value={values.worker.province}
                            onChange={handleChange}
                            isInvalid={
                              !!(
                                touched.worker?.province &&
                                errors.worker?.province
                              )
                            }
                          >
                            <option value="">Select Province</option>

                            {CANADA_PROVINCES.map((province) => (
                              <option
                                key={province.value}
                                value={province.value}
                              >
                                {province.label}
                              </option>
                            ))}
                          </Form.Select>

                          <Form.Control.Feedback type="invalid">
                            {errors.worker?.province}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col sm={12} md={6}>
                        <Form.Group className="d-flex flex-column gap-2 mb-3">
                          <Form.Label>
                            Postal Code <span className="text-danger">*</span>
                          </Form.Label>

                          <ReactInputMask
                            mask="a9a 9a9"
                            value={values.worker.postalCode}
                            onChange={(e) =>
                              setFieldValue("worker.postalCode", e.target.value)
                            }
                            className={`form-control ${
                              touched.worker?.postalCode &&
                              errors.worker?.postalCode
                                ? "is-invalid"
                                : ""
                            }`}
                            placeholder="M5V 3L9"
                            style={{
                              height: "40px",
                              textTransform: "uppercase",
                            }}
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
                            <Form.Label>
                              Province <span className="text-danger">*</span>
                            </Form.Label>

                            <Form.Select
                              style={{ height: "40px" }}
                              name="employer.province"
                              value={values.employer.province}
                              onChange={handleChange}
                              isInvalid={
                                !!(
                                  touched.employer?.province &&
                                  errors.employer?.province
                                )
                              }
                            >
                              <option value="">Select Province</option>

                              {CANADA_PROVINCES.map((province) => (
                                <option
                                  key={province.value}
                                  value={province.value}
                                >
                                  {province.label}
                                </option>
                              ))}
                            </Form.Select>

                            <Form.Control.Feedback type="invalid">
                              {errors.employer?.province}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col sm={12} md={6}>
                          <Form.Group className="d-flex flex-column gap-2 mb-3">
                            <Form.Label>
                              Postal Code <span className="text-danger">*</span>
                            </Form.Label>

                            <ReactInputMask
                              mask="a9a 9a9"
                              value={values.employer.postalCode}
                              onChange={(e) =>
                                setFieldValue(
                                  "employer.postalCode",
                                  e.target.value
                                )
                              }
                              className={`form-control ${
                                touched.employer?.postalCode &&
                                errors.employer?.postalCode
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="M5V 3L9"
                              style={{
                                height: "40px",
                                textTransform: "uppercase",
                              }}
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
                            setFieldValue("worker.dateOfBirth", date, true);
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
                            setFieldValue("dateOfAccident", date, true);
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
                            setFieldValue("nodateOfDiscusswill", date, true);
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
                        <Form.Label>HST Registration Number</Form.Label>
                        <Form.Control
                          className="h-40-px"
                          name="hstRegNo"
                          style={{ height: "40px" }}
                          value={values.hstRegNo}
                          onChange={handleChange}
                        />
                        {touched.hstRegNo && errors.hstRegNo && (
                          <div className="text-danger text-sm">
                            {errors.hstRegNo}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label> Service Code</Form.Label>
                        <Form.Control
                          className="h-40-px"
                          name="hstSrvcCode"
                          style={{ height: "40px" }}
                          value={values.hstSrvcCode}
                          onChange={handleChange}
                        />
                        {touched.hstSrvcCode && errors.hstSrvcCode && (
                          <div className="text-danger text-sm">
                            {errors.hstSrvcCode}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="d-flex flex-column gap-2 mb-3">
                        <Form.Label> HST Amount Billed</Form.Label>
                        <Form.Control
                          className="h-40-px"
                          name="hstAmount"
                          style={{ height: "40px" }}
                          type="number"
                          value={values.hstAmount}
                          onChange={handleChange}
                        />
                        {touched.hstAmount && errors.hstAmount && (
                          <div className="text-danger text-sm">
                            {errors.hstAmount}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Row>
                  <Col sm={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>Health Professional's Name</Form.Label>
                      <Form.Control
                        className="h-40-px"
                        name="healthProfessionalName"
                        style={{ height: "40px" }}
                        value={values.healthProfessionalName}
                        onChange={handleChange}
                      />
                      {touched.healthProfessionalName &&
                        errors.healthProfessionalName && (
                          <div className="text-danger text-sm">
                            {errors.healthProfessionalName}
                          </div>
                        )}
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-2 mb-3">
                      <Form.Label>Address (No. Street, Apt.)</Form.Label>
                      <Form.Control
                        className="h-40-px"
                        name="hproAddress"
                        style={{ height: "40px" }}
                        value={values.hproAddress}
                        onChange={handleChange}
                      />
                      {touched.hproAddress && errors.hproAddress && (
                        <div className="text-danger text-sm">
                          {errors.hproAddress}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
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
                          <Form.Label>Province</Form.Label>
                          <Form.Select
                            style={{ height: "40px" }}
                            name="hproProvince"
                            value={values.hproProvince}
                            onChange={handleChange}
                            isInvalid={
                              !!(touched.hproProvince && errors.hproProvince)
                            }
                          >
                            <option value="">Select Province</option>

                            {CANADA_PROVINCES.map((province) => (
                              <option
                                key={province.value}
                                value={province.value}
                              >
                                {province.label}
                              </option>
                            ))}
                          </Form.Select>
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
                          <ReactInputMask
                            mask="a9a 9a9"
                            value={values.hproPostalCode}
                            onChange={(e) =>
                              setFieldValue("hproPostalCode", e.target.value)
                            }
                            className={`form-control ${
                              touched.hproPostalCode && errors.hproPostalCode
                                ? "is-invalid"
                                : ""
                            }`}
                            placeholder="M5V 3L9"
                            style={{
                              height: "40px",
                              textTransform: "uppercase",
                            }}
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
                          setFieldValue("assesmentDate", date, true);
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
                      <Form.Label>
                        2. <span> Please check one:</span>
                      </Form.Label>{" "}
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
            <AbilitiesRestrictions
              values={values}
              setFieldValue={setFieldValue}
              handleChange={handleChange}
              touched={touched}
              errors={errors}
              HandFields={HandFields}
              travelWorkField={travelWorkField}
            />

            {(values.returnToWorkStatus === "withRestrictions" ||
              values.returnToWorkStatus === "unable") && (
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
            )}
            <div className="card shadow-sm">
              <div className="card-body p-24">
                <Form.Group className="d-flex flex-column gap-20">
                  {/* Label */}
                  <Form.Label className="fw-semibold text-xl mb-0">
                    I have provided this completed Functional Abilities Form to:
                  </Form.Label>

                  {/* Options */}
                  <div className="d-flex align-items-center gap-4">
                    <div className="form-check d-flex align-items-center flex-row gap-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="providedWorker"
                        name="providedTo.worker"
                        checked={values.providedTo.worker}
                        onChange={handleChange}
                      />
                      <label
                        className="form-check-label fw-medium"
                        htmlFor="providedWorker"
                      >
                        Worker
                      </label>
                    </div>

                    <span className="fw-semibold text-street-dark">and/or</span>

                    <div className="form-check align-items-center d-flex flex-row gap-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="providedEmployer"
                        name="providedTo.employer"
                        checked={values.providedTo.employer}
                        onChange={handleChange}
                      />
                      <label
                        className="form-check-label fw-medium"
                        htmlFor="providedEmployer"
                      >
                        Employer
                      </label>
                    </div>
                  </div>

                  {/* Error */}
                  {errors.providedTo &&
                    typeof errors.providedTo === "string" && (
                      <div className="text-danger small mt-2">
                        {errors.providedTo}
                      </div>
                    )}
                </Form.Group>
              </div>
            </div>

            <div className="card">
              <div className="card-body d-flex flex-row w-100 justify-content-end  gap-20 px-24 py-16">
                <button
                  className="btn btn-street-outline-primary btn-street-lg d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                  onClick={() =>
                    handleDownload(
                      "https://res.cloudinary.com/dskzp8jlm/image/upload/v1764752829/FAF_fab59p.pdf",
                      "functional abilties Form"
                    )
                  }
                >
                  Download Form
                </button>
                <button
                  type="submit"
                  className="btn btn-street-lg btn-street-primary d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
      <FormSubmissionLoader
        isLoading={isLoading}
        size="lg"
        variant="spinner"
        message="Please Wait"
        subMessage="Processing Your Request Please Wait"
      />
    </div>
  );
};

export default FunctionalAbiltiesForm;

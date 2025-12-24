import React, { useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { Formik } from "formik";
import { Card, Col, Form, Row, Button } from "react-bootstrap";
import CustomDatePicker from "../../../../../components/child/DatePicker";
import TimePicker from "../../../../../components/child/TimePicker";

const EditClientIncident = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        title="Employee Incident Report"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32"
        bodyClassName="p-0"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={ClientIncidentFormSchema} // Note: make sure the variable name matches
          validateOnChange
          validateOnBlur
          onSubmit={handleSubmit}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                form="edit-client-feedback-form"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update"}
              </Button>
            </>
          }
        >
          {({
            values,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            setFieldTouched,
            errors,
            touched,
          }) => (
            <Form
              noValidate
              onSubmit={handleSubmit}
              className="d-flex flex-column gap-24"
            >
              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex flex-column gap-16 p-20">
                  <div
                    className="text-md sm:text-lg text-street-dark fw-semibold"
                    style={{
                      lineHeight: "normal",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Section 1: Background
                  </div>
                  <Row className="gy-3 gx-4">
                    {/* Date */}
                    <Col xs={12} md={6}>
                      <Form.Group className="d-flex flex-column gap-8">
                        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                          Date of Incident
                        </Form.Label>

                        <CustomDatePicker
                          value={values.date ? new Date(values.date) : null}
                          onChange={(date) => {
                            const newDate = date
                              ? date.toISOString().split("T")[0]
                              : "";
                            setFieldValue("date", newDate, true);
                            setFieldTouched("date", true, false);
                          }}
                          isInvalid={Boolean(errors.date && touched.date)}
                        />

                        {errors.date && touched.date && (
                          <div className="invalid-feedback d-block">
                            {String(errors.date)}
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Location */}
                    <Col xs={12} md={6}>
                      <Form.Group
                        controlId="time"
                        className="d-flex flex-column gap-8"
                      >
                        <Form.Label className="text-xs xs:text-sm  fw-medium text-street-dark">
                          Time of Incident
                        </Form.Label>

                        <TimePicker
                          value={values.time}
                          onChange={(val) => setFieldValue("time", val)}
                          className={
                            touched.time && errors.time ? "is-invalid" : ""
                          }
                          onBlur={() => setFieldTouched("time", true)}
                        />

                        {errors.time && touched.time && (
                          <div className="invalid-feedback d-block">
                            {errors.time}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="d-flex flex-column gap-8">
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Place:
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="place"
                      value={values.place}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="text-xs xs:text-sm"
                      isInvalid={touched.place && !!errors.place}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.place}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Row className="gy-3 gx-4">
                    <Col xs={12} md={6} className="d-flex flex-column gap-24">
                      <Form.Group className="d-flex flex-column gap-8">
                        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                          Affected Client Name:
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="affectedClientname"
                          value={values.affectedClientname}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="text-xs xs:text-sm"
                          isInvalid={
                            touched.affectedClientname &&
                            !!errors.affectedClientname
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.affectedClientname}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="d-flex flex-column gap-8">
                        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                          Name of Witness (if any)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="WitnessName"
                          value={values.WitnessName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="text-xs xs:text-sm"
                          isInvalid={
                            touched.WitnessName && !!errors.WitnessName
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.WitnessName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6} className="d-flex flex-column gap-24">
                      <Form.Group className="d-flex flex-column gap-8">
                        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                          Staff Name:
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="staffName"
                          value={values.staffName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="text-xs xs:text-sm"
                          isInvalid={touched.staffName && !!errors.staffName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.staffName}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="d-flex flex-column gap-8">
                        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                          Staff Email:
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="staffEmail"
                          value={values.staffEmail}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="text-xs xs:text-sm"
                          isInvalid={touched.staffEmail && !!errors.staffEmail}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.staffEmail}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group>
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark mb-3">
                      Type of Incident:
                    </Form.Label>
                    <div className="row gy-3 gx-4 ">
                      {[
                        "Disaster",
                        "Drugs",
                        "Property Destruction",
                        "Theft",
                        "Medical / Injury / Health Emergency",
                        "Intruders",
                        "Police Action",
                        "Actual Physical / Sexual Violence",
                        "Threat of Physical / Sexual Violence",
                        "Bomb Threat",
                        "Other",
                      ].map((option) => (
                        <div className="col-12 col-xs-6 col-sm-4 " key={option}>
                          <div
                            className="p-8 border-0-5 rounded-1 border-sh-base-50"
                            style={{ backgroundColor: "var(--street-card)" }}
                          >
                            <label
                              className="d-flex align-items-center gap-2"
                              style={{ cursor: "pointer" }}
                            >
                              <input
                                type="checkbox"
                                checked={values.incidentType === option}
                                onChange={() =>
                                  setFieldValue(
                                    "incidentType",
                                    values.incidentType === option ? "" : option
                                  )
                                }
                                className="form-check-input"
                              />
                              <span className="text-xs xs:text-sm">
                                {option}
                              </span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    {touched.incidentType && errors.incidentType && (
                      <div className="text-danger text-xs mt-1">
                        {errors.incidentType}
                      </div>
                    )}
                  </Form.Group>

                  {/* Other Text Input */}
                  {values.incidentType === "Other" && (
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Please specify:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="otherIncidentDescription"
                        value={values.otherIncidentDescription}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={
                          touched.otherIncidentDescription &&
                          !!errors.otherIncidentDescription
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.otherIncidentDescription}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>
              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex flex-column gap-16 p-20">
                  <div
                    className="text-md sm:text-lg text-street-dark fw-semibold"
                    style={{
                      lineHeight: "normal",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Section 2: Incident
                  </div>
                  <Form.Group className="d-flex flex-column gap-8">
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Clear Concise Description of the Incident:
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="incidentDescription"
                      value={values.incidentDescription}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="text-xs xs:text-sm"
                      isInvalid={
                        touched.incidentDescription &&
                        !!errors.incidentDescription
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.incidentDescription}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>
              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex flex-column gap-16 p-20">
                  <div
                    className="text-md sm:text-lg text-street-dark fw-semibold"
                    style={{
                      lineHeight: "normal",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Section 3: Action Taken
                  </div>
                  <Form.Group className="d-flex flex-column gap-8">
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Action Taken:
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="ActionTaken"
                      value={values.ActionTaken}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="text-xs xs:text-sm"
                      isInvalid={touched.ActionTaken && !!errors.ActionTaken}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.ActionTaken}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>
              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex flex-column gap-16 p-20">
                  <div
                    className="text-md sm:text-lg  text-street-dark fw-semibold"
                    style={{
                      lineHeight: "normal",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Section 4: Debrief
                  </div>
                  <Form.Group className="d-flex flex-column gap-8">
                    <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                      Debrief:
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="debrief"
                      value={values.debrief}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="text-xs xs:text-sm"
                      isInvalid={touched.debrief && !!errors.debrief}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.debrief}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Row>
                    <Col sm={6}>
                      {" "}
                      <Form.Group className="d-flex flex-column gap-8">
                        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                          Reporting Staff Name:
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="reportingStaffName"
                          value={values.reportingStaffName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="text-xs xs:text-sm"
                          isInvalid={
                            touched.reportingStaffName &&
                            !!errors.reportingStaffName
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.reportingStaffName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      {" "}
                      <Form.Group className="d-flex flex-column gap-8">
                        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                          Reporting Date:
                        </Form.Label>
                        <CustomDatePicker
                          value={
                            values.repotingDate
                              ? new Date(values.repotingDate)
                              : null
                          }
                          onChange={(date) => {
                            setFieldValue("repotingDate", date, true);
                            setFieldTouched("repotingDate", true, false);
                          }}
                          isInvalid={Boolean(
                            errors.repotingDate && touched.repotingDate
                          )}
                        />

                        {errors.repotingDate && touched.repotingDate && (
                          <div className="invalid-feedback d-block">
                            {String(errors.repotingDate)}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={6}>
                      {" "}
                      <Form.Group className="d-flex flex-column gap-8">
                        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                          Reported To:
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="reportedTo"
                          value={values.reportedTo}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="text-xs xs:text-sm"
                          isInvalid={touched.reportedTo && !!errors.reportedTo}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.reportedTo}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      {" "}
                      <Form.Group className="d-flex flex-column gap-8">
                        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                          Reported Date:
                        </Form.Label>
                        <CustomDatePicker
                          value={
                            values.reportedToDate
                              ? new Date(values.reportedToDate)
                              : null
                          }
                          onChange={(date) => {
                            setFieldValue("reportedToDate", date, true);
                            setFieldTouched("reportedToDate", true, false);
                          }}
                          isInvalid={Boolean(
                            errors.reportedToDate && touched.reportedToDate
                          )}
                        />

                        {errors.reportedToDate && touched.reportedToDate && (
                          <div className="invalid-feedback d-block">
                            {String(errors.reportedToDate)}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex flex-column gap-16 p-20">
                  <div
                    className="text-md sm:text-lg  text-street-dark fw-semibold"
                    style={{
                      lineHeight: "normal",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Section 5: Follow Up (Post Incident) *To be completed by
                    management
                  </div>
                  <Form.Group className="d-flex flex-column gap-8">
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="followUp"
                      value={values.followUp}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="text-xs xs:text-sm"
                      isInvalid={touched.followUp && !!errors.followUp}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.followUp}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>
              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex flex-row justify-content-end gap-10 p-20">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-street-lg btn-street-primary d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                  >
                    {isLoading ? "Submitting..." : "Submit"}
                  </button>
                </Card.Body>
              </Card>
            </Form>
          )}
        </Formik>
      </ModalWrapper>
    </>
  );
};

export default EditClientIncident;

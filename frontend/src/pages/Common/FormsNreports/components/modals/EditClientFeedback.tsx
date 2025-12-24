import React from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { Formik } from "formik";
import { Card, Col, Form, Row, Button } from "react-bootstrap";
import CustomDatePicker from "../../../../../components/child/DatePicker";
import { PatternFormat } from "react-number-format";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";

import {
  ClientFeedBackFormSchema,
} from "../ClientFeedbackForm/schema"; // reuse schema

import {
  useUpdateClientFeedbackMutation,
} from "../../../../../services/FormApi";

interface EditClientFeedbackProps {
  show: boolean;
  onClose: () => void;
  data: any; // existing feedback record
}

const EditClientFeedback = ({ show, onClose, data }: EditClientFeedbackProps) => {
  const [updateFeedback, { isLoading }] =
    useUpdateClientFeedbackMutation();

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        id: data._id,
        date: new Date(values.date),
        location: values.location,
        type: values.natureOfComplaint,
        description: values.description,
        impact: values.impact,
        outcome: values.desiredOutcome,
        preferredContactMethod: values.preferredContactMethod,

        clientName: values.name || null,
        clientPhone: values.phone || null,
        clientEmail: values.email || null,
        clientAddress: values.address || null,

        otherComplaint:
          values.natureOfComplaint === "Other"
            ? values.otherComplaintDescription
            : undefined,
      };

      const res = await updateFeedback(payload).unwrap();
      if (res.success) {
        showSuccess("Client feedback updated successfully");
        onClose();
      }
    } catch (err: any) {
      showError(err?.message || "Update failed");
    }
  };

  if (!data) return null;

  return (
    <>
      <ModalWrapper
        show={show}
        onHide={onClose}
        size="lg"
        title="Edit Client Feedback"
        bodyClassName="p-0"
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
        <Formik
          validationSchema={ClientFeedBackFormSchema}
          validateOnChange
          validateOnBlur
          initialValues={{
            date: data.visitDate
              ? new Date(data.visitDate).toISOString().split("T")[0]
              : "",
            location: data.visitLocation || "",
            name: data.clientName || "",
            phone: data.clientPhone || "",
            email: data.clientEmail || "",
            address: data.clientAddress || "",
            natureOfComplaint: data.complaintNature || "Other",
            otherComplaintDescription: data.otherComplaintText || "",
            description: data.complaintDescription || "",
            impact: data.impact || "",
            desiredOutcome: data.desiredOutcome || "",
            preferredContactMethod:
              data.preferredContactMethod || "Either",
          }}
          onSubmit={handleSubmit}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            setFieldValue,
            setFieldTouched,
            handleBlur,
          }) => (
            <Form
              id="edit-client-feedback-form"
              onSubmit={handleSubmit}
              className="d-flex flex-column gap-24"
            >
              {/* ===== VISIT INFO ===== */}
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <CustomDatePicker
                        value={values.date ? new Date(values.date) : null}
                        onChange={(date) => {
                          const d = date
                            ? date.toISOString().split("T")[0]
                            : "";
                          setFieldValue("date", d, true);
                          setFieldTouched("date", true, false);
                        }}
                        isInvalid={!!errors.date && !!touched.date}
                      />
                    </Col>

                    <Col md={6}>
                      <Form.Control
                        name="location"
                        value={values.location}
                        onChange={handleChange}
                        isInvalid={touched.location && !!errors.location}
                        placeholder="Location"
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* ===== CLIENT INFO ===== */}
              <Card className="border-0 shadow-sm">
                <Card.Body className="d-flex flex-column gap-16">
                  <Form.Control
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Client Name"
                  />

                  <PatternFormat
                    format="+1 (###) ###-####"
                    mask="_"
                    name="phone"
                    className="form-control"
                    value={values.phone}
                    onValueChange={(val) =>
                      setFieldValue("phone", val.formattedValue)
                    }
                  />

                  <Form.Control
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="Email"
                  />
                </Card.Body>
              </Card>

              {/* ===== COMPLAINT ===== */}
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    placeholder="Complaint description"
                  />
                </Card.Body>
              </Card>
            </Form>
          )}
        </Formik>
      </ModalWrapper>

      <FormSubmissionLoader
        isLoading={isLoading}
        size="lg"
        message="Updating feedback"
      />
    </>
  );
};

export default EditClientFeedback;

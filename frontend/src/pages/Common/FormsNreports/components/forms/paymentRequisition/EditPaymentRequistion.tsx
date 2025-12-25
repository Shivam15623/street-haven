import React, { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import {
  Field,
  FieldArray,
  Formik,
  type FormikErrors,
  type FormikTouched,
} from "formik";

import { Col, Form, Row } from "react-bootstrap";
import { Card } from "react-bootstrap";
import CustomDatePicker from "../../../../../../components/child/DatePicker";
import { PaymentRequisitionFormSchema } from "../../../validations";
import type { PaymentRequisition } from "../../../../../../services/FormApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import PdfUploader from "../../../../../../components/child/PdfUploader";
interface EditPaymentRequistionProp {
  data: PaymentRequisition;
}
interface PurchaseDetail {
  date: Date | null;
  nature: string;
  program: string;
  expenseCode: string;
  netAmount: number;
  hst: number;
  totalAmount: number;
}

const EditPaymentRequistion: React.FC<EditPaymentRequistionProp> = ({
  data,
}) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      {" "}
      <button
        className="btn btn-sm btn-street-edit radius-12 d-flex align-items-center justify-content-center p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
      >
        <Icon icon="tabler:edit" className="text-xl" />
      </button>
      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        title="Employee Incident Report"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 gap-16"
        bodyClassName="p-0 d-flex flex-column gap-16"
        footerClassName="pt-16 px-0 pb-0"
      >
        <div
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
          }}
        >
          <div className="py-16">
            {" "}
            <Formik
              validationSchema={PaymentRequisitionFormSchema}
              initialValues={{
                payeeName: data.payeeName,
                totalAmount: data.totalAmount,
                requestedBy: data.requestedBy,
                requestedDate: new Date(data.requestedDate),
                approvedBy: data.approvedBy,
                approvedDate: new Date(data.approvedDate),
                invoices: null,
                purchaseDetails: data.paymentDetails.map((p) => {
                  return {
                    date: p.purchaseDate,
                    nature: p.purchaseNature,
                    program: p.program,
                    expenseCode: p.expenseCode,
                    netAmount: p.netAmount,
                    totalAmount: p.totalAmount,
                    hst: p.hst,
                  };
                }),
              }}
              onSubmit={() => {}}
            >
              {({
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
                handleChange,
                setFieldTouched,
                handleBlur,
              }) => (
                <Form
                  onSubmit={handleSubmit}
                  noValidate
                  className="d-flex flex-column gap-24"
                >
                  {/* TABLE */}
                  <Card className="shadow-sm border-0">
                    <Card.Body className="d-flex flex-column gap-16 p-20">
                      <Row className="gy-3 gx-4">
                        {/* PAYEE NAME */}
                        <Col xs={12} md={6}>
                          <Form.Group className="d-flex flex-column gap-8">
                            <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                              Payee Name:
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="payeeName"
                              value={values.payeeName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="text-xs xs:text-sm"
                              isInvalid={
                                touched.payeeName && !!errors.payeeName
                              }
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.payeeName}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* TOTAL AMOUNT */}
                        <Col xs={12} md={6}>
                          <Form.Group className="d-flex flex-column gap-8">
                            <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                              Total Amount:
                            </Form.Label>
                            <Form.Control
                              type="number"
                              name="totalAmount"
                              disabled
                              value={values.totalAmount}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="text-xs xs:text-sm"
                              isInvalid={
                                touched.totalAmount && !!errors.totalAmount
                              }
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.totalAmount}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  <Card className="shadow-sm border-0">
                    <Card.Body className="d-flex flex-column gap-16 p-20">
                      {" "}
                      <FieldArray name="purchaseDetails">
                        {({ remove, push }) => (
                          <table
                            className="table bordered-table mb-0 table-hover align-middle"
                            // className="table-form"
                            style={{ minWidth: "900px" }}
                          >
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Nature</th>
                                <th>Program</th>
                                <th>Expense Code</th>
                                <th>Net Amount</th>
                                <th>HST</th>
                                <th>Total</th>
                                <th>Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              {values.purchaseDetails.map((row, index) => {
                                const rowErrors =
                                  (
                                    errors.purchaseDetails as FormikErrors<PurchaseDetail>[]
                                  )?.[index] || {};
                                const rowTouched =
                                  (
                                    touched.purchaseDetails as FormikTouched<PurchaseDetail>[]
                                  )?.[index] || {};

                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>

                                    {/* DATE */}
                                    <td>
                                      <CustomDatePicker
                                        value={row.date}
                                        onChange={(date) => {
                                          setFieldValue(
                                            `purchaseDetails[${index}].date`,
                                            date
                                          );
                                        }}
                                        isInvalid={
                                          rowTouched.date && !!rowErrors.date
                                        }
                                      />
                                      {rowTouched.date && rowErrors.date && (
                                        <div className="text-danger small">
                                          {String(rowErrors.date)}
                                        </div>
                                      )}
                                    </td>

                                    {/* NATURE */}
                                    <td>
                                      <Field
                                        name={`purchaseDetails[${index}].nature`}
                                        className="form-control"
                                        placeholder="Nature"
                                      />
                                    </td>

                                    {/* PROGRAM */}
                                    <td>
                                      <Field
                                        name={`purchaseDetails[${index}].program`}
                                        className="form-control"
                                        placeholder="Program"
                                      />
                                    </td>

                                    {/* EXPENSE CODE */}
                                    <td>
                                      <Field
                                        name={`purchaseDetails[${index}].expenseCode`}
                                        className="form-control"
                                        placeholder="Expense Code"
                                      />
                                    </td>

                                    {/* NET AMOUNT */}
                                    <td>
                                      <Field
                                        name={`purchaseDetails[${index}].netAmount`}
                                        type="number"
                                        className="form-control"
                                        placeholder="Net Amount"
                                        onChange={(
                                          e: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                          const amount = Number(e.target.value);
                                          const hst = Number(
                                            values.purchaseDetails[index].hst
                                          );
                                          setFieldValue(
                                            `purchaseDetails[${index}].netAmount`,
                                            amount
                                          );
                                          setFieldValue(
                                            `purchaseDetails[${index}].totalAmount`,
                                            amount + hst
                                          );
                                        }}
                                      />
                                    </td>

                                    {/* HST */}
                                    <td>
                                      <Field
                                        name={`purchaseDetails[${index}].hst`}
                                        type="number"
                                        className="form-control"
                                        placeholder="HST"
                                        onChange={(
                                          e: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                          const hst = Number(e.target.value);
                                          const amount = Number(
                                            values.purchaseDetails[index]
                                              .netAmount
                                          );
                                          setFieldValue(
                                            `purchaseDetails[${index}].hst`,
                                            hst
                                          );
                                          setFieldValue(
                                            `purchaseDetails[${index}].totalAmount`,
                                            amount + hst
                                          );
                                        }}
                                      />
                                    </td>

                                    {/* TOTAL */}
                                    <td>
                                      <Form.Control
                                        disabled
                                        value={
                                          values.purchaseDetails[index]
                                            .totalAmount
                                        }
                                      />
                                    </td>

                                    {/* ACTION */}
                                    <td>
                                      <div className="d-flex flex-column gap-1 align-items-end justify-content-end">
                                        {values.purchaseDetails.length > 1 && (
                                          <button
                                            type="button"
                                            className="btn btn-street-primary p-0 d-flex align-items-center justify-content-center rounded-circle"
                                            style={{
                                              width: "22px",
                                              height: "22px",
                                            }}
                                            onClick={() => remove(index)}
                                          >
                                            <Icon
                                              icon={"mynaui:minus"}
                                              className="text-sm "
                                            />
                                          </button>
                                        )}

                                        {index ===
                                          values.purchaseDetails.length - 1 && (
                                          <button
                                            type="button"
                                            className="btn btn-street-primary p-0 d-flex align-items-center justify-content-center rounded-circle"
                                            style={{
                                              width: "22px",
                                              height: "22px",
                                            }}
                                            onClick={() =>
                                              push({
                                                date: null,
                                                nature: "",
                                                program: "",
                                                expenseCode: "",
                                                netAmount: 0,
                                                hst: 0,
                                                totalAmount: 0,
                                              })
                                            }
                                          >
                                            <Icon
                                              icon={"tabler:plus"}
                                              className="text-sm"
                                            />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </FieldArray>
                      <Row className="gy-3 gx-4">
                        {/* Date */}
                        <Col xs={12} md={6}>
                          <Form.Group className="d-flex flex-column gap-8">
                            <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                              Requested By:
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="requestedBy"
                              value={values.requestedBy}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="text-xs xs:text-sm"
                              isInvalid={
                                touched.requestedBy && !!errors.requestedBy
                              }
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.requestedBy}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group className="d-flex flex-column gap-8">
                            <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                              Date:
                            </Form.Label>

                            <CustomDatePicker
                              value={
                                values.requestedDate
                                  ? new Date(values.requestedDate)
                                  : null
                              }
                              onChange={(date) => {
                                setFieldValue("requestedDate", date, true);
                                setFieldTouched("requestedDate", true, false);
                              }}
                              isInvalid={Boolean(
                                errors.requestedDate && touched.requestedDate
                              )}
                            />

                            {errors.requestedDate && touched.requestedDate && (
                              <div className="invalid-feedback d-block">
                                {String(errors.requestedDate)}
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="gy-3 gx-4">
                        {/* Date */}
                        <Col xs={12} md={6}>
                          <Form.Group className="d-flex flex-column gap-8">
                            <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                              Approved By:
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="approvedBy"
                              value={values.approvedBy}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="text-xs xs:text-sm"
                              isInvalid={
                                touched.approvedBy && !!errors.approvedBy
                              }
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.approvedBy}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group className="d-flex flex-column gap-8">
                            <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                              Date:
                            </Form.Label>

                            <CustomDatePicker
                              value={
                                values.approvedDate
                                  ? new Date(values.approvedDate)
                                  : null
                              }
                              onChange={(date) => {
                                setFieldValue("approvedDate", date, true);
                                setFieldTouched("approvedDate", true, false);
                              }}
                              isInvalid={Boolean(
                                errors.approvedDate && touched.approvedDate
                              )}
                            />

                            {errors.approvedDate && touched.approvedDate && (
                              <div className="invalid-feedback d-block">
                                {String(errors.approvedDate)}
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  <Card className="shadow-sm border-0">
                    <Card.Body className="d-flex flex-column gap-16 p-20">
                      {" "}
                      <PdfUploader name={"invoices"} label={"Invoices:"} />
                    </Card.Body>
                  </Card>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default EditPaymentRequistion;

import { Field, FieldArray, Formik, type FormikErrors } from "formik";
import { Button, Form, Table } from "react-bootstrap";
import * as Yup from "yup";
import CustomDatePicker from "../../../../../components/child/DatePicker";

// --------------------
// TYPES
// --------------------
interface PurchaseDetail {
  date: Date | null;
  nature: string;
  department: string;
  programExpenseCode: string;
  amount: string;
}

interface FormValues {
  payeeName: string;
  totalAmount: string;
  purchaseDetails: PurchaseDetail[];
}

// --------------------
// SCHEMA
// --------------------
const FormSchema = Yup.object({
  payeeName: Yup.string().required("Payee Name is required"),
  totalAmount: Yup.number().required("Amount is required"),
  purchaseDetails: Yup.array()
    .of(
      Yup.object().shape({
        date: Yup.date().nullable().required("Date is required"),
        nature: Yup.string().required("Nature is required"),
        department: Yup.string().required("Department is required"),
        programExpenseCode: Yup.string().required("Expense Code required"),
        amount: Yup.number().required("Amount is required"),
      })
    )
    .min(1, "At least one Purchase Detail is required"),
});

const PaymentRequisitionForm = () => {
  const initialValues: FormValues = {
    payeeName: "",
    totalAmount: "",
    purchaseDetails: [
      {
        date: null,
        nature: "",
        department: "",
        programExpenseCode: "",
        amount: "",
      },
    ],
  };

  const handleSubmit = (values: FormValues) => {
    console.log("Form Submit:", values);
  };

  return (
    <div className="d-flex flex-column gap-24 ">
      <div className="card">
        <div className="card-body d-flex flex-column">
          <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-2">
            Payment Requisition Form
          </h4>
        </div>
      </div>

      {/* FORM START */}
      <Formik
        validationSchema={FormSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          setFieldTouched,
        }) => (
          <Form
            onSubmit={handleSubmit}
            noValidate
            className="d-flex flex-column gap-24"
          >
            {/* TABLE */}
            <FieldArray name="purchaseDetails">
              {({ remove, push }) => (
                <>
                  <Table bordered responsive hover>
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Nature of Purchase</th>
                        <th>Department</th>
                        <th>Program Expense Code</th>
                        <th>Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {values.purchaseDetails.map((_, index) => {
                        // SAFELY access nested errors
                        const rowErrors =
                          (
                            errors.purchaseDetails as FormikErrors<PurchaseDetail>[]
                          )?.[index] || {};

                        const rowTouched =
                          (touched.purchaseDetails as any)?.[index] || {};

                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>

                            {/* DATE */}
                            <td>
                              <CustomDatePicker
                                value={values.purchaseDetails[index].date}
                                onChange={(date: Date | null) => {
                                  setFieldValue(
                                    `purchaseDetails[${index}].date`,
                                    date
                                  );
                                  setFieldTouched(
                                    `purchaseDetails[${index}].date`,
                                    true
                                  );
                                }}
                                isInvalid={!!rowErrors.date && rowTouched.date}
                              />
                              {rowErrors.date && rowTouched.date && (
                                <div className="text-danger small">
                                  {rowErrors.date}
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
                              {rowErrors.nature && rowTouched.nature && (
                                <div className="text-danger small">
                                  {rowErrors.nature}
                                </div>
                              )}
                            </td>

                            {/* DEPT */}
                            <td>
                              <Field
                                name={`purchaseDetails[${index}].department`}
                                className="form-control"
                                placeholder="Department"
                              />
                              {rowErrors.department &&
                                rowTouched.department && (
                                  <div className="text-danger small">
                                    {rowErrors.department}
                                  </div>
                                )}
                            </td>

                            {/* EXP CODE */}
                            <td>
                              <Field
                                name={`purchaseDetails[${index}].programExpenseCode`}
                                className="form-control"
                                placeholder="Expense Code"
                              />
                              {rowErrors.programExpenseCode &&
                                rowTouched.programExpenseCode && (
                                  <div className="text-danger small">
                                    {rowErrors.programExpenseCode}
                                  </div>
                                )}
                            </td>

                            {/* AMOUNT */}
                            <td>
                              <Field
                                name={`purchaseDetails[${index}].amount`}
                                type="number"
                                className="form-control"
                                placeholder="Amount"
                              />
                              {rowErrors.amount && rowTouched.amount && (
                                <div className="text-danger small">
                                  {rowErrors.amount}
                                </div>
                              )}
                            </td>

                            <td className="text-center">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => remove(index)}
                                disabled={values.purchaseDetails.length === 1}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>

                  <Button
                    variant="primary"
                    onClick={() =>
                      push({
                        date: "",
                        nature: "",
                        department: "",
                        programExpenseCode: "",
                        amount: "",
                      })
                    }
                  >
                    + Add Purchase
                  </Button>
                </>
              )}
            </FieldArray>

            <button type="submit" className="btn btn-primary w-fit">
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PaymentRequisitionForm;

import React, { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import {
  useEditPaymentRequistionMutation,
  useGetPaymentRequisitionByIdQuery,
  type PaymentRequisition,
} from "../../../../../../services/FormApi";
import { Icon } from "@iconify/react/dist/iconify.js";

import PaymentRequisitionForm, { type FormValues } from "./form";
import { showSuccess } from "../../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
interface EditPaymentRequistionProp {
  data: PaymentRequisition;
}

const EditPaymentRequistion: React.FC<EditPaymentRequistionProp> = ({
  data,
}) => {
  const [showModal, setShowModal] = useState(false);
  const {
    data: response,
    isLoading: isfetching,
    isFetching: isReFetching,
  } = useGetPaymentRequisitionByIdQuery({ id: data._id }, { skip: !showModal });
  const loading = isfetching || isReFetching;
  const detail = response?.data;
  const [editpayrequest, { isLoading }] = useEditPaymentRequistionMutation();

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const formData = new FormData();

      // ---------- BASIC FIELDS ----------
      formData.append("payeeName", values.payeeName);
      formData.append("requestedBy", values.requestedBy);
      formData.append("approvedBy", values.approvedBy);

      formData.append(
        "requestedDate",
        values.requestedDate ? values.requestedDate.toISOString() : ""
      );

      formData.append(
        "approvedDate",
        values.approvedDate ? values.approvedDate.toISOString() : ""
      );

      // ---------- PURCHASE DETAILS ----------
      values.purchaseDetails.forEach((item, index) => {
        formData.append(
          `paymentDetails[${index}][purchaseDate]`,
          item.date ? item.date.toISOString() : ""
        );
        formData.append(
          `paymentDetails[${index}][purchaseNature]`,
          item.nature
        );
        formData.append(`paymentDetails[${index}][program]`, item.program);
        formData.append(
          `paymentDetails[${index}][expenseCode]`,
          item.expenseCode
        );
        formData.append(
          `paymentDetails[${index}][netAmount]`,
          item.netAmount.toString()
        );
        formData.append(`paymentDetails[${index}][hst]`, item.hst.toString());
        formData.append(
          `paymentDetails[${index}][totalAmount]`,
          item.totalAmount.toString()
        );
      });

      // ---------- INVOICE PDF ----------
      if (values.invoices instanceof File) {
        formData.append("invoiceAttachment", values.invoices); // must match multer field name
      }

      // ---------- API CALL ----------
      const response = await editpayrequest({
        id: data._id,
        data: formData,
      }).unwrap();

      if (response.success) {
        showSuccess(response.message);
        resetForm();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

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
        isLoading={loading || isLoading}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={loading || isLoading}
            variant="spinner"
            size="lg"
            message={
              isLoading ? "Updating Payment Requistion" : "Loading Data..."
            }
          />
        }
        footer={
          <>
            <button
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center justify-content-center"
              type="submit"
              form="edit-Payment-Requistion-form"
              disabled={isLoading || loading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </>
        }
      >
        {" "}
        {!loading && detail && (
          <PaymentRequisitionForm
            footer={false}
            id="edit-Payment-Requistion-form"
            isEdit={true}
            FileUrl={detail.invoiceAttachment}
            initialvalues={{
              payeeName: detail.payeeName,
              totalAmount: detail.totalAmount,
              requestedBy: detail.requestedBy,
              requestedDate: new Date(detail.requestedDate),
              approvedBy: detail.approvedBy,
              approvedDate: new Date(detail.approvedDate),
              invoices: null,
              purchaseDetails: detail.paymentDetails.map((p) => {
                return {
                  date: new Date(p.purchaseDate),
                  nature: p.purchaseNature,
                  program: p.program,
                  expenseCode: p.expenseCode,
                  netAmount: p.netAmount,
                  totalAmount: p.totalAmount,
                  hst: p.hst,
                };
              }),
            }}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </ModalWrapper>
    </>
  );
};

export default EditPaymentRequistion;

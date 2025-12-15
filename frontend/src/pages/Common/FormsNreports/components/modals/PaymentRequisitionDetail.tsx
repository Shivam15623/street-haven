import React, { useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import type { PaymentRequisition } from "../../../../../services/FormApi";
import FileViewer from "../../../../../components/FileViewer/FileViewer";

const LabelValue = ({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string;
  type?: "currency" | "text";
}) => {
  const classval =
    type === "currency"
      ? "text-2xl text-street-primary fw-bold"
      : "text-sm text-street-dark fw-semibold ";
  return (
    <div className="col-md-4 d-flex flex-column gap-8 ">
      <div className="text-sm text-street-base ">{label}</div>
      <div className={classval}>{value || "N/A"}</div>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="p-16">
    <div className="text-lg xl:text-xl mb-20 pb-20 border-bottom text-street-dark fw-semibold ">
      {title}
    </div>
    <div className="row g-3">{children}</div>
  </div>
);

const PaymentRequisitionDetail = ({
  detail,
}: {
  detail: PaymentRequisition;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  return (
    <>
      <button
        className="btn btn-street-primary d-flex text-sm flex-row align-items-center justify-content-center radius-12 gap-2"
        onClick={() => setShowModal(true)}
      >
        View Details
      </button>

      <ModalWrapper
        show={showModal}
        title="Payment Requisition Details"
        size="xl"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* General Info */}
          <Section title="📝 General Information">
            <LabelValue
              label="Requested Date"
              value={new Date(detail.requestedDate).toLocaleDateString("en-IN")}
            />
            <LabelValue
              label="Approved Date"
              value={new Date(detail.approvedDate).toLocaleDateString("en-IN")}
            />
            <LabelValue label="Requested By" value={detail.requestedBy} />
            <LabelValue label="Approved By" value={detail.approvedBy} />
            <LabelValue label="Payee Name" value={detail.payeeName} />
            <LabelValue
              label="Total Amount"
              type="currency"
              value={`$${detail.totalAmount}`}
            />
          </Section>

          {/* Invoice Attachment */}
          <Section title="📄 Invoice Attachment">
            <div className="col-12">
              {detail.invoiceAttachment ? (
                <button
                  onClick={() => setOpenFile(true)}
                  className="btn btn-street-outline-primary radius-12 "
                >
                  View Invoice
                </button>
              ) : (
                <div className="text-sm text-street-dark">No Attachment</div>
              )}
            </div>
          </Section>

          {/* Payment Details */}
          <Section title="💰 Payment Details">
            <div
              className="col-12 table-responsive radius-8"
              style={{ scrollbarWidth: "thin" }}
            >
              <table className="table bordered-table mb-0 table-hover align-middle">
                <thead>
                  <tr>
                    <th>Purchase Date</th>
                    <th>Nature of Purchase</th>
                    <th>Department</th>
                    <th>Expense Code</th>
                    <th>Net Amount</th>
                    <th>HST</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {detail.paymentDetails?.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {new Date(item.purchaseDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>
                      <td>{item.purchaseNature}</td>
                      <td>{item.program}</td>
                      <td>{item.expenseCode}</td>
                      <td>${item.netAmount}</td>
                      <td>${item.hst}</td>
                      <td>${item.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
        {openFile && (
          <FileViewer
            files={[
              {
                _id: "1",
                fileName: "invoice",
                fileUrl: detail.invoiceAttachment,
                fileType: "pdf",
              },
            ]}
            open={openFile}
            onOpenChange={setOpenFile}
          />
        )}
      </ModalWrapper>
    </>
  );
};

export default PaymentRequisitionDetail;

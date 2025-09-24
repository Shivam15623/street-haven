import React from "react";
// import * as yup from "yup"
// const ReimbursmentFormSchema=yup.object({
//     employeeName:yup.string().required("Employee Name is required"),
//     department:yup.string().required("Department is Required"),
//     reimbuseExpences:yup.array().of({
//         date:yup.string().required("Date is required"),
//         startLocation:yup.string().required("staring locatiopn is required"),
//         destination:yup.string().required("destination is required"),
//         description:yup.string().required("description is required"),
//         milleage:yup.number().required("milleage is required"),
//         parkingCost:yup.number().required("parking cost is required")

//     },).min(1,"at ")
// })

const ReimbursementTab = () => {
  return (
    <div className="d-flex flex-column gap-24">
      <div className="py-16 px-24 card d-flex flex-row gap-20 align-items-center ">
        <img
          src="/assets/images/StreetHavenform.png"
          style={{ borderRadius: "100%" }}
        />
        <h2 className="mb-0 text-xxl text-street-dark fw-semibold">
          Request for Milege and Parking Reimbursement Form
        </h2>
      </div>
      <div className="p-24 card d-flex flex-row gap-20 text-xs text-street-dark fw-normal">

      </div>
    </div>
  );
};

export default ReimbursementTab;

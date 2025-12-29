import React from "react";

import StaffFeedbackForm, { type FormValues } from "./form";
import { showSuccess } from "../../../../../../utills/toastutills";
import { useCreateStaffFeedbackMutation } from "../../../../../../services/StaffFeedbackApi";




const StaffFeedbackFormTab: React.FC = () => {
  const [createStaff, { isLoading }] = useCreateStaffFeedbackMutation();

  const handleSubmit = async (
    values: FormValues,
       { resetForm }: { resetForm: () => void }
  ) => {
    try {
      // combine date and time if needed

      const tempDate = new Date(values.date).toISOString().split("T")[0];
      const fullDateTime = new Date(`${tempDate}T${values.time}`);

      const payload = {
        ...values,
        date: fullDateTime, // full ISO timestamp
      };

      const res = await createStaff(payload).unwrap();
      if (res.success) {
        showSuccess(res.message);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-body d-flex flex-column gap-12 gap-sm-16 gap-md-20 rounded-3 p-16 p-sm-20 p-md-24">
        <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-0">
          Staff Feedback Form
        </h4>
        <StaffFeedbackForm 
        footer={true} 
        handleSubmit={handleSubmit} 
        isLoading={isLoading} 
        initialvalues={{
            date: new Date(),
            time: "",
            location: "",
            description: "",
            witnesses: [] as string[],
            actionsTaken: "",
            category: "Other",
            newWitness: "",
          }} />

      </div>
    </div>
  );
};

export default StaffFeedbackFormTab;

import mongoose from "mongoose";
const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  size: { type: Number, required: true }, // in KB/MB
  totalPages: { type: Number },
});

const CollectiveAgreementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    attachment: attachmentSchema,
    effectiveStartDate: {
      type: String,
      required: true,
    },
    effectiveEndDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const CollectiveAgreement = mongoose.model(
  "CollectiveAgreement",
  CollectiveAgreementSchema
);
export default CollectiveAgreement;

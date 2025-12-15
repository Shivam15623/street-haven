import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true }, // original file name
  fileUrl: { type: String, required: true }, // where the file is stored (S3, Cloudinary, local, etc.)
  size: { type: Number, required: true }, // size in KB/MB
  fileType: { type: String, required: true }, // total pages if PDF/doc
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

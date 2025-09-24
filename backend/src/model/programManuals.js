import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  size: { type: Number, required: true }, // in KB/MB
  totalPages: { type: Number },
});

const programManualSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    attachment: attachmentSchema,
    type: {
      type: String,
      trim: true,
      enum: ["HR", "Technical", "Finance", "Operations", "Other"], // customizable
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ProgramManual = mongoose.model("ProgramManual", programManualSchema);
export default ProgramManual;

import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true }, // original file name
  fileUrl: { type: String, required: true }, // where the file is stored (S3, Cloudinary, local, etc.)
  size: { type: Number, required: true }, // size in KB/MB
  totalPages: { type: Number }, // total pages if PDF/doc
});

const meetingMinutesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    meetingDate: {
      type: Date,
      required: true,
    },
    keyHighlights: [
      {
        type: String,
        trim: true,
      },
    ],
    attendees: { type: Number, required: true },
    keyTopicsDiscussed: [
      {
        type: String,
        trim: true,
      },
    ],
    attachment: attachmentSchema, // multiple files allowed
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const MeetingMinutes = mongoose.model("MeetingMinutes", meetingMinutesSchema);
export default MeetingMinutes;

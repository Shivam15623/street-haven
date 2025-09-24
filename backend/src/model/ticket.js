import mongoose from "mongoose";
const photoSchema = new mongoose.Schema({
  fileName: { type: String, required: true }, // original file name
  fileUrl: { type: String, required: true }, // where the file is stored (S3, Cloudinary, local, etc.)
});
const TicketSchema = new mongoose.Schema(
  {
    req_title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Under Review", "Completed"],
      default: "Open",
    },
    location: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["IT Help Desk", "Facilities"],
      required: true,
    },
    photo: {
      type: photoSchema,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User model
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who raised the ticket
      required: true,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);
const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;

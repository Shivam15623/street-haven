import mongoose from "mongoose";

const TicketCategoryAssignmentSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    agents: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        active: {
          type: Boolean,
          default: true,
        },

        priority: {
          type: Number,
          default: 1, // lower = higher priority
        },
      },
    ],
  },
  { timestamps: true }
);

const TicketCategoryAssignment = mongoose.model(
  "TicketCategoryAssignment",
  TicketCategoryAssignmentSchema
);
export default TicketCategoryAssignment;

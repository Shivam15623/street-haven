// models/OrgNode.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const OrgNodeSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },

    // 👇 Self-referencing parent node
    reportsTo: {
      type: Schema.Types.ObjectId,
      ref: "OrgNode",
      default: null,
      validate: {
        validator: function (parentId) {
          // Prevent a node from supervising its own parent
          return !this.supervises.includes(parentId);
        },
        message: "A node cannot report to someone it supervises.",
      },
    },

    // 👇 Self-referencing children nodes
    supervises: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrgNode",
      },
    ],
  },
  { timestamps: true }
);

// 🧠 Additional Safety Check: prevent circular hierarchy (reportsTo <-> supervises)
OrgNodeSchema.pre("save", async function (next) {
  if (this.reportsTo && this.supervises.includes(this.reportsTo)) {
    return next(new Error("reportsTo cannot also exist in supervises"));
  }
  next();
});
const OrgNode= mongoose.model("OrgNode", OrgNodeSchema);
export default OrgNode;

import mongoose from "mongoose";
import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true, // e.g. "Leads"
  },
  moduleKey: {
    type: String,
    required: true, // e.g. "leads"
  },

  // CRUD access
  create: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  update: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
});

const RoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
    },

    description: String,

    permissions: [PermissionSchema], // Array of module-level CRUD permissions
  },
  { timestamps: true }
);

export default mongoose.model("Role", RoleSchema);

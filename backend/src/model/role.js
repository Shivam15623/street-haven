import mongoose from "mongoose";

const FeatureSchema = new mongoose.Schema({
  key: { type: String, required: true }, // "export_leads"
  label: { type: String, required: true }, // "Export Leads"
  allowed: { type: Boolean, default: false }, // on/off toggle
});

const ModulePermissionSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  moduleKey: { type: String, required: true },

  // Page Access (Main toggle)
  access: { type: Boolean, default: false },

  // Core CRUD rights
  create: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  update: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },

  // Nested Features (Super scalable)
  features: [FeatureSchema],
});

const RoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
    },

    description: String,

    // All module permissions with features
    permissions: [ModulePermissionSchema],
    // reportsTo: {
    //   type: Schema.Types.ObjectId,
    //   ref: "OrgNode",
    //   default: null,
    //   validate: {
    //     validator: function (parentId) {
    //       // Prevent a node from supervising its own parent
    //       return !this.supervises.includes(parentId);
    //     },
    //     message: "A node cannot report to someone it supervises.",
    //   },
    // },
    // department:String,
    // // 👇 Self-referencing children nodes
    // supervises: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "OrgNode",
    //   },
    // ],
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", RoleSchema);
export default Role;

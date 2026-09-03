import mongoose,{Schema} from "mongoose";
const VolunteerCertificationSchema = new Schema(
{
    volunteer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    title: {
        type: String,
        required: true,
    },

    fileUrl: {
        type: String,
        required: true,
    },

    issuedBy: String,

    issueDate: Date,

    expiryDate: Date,

    status: {
        type: String,
        enum: [
            "pending",
            "approved",
            "rejected"
        ],
        default: "approved",
    },

    remarks: String,
},
{
    timestamps: true,
});
VolunteerCertificationSchema.index({ volunteer: 1, createdAt: -1 });
const VolunteerCertification = mongoose.model("VolunteerCertification", VolunteerCertificationSchema);
export default VolunteerCertification;
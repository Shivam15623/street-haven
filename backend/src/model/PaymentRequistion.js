import mongoose from "mongoose";

const PurchaseDetailSchema = new mongoose.Schema(
  {
    purchaseDate: {
      type: Date,
      required: true,
    },
    purchaseNature: {
      type: String,
      required: true,
      trim: true,
    },
    program: {
      type: String,
      required: true,
      trim: true,
    },
    expenseCode: {
      type: String,
      required: true,
      trim: true,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    hst: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);
const AttachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);
const PaymentRequisitionSchema = new mongoose.Schema(
  {
    paymentDetails: {
      type: [PurchaseDetailSchema],
      validate: [
        (arr) => arr.length > 0,
        "At least 1 purchase detail is required",
      ],
    },

    requestedBy: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    approvedBy: {
      type: String,
      required: true,
      trim: true,
    },

    requestedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    approvedDate: {
      type: Date,
      required: true,
    },

    payeeName: {
      type: String,
      required: true,
      trim: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    invoiceAttachment: {
      type: AttachmentSchema,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexing for faster search
PaymentRequisitionSchema.index({ requestedBy: 1, requestedDate: -1 });

const PaymentRequisition = mongoose.model(
  "PaymentRequisition",
  PaymentRequisitionSchema
);
export default PaymentRequisition;

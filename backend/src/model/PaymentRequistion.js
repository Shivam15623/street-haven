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
    department: {
      type: String,
      required: true,
      trim: true,
    },
    expenseCode: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
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
      type: String,
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

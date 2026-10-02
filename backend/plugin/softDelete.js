// models/plugins/softDelete.js
import { Schema } from "mongoose";

const FILTERED_OPS = ["find", "findOne", "findOneAndUpdate", "countDocuments", "updateOne", "updateMany", "distinct"];

export default function softDelete(schema, { autoFilter = true } = {}) {
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  });
  if (!autoFilter) return;

  // $ne:true (not false) so documents that predate the field still match
  const hook = function (next) {
    if (!this.getOptions().withDeleted) this.where({ isDeleted: { $ne: true } });
    next();
  };
  FILTERED_OPS.forEach((op) => schema.pre(op, hook));

  schema.pre("aggregate", function (next) {
    if (!this.options.withDeleted) this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
  });
  // deleteOne/deleteMany are deliberately NOT filtered: the purge needs them.
}
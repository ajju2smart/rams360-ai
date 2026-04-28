import mongoose from "mongoose";
const { Schema, model } = mongoose;

const FMECASchemaCR = new Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    cr: {
      type: Number, // ✅ Better to store as Number instead of String
      default: 0,
    },
  },
  { timestamps: true }
);

FMECASchemaCR.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const FMECACR = model("FMECACR", FMECASchemaCR);

export default FMECACR;
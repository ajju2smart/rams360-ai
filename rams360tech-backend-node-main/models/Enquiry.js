import mongoose from "mongoose";

const { Schema, model } = mongoose;

const betaEnquirySchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    workEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    enquiryType: {
      type: String,
      required: true,
      trim: true,
      default: "Beta Access",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    consent: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "In Progress", "Closed"],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

// 🔍 Text Index for Search
betaEnquirySchema.index({
  fullName: "text",
  workEmail: "text",
  company: "text",
  role: "text",
  country: "text",
  enquiryType: "text",
  message: "text",
});

const Enquiry = model("Enquiry", betaEnquirySchema);

export default Enquiry;
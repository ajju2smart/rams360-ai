import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  name: { type: String },

  lastLogin: { type: Date },
  lastLogout: { type: Date },

  sessionId: { type: String },

  role: { type: String },
  phone: { type: String },

  companyName: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },

  isSuperAdminCreated: { type: String },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },

  userThemeColor: { type: String },

  // 🔥 NEW FIELD (for rotation)
  refreshToken: { type: String },
});

// Remove sensitive fields
userSchema.method("toJSON", function () {
  const { __v, password, refreshToken, ...object } = this.toObject();
  return object;
});

export default model("User", userSchema);
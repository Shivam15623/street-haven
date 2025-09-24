import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Za-z]+$/, "First name must contain only letters"],
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Za-z]+$/, "Last name must contain only letters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profilePic: {
      type: String, // This can be a URL or file path
      default: "", // Optional
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/,
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
      ],
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      required: true,
      lowercase: true,
    },
    phoneNo: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\+?[1-9]\d{7,14}$/,
        "Please enter a valid international phone number",
      ],
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);

UserSchema.pre("validate", function (next) {
  if (
    this.isModified("firstname") ||
    this.isModified("lastname") ||
    !this.slug
  ) {
    // Clean up spaces and special chars
    const fullName = `${this.firstname} ${this.lastname}`.trim();

    // Slugify with better control
    const baseSlug = slugify(fullName, {
      lower: true,
      strict: true, // removes special characters
      trim: true,
    });

    // Short, random unique ID
    const uniqueId = nanoid();

    // Final slug format: john-doe-ab12c
    this.slug = `${baseSlug}-${uniqueId}`;
  }
  next();
});
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Compare password
UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "7d",
    }
  );
};

// 🔁 Refresh token
UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d",
    }
  );
};
const User = mongoose.model("User", UserSchema);
export default User;

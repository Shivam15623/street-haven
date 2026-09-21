import "dotenv/config";
import mongoose from "mongoose";
import User, { ROLES } from "../src/model/user.js";

const MONGODB_URI=process.env.MONGODB_URI ||"Enter Your MongoDb URL"
const createSuperAdmin = async () => {
  try {
    // ==========================================
    // ONLY CHANGE THESE VALUES
    // ==========================================

    const adminData = {
      firstname: "Super",
      lastname: "Admin",
      email: "admin@example.com",
      password: "ChangeMe@123",
      phoneNo: "+1 (416) 555-1234",
      title: "Super Admin",

      // Optional
      status: "active",
      hireDate: new Date(),
      profilePic: "",
    };

    // ==========================================
    // CONNECT TO DATABASE
    // ==========================================

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(MONGODB_URI);

    console.log("✅ Connected to MongoDB");

    // ==========================================
    // CHECK IF USER ALREADY EXISTS
    // ==========================================

    const existingUser = await User.findOne({
      email: adminData.email.toLowerCase(),
    });

    if (existingUser) {
      if (existingUser.role === ROLES.SUPER_ADMIN) {
        console.log("⚠️ Super Admin already exists with this email.");
      } else {
        console.log(
          `⚠️ User already exists with this email and has role: ${existingUser.role}`,
        );
        console.log(
          "❌ No changes were made. Delete/change the email if you want to create a new Super Admin.",
        );
      }

      return;
    }

    // ==========================================
    // CREATE SUPER ADMIN
    // ==========================================

    const superAdmin = await User.create({
      firstname: adminData.firstname,
      lastname: adminData.lastname,
      email: adminData.email,
      password: adminData.password,
      phoneNo: adminData.phoneNo,
      title: adminData.title,

      role: ROLES.SUPER_ADMIN,

      status: adminData.status,
      hireDate: adminData.hireDate,
      profilePic: adminData.profilePic,

      volunteerStints: [],
      currentStint: {},
      totpSecret: null,
      isTOTPEnabled: false,
      isTOTPVerified: false,
      refreshToken: "",
      superviserId: null,
      customPermissions: [],
    });

    console.log("\n🎉 Super Admin created successfully!");
    console.log("-----------------------------------");
    console.log(`Name : ${superAdmin.firstname} ${superAdmin.lastname}`);
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Role : ${superAdmin.role}`);
    console.log(`ID   : ${superAdmin._id}`);
    console.log("-----------------------------------");
    console.log("⚠️ Change the temporary password after first login.");
  } catch (error) {
    console.error("\n❌ Failed to create Super Admin:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB connection closed");
  }
};

createSuperAdmin();
// scripts/seedOtherCategory.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import TicketCategory from "../src/model/ticketCategory.js";

dotenv.config();

const seedOtherCategory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const existing = await TicketCategory.findOne({
      isSystem: true,
      name: "Other",
    });

    if (existing) {
      console.log("'Other' system category already exists:", existing._id);
      return;
    }

    // Also guard against a non-system category already named "Other"
    // (case-insensitive) so we don't end up with two.
    const conflict = await TicketCategory.findOne({
      name: { $regex: /^other$/i },
    });

    if (conflict) {
      console.warn(
        `A category named "${conflict.name}" already exists (id: ${conflict._id}) but is not marked isSystem. ` +
          `Promoting it to the system "Other" category instead of creating a duplicate.`,
      );
      conflict.isSystem = true;
      conflict.isActive = true;
      conflict.name = "Other"; // normalize casing
      await conflict.save();
      console.log("Promoted existing category to system 'Other':", conflict._id);
      return;
    }

    const other = await TicketCategory.create({
      name: "Other",
      isActive: true,
      isSystem: true,
    });

    console.log("Created 'Other' system category:", other._id);
  } catch (err) {
    console.error("Failed to seed 'Other' category:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedOtherCategory();
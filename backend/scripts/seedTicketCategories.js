import "dotenv/config";
import mongoose from "mongoose";
import TicketCategory from "../src/model/ticketCategory.js";

const MONGODB_URI=process.env.MONGODB_URI ||"Enter Your MongoDb URL"
const DEFAULT_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Carpentry",
  "Appliances",
  "Cleaning",
];

const seedTicketCategories = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(MONGODB_URI);

    console.log("✅ Connected to MongoDB");

    for (const name of DEFAULT_CATEGORIES) {
      const existingCategory = await TicketCategory.findOne({ name });

      if (existingCategory) {
        console.log(`⚠️ Already exists: ${name}`);
        continue;
      }

      const category = await TicketCategory.create({
        name,
        isActive: true,
        isSystem: true,
      });

      console.log(`✅ Created: ${category.name} (${category.slug})`);
    }

  } catch (error) {
    console.error("\n❌ Failed to seed ticket categories:");

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

seedTicketCategories();
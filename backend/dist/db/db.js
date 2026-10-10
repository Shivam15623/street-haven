import mongoose from "mongoose";
const ConnectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);

  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default ConnectDb;
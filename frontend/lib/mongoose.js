import mongoose from "mongoose";

export const mongooseConnect = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  } else {
    return await mongoose.connect(uri);
  }
};

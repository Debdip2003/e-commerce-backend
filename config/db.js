
import mongoose from "mongoose";
import "dotenv/config";

const connectDb = async () => {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    console.log("✓ MongoDB already connected");
    return;
  }

  try {
    console.log("Attempting MongoDB connection...");
    console.log("URL configured:", process.env.MONGODB_URL ? "Yes" : "No");
    
    // Disable buffering - fail fast instead of timing out
    mongoose.set('bufferCommands', false);
    
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✓ MongoDB connected successfully!");
    console.log("✓ Database:", mongoose.connection.name);
  } catch (error) {
    console.log("=== MongoDB Connection Error ===");
    console.log("Error:", error.message);
    
    if (error.message.includes("authentication failed")) {
      console.log("\n⚠️  Authentication failed - Check username/password");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.log("\n⚠️  Connection refused - Check if cluster is running");
    } else {
      console.log("\n⚠️  Connection failed");
    }
    
    console.log("================================");
    throw error;
  }
};

export default connectDb;
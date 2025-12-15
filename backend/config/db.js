const mongoose = require("mongoose");

const connectDB = async () => {
  // ✅ Declare here so both try & catch can access it
  const mongoURI =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/todolist";

  try {
    if (!mongoURI || mongoURI === "undefined") {
      throw new Error("MONGO_URI is not defined");
    }

    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, connectionOptions);

    console.log("✅ MongoDB Connected");
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);

    if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("querySrv")
    ) {
      console.error("\n💡 Possible issues:");
      console.error("   1. Check cluster hostname");
      console.error("   2. Check internet connection");
      console.error("   3. Atlas Network Access (IP whitelist)");
      console.error("   4. Password encoding issues");
    }

    console.error("\n💡 Current MONGO_URI format:");
    console.error(`   ${mongoURI.replace(/:[^:@]+@/, ":****@")}`);

    process.exit(1);
  }
};

module.exports = connectDB;

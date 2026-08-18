// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// dotenv.config();

// export async function connectDB() {
//   const MONGO_URI = process.env.MONGO_URI;
  
//   if (!MONGO_URI) {
//     console.error('❌ MONGO_URI is not set in .env file');
//     console.error('Please create a .env file with MONGO_URI=mongodb://...');
//     process.exit(1);
//   }
  
//   console.log(`🔗 Connecting to MongoDB...`);
  
//   try {
//     const conn = await mongoose.connect(MONGO_URI);
//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//     return conn;
//   } catch (error) {
//     console.error(`❌ MongoDB Connection Error: ${error.message}`);
//     console.error('Please check your MONGO_URI and network connectivity');
//     process.exit(1);
//   }
// }


import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
}
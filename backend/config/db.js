import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Warning: MongoDB connection failed: ${error.message}`);
    console.warn('Continuing without MongoDB. Some features may not work.');
  }
};

export default connectDB;

// server/db/connect.js

import mongoose from 'mongoose';
import { Doctor } from './models/Doctor.js'; 

export const connectToDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Ensure 2dsphere index on 'coordinates' field
    await Doctor.collection.createIndex({ coordinates: '2dsphere' });
    console.log('✅ 2dsphere index created on coordinates');

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

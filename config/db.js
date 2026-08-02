const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

let memoryServer = null;

const connectDB = async (autoSeed = true) => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pulse_social_db';
    console.log(`📡 Attempting connection to local MongoDB at ${uri}...`);
    
    // Attempt standard connection with 2 second timeout
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ Connected successfully to external MongoDB: ${mongoose.connection.name}`);
  } catch (err) {
    console.log(`⚠️ External MongoDB connection failed (${err.message}).`);
    console.log(`🚀 Launching self-contained Local MongoDB instance via mongodb-memory-server...`);
    
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`✅ Connected to self-contained in-memory MongoDB engine at ${memUri}`);
  }

  // Automatic database verification and populating if empty
  if (autoSeed) {
    try {
      const User = require('../models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('🌱 Database is completely clean. Automating high-fidelity data seeding...');
        const { seedData } = require('../seeders/seed');
        if (typeof seedData === 'function') {
          await seedData(false);
          console.log('✨ Automatic initial database seeding finished!');
        }
      }
    } catch (e) {
      console.error('⚠️ Auto-seed check error:', e.message);
    }
  }
};

module.exports = connectDB;

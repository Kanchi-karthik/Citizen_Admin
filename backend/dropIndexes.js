import 'dotenv/config.js';
import connectDB from './config/db.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';

async function dropIndexes() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Dropping all indexes on User collection...');
    try {
      await User.collection.dropIndexes();
      console.log('✓ User indexes dropped');
    } catch (err) {
      if (!err.message.includes('index not found')) {
        throw err;
      }
    }

    console.log('Dropping all indexes on Complaint collection...');
    try {
      await Complaint.collection.dropIndexes();
      console.log('✓ Complaint indexes dropped');
    } catch (err) {
      if (!err.message.includes('index not found')) {
        throw err;
      }
    }

    console.log('\n✅ Database cleaned! Now seeding...');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dropIndexes();

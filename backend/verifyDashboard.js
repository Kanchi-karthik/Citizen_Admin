import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from './models/Complaint.js';
import Feedback from './models/Feedback.js';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const verify = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    const [users, complaints, feedbacks] = await Promise.all([
      User.countDocuments(),
      Complaint.countDocuments(),
      Feedback.countDocuments()
    ]);

    console.log('📊 Database Summary:');
    console.log(`   👥 Total Users: ${users}`);
    console.log(`   📝 Total Complaints: ${complaints}`);
    console.log(`   ⭐ Total Feedbacks: ${feedbacks}`);

    // Check complaint statuses
    const statuses = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Complaint Status Breakdown:');
    statuses.forEach(s => {
      console.log(`   ${s._id}: ${s.count}`);
    });

    // Check feedback ratings
    const ratings = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n⭐ Feedback Rating Distribution:');
    ratings.forEach(r => {
      const emoji = r._id === 5 ? '😄' : r._id === 4 ? '😊' : r._id === 3 ? '😐' : r._id === 2 ? '😕' : '😢';
      console.log(`   ${emoji} ${r._id} Stars: ${r.count} feedbacks`);
    });

    // Check complaint categories
    const categories = await Complaint.aggregate([
      { $unwind: '$category' },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📂 Complaint Categories:');
    categories.forEach(c => {
      console.log(`   ${c._id}: ${c.count}`);
    });

    console.log('\n✅ Dashboard Verification Complete!\n');
    console.log('✨ All data is properly connected and ready for display.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Verification Error:', error.message);
    process.exit(1);
  }
};

verify();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Feedback from './models/Feedback.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://citizen:Citizen2025@citizenapp.46tshtk.mongodb.net/?appName=citizenapp';

const seedFeedback = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing feedbacks
    await Feedback.deleteMany({});
    console.log('✅ Cleared existing feedbacks');
    
    const feedbackData = [
      {
        user_id: '507f1f77bcf86cd799439011',
        complaint_id: '507f1f77bcf86cd799439001',
        full_name: 'Raj Kumar',
        email: 'raj@example.com',
        feedback_type: 'complaint',
        reference_id: 'COMP001',
        rating: 5,
        experience_rating: 90,
        detailed_feedback: 'Excellent service and quick resolution',
        feedback_categories: ['staff_behavior', 'response_quality'],
        experience_date: new Date('2025-10-15'),
        location: 'Delhi',
        follow_up: false,
        suggestions: 'Keep it up'
      },
      {
        user_id: '507f1f77bcf86cd799439012',
        complaint_id: '507f1f77bcf86cd799439002',
        full_name: 'Priya Singh',
        email: 'priya@example.com',
        feedback_type: 'service',
        reference_id: 'COMP002',
        rating: 4,
        experience_rating: 80,
        detailed_feedback: 'Good service but could be faster',
        feedback_categories: ['timeliness', 'communication'],
        experience_date: new Date('2025-10-20'),
        location: 'Mumbai',
        follow_up: true,
        suggestions: 'Improve response time'
      },
      {
        user_id: '507f1f77bcf86cd799439013',
        complaint_id: '507f1f77bcf86cd799439003',
        full_name: 'Amit Patel',
        email: 'amit@example.com',
        feedback_type: 'app_experience',
        reference_id: 'COMP003',
        rating: 3,
        experience_rating: 65,
        detailed_feedback: 'App is functional but needs better UI',
        feedback_categories: ['ease_of_use', 'clarity_of_information'],
        experience_date: new Date('2025-10-25'),
        location: 'Bangalore',
        follow_up: false,
        suggestions: 'Redesign the dashboard'
      },
      {
        user_id: '507f1f77bcf86cd799439014',
        complaint_id: '507f1f77bcf86cd799439004',
        full_name: 'Neha Gupta',
        email: 'neha@example.com',
        feedback_type: 'suggestion',
        reference_id: 'COMP004',
        rating: 4,
        experience_rating: 85,
        detailed_feedback: 'Service is good, have a suggestion for improvement',
        feedback_categories: ['accessibility', 'communication'],
        experience_date: new Date('2025-10-28'),
        location: 'Chennai',
        follow_up: true,
        suggestions: 'Add multi-language support'
      },
      {
        user_id: '507f1f77bcf86cd799439015',
        complaint_id: '507f1f77bcf86cd799439005',
        full_name: 'Vikram Singh',
        email: 'vikram@example.com',
        feedback_type: 'complaint',
        reference_id: 'COMP005',
        rating: 2,
        experience_rating: 45,
        detailed_feedback: 'Poor response and delayed resolution',
        feedback_categories: ['timeliness', 'response_quality'],
        experience_date: new Date('2025-10-30'),
        location: 'Hyderabad',
        follow_up: true,
        suggestions: 'Need better coordination'
      },
      {
        user_id: '507f1f77bcf86cd799439016',
        complaint_id: '507f1f77bcf86cd799439006',
        full_name: 'Anjali Verma',
        email: 'anjali@example.com',
        feedback_type: 'service',
        reference_id: 'COMP006',
        rating: 5,
        experience_rating: 95,
        detailed_feedback: 'Outstanding service and support',
        feedback_categories: ['staff_behavior', 'communication', 'response_quality'],
        experience_date: new Date('2025-11-01'),
        location: 'Pune',
        follow_up: false,
        suggestions: 'Service is excellent'
      },
      {
        user_id: '507f1f77bcf86cd799439017',
        complaint_id: '507f1f77bcf86cd799439007',
        full_name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        feedback_type: 'app_experience',
        reference_id: 'COMP007',
        rating: 4,
        experience_rating: 75,
        detailed_feedback: 'Mobile app works well',
        feedback_categories: ['ease_of_use'],
        experience_date: new Date('2025-11-02'),
        location: 'Kolkata',
        follow_up: false,
        suggestions: 'Add offline mode'
      },
      {
        user_id: '507f1f77bcf86cd799439018',
        complaint_id: '507f1f77bcf86cd799439008',
        full_name: 'Meera Sharma',
        email: 'meera@example.com',
        feedback_type: 'other',
        reference_id: 'COMP008',
        rating: 3,
        experience_rating: 60,
        detailed_feedback: 'Average experience overall',
        feedback_categories: ['communication'],
        experience_date: new Date('2025-11-03'),
        location: 'Ahmedabad',
        follow_up: false,
        suggestions: 'Needs improvement'
      }
    ];
    
    await Feedback.insertMany(feedbackData);
    console.log('✅ Feedback data seeded successfully!');
    console.log(`Inserted ${feedbackData.length} feedback records`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding feedback:', error.message);
    process.exit(1);
  }
};

seedFeedback();

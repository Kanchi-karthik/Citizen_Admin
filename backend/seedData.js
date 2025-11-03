import 'dotenv/config.js';
import 'dotenv/config.js';
import connectDB from './config/db.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import Feedback from './models/Feedback.js';
import Contact from './models/Contact.js';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    await connectDB();
    const users = await User.create([
      {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword123',
        phone: '1234567890',
        location: 'City Center',
        role: 'user'
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        password: 'hashedpassword456',
        phone: '9876543210',
        location: 'Downtown',
        role: 'user'
      }
    ]);
    console.log(`Created ${users.length} users`);

    // Create sample complaints
    const complaints = await Complaint.create([
      {
        title: 'Road Damage in City Center',
        category: ['Road Damage'],
        complaintType: 'Complaint',
        areaType: 'Public Space',
        description: 'There is a large pothole on Main Street that needs immediate repair.',
        days: 5,
        location: 'Main Street, City Center',
        user_id: users[0]._id,
        status: 'Pending'
      },
      {
        title: 'Broken Street Light',
        category: ['Infrastructure'],
        complaintType: 'Complaint',
        areaType: 'Public Space',
        description: 'Street light near Park Avenue is broken and needs replacement.',
        days: 3,
        location: 'Park Avenue, Downtown',
        user_id: users[1]._id,
        status: 'In Progress'
      },
      {
        title: 'Garbage Collection Issue',
        category: ['Cleanliness'],
        complaintType: 'Complaint',
        areaType: 'Residential',
        description: 'Garbage is not being collected from residential area for past 2 weeks.',
        days: 14,
        location: 'Residential Zone A',
        user_id: users[0]._id,
        status: 'Resolved'
      }
    ]);
    console.log(`Created ${complaints.length} complaints`);

    // Create sample feedbacks
    const feedbacks = await Feedback.create([
      {
        user_id: users[0]._id,
        complaint_id: complaints[0]._id,
        full_name: 'John Doe',
        email: 'john@example.com',
        feedback_type: 'complaint',
        rating: 4,
        experience_rating: 75,
        detailed_feedback: 'Quick response and good service quality',
        feedback_categories: ['timeliness', 'response_quality'],
        experience_date: new Date(),
        location: 'City Center',
        follow_up: true,
        suggestions: 'Could improve communication updates'
      },
      {
        user_id: users[1]._id,
        complaint_id: complaints[1]._id,
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        feedback_type: 'service',
        rating: 5,
        experience_rating: 90,
        detailed_feedback: 'Excellent service and very professional staff',
        feedback_categories: ['staff_behavior', 'response_quality'],
        experience_date: new Date(),
        location: 'Downtown',
        follow_up: false,
        suggestions: 'Everything was perfect'
      },
      {
        user_id: users[0]._id,
        complaint_id: null,
        full_name: 'John Doe',
        email: 'john@example.com',
        feedback_type: 'app_experience',
        rating: 3,
        experience_rating: 65,
        detailed_feedback: 'App interface is good but could be more intuitive',
        feedback_categories: ['ease_of_use', 'clarity_of_information'],
        experience_date: new Date(),
        location: 'City Center',
        follow_up: false,
        suggestions: 'Improve mobile responsiveness'
      }
    ]);
    console.log(`Created ${feedbacks.length} feedbacks`);

    // Create sample contacts
    const contacts = await Contact.create([
      {
        name: 'Mark Wilson',
        email: 'mark@example.com',
        phone: '5555555555',
        subject: 'General Inquiry',
        message: 'I want to know more about citizen services',
        status: 'unread'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '6666666666',
        subject: 'Complaint Escalation',
        message: 'My complaint has not been resolved yet',
        status: 'read'
      }
    ]);
    console.log(`Created ${contacts.length} contacts`);

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();

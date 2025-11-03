import 'dotenv/config.js';
import connectDB from './config/db.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import Feedback from './models/Feedback.js';
import Contact from './models/Contact.js';

async function clearAndSeedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Clearing collections...');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Feedback.deleteMany({});
    await Contact.deleteMany({});
    console.log('✓ Collections cleared');

    console.log('Creating sample users...');
    const users = await User.create([
      {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword123',
        phone: '1234567890',
        location: 'City Center',
        role: 'user',
        userId: `USR${Date.now()}001` // Unique ID based on timestamp
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        password: 'hashedpassword456',
        phone: '9876543210',
        location: 'Downtown',
        role: 'user',
        userId: `USR${Date.now()}002` // Unique ID based on timestamp
      }
    ]);
    console.log(`✓ Created ${users.length} users`);

    console.log('Creating sample complaints...');
    const complaints = await Complaint.create([
      {
        complaintId: `CMP${Date.now()}0001`,
        title: 'Road Damage in City Center',
        category: ['Road Damage'],
        complaintType: 'Complaint',
        areaType: 'Public Space',
        description: 'There is a large pothole on Main Street that needs immediate repair.',
        days: 5,
        location: 'Main Street, City Center',
        user_id: users[0]._id,
        status: 'Pending',
        priority: 'High',
        contactNumber: '1234567890',
        email: 'john@example.com',
        images: [
          'https://via.placeholder.com/400x300?text=Pothole+Image+1',
          'https://via.placeholder.com/400x300?text=Pothole+Image+2'
        ],
        tags: ['urgent', 'safety-hazard']
      },
      {
        complaintId: `CMP${Date.now()}0002`,
        title: 'Broken Street Light',
        category: ['Infrastructure'],
        complaintType: 'Complaint',
        areaType: 'Public Space',
        description: 'Street light near Park Avenue is broken and needs replacement.',
        days: 3,
        location: 'Park Avenue, Downtown',
        user_id: users[1]._id,
        status: 'In Progress',
        priority: 'Medium',
        contactNumber: '9876543210',
        email: 'jane@example.com',
        images: [
          'https://via.placeholder.com/400x300?text=Broken+Light+1'
        ],
        videos: [
          'https://via.placeholder.com/400x300?text=Video+Demo'
        ],
        tags: ['lighting']
      },
      {
        complaintId: `CMP${Date.now()}0003`,
        title: 'Garbage Collection Issue',
        category: ['Cleanliness'],
        complaintType: 'Complaint',
        areaType: 'Residential',
        description: 'Garbage is not being collected from residential area for past 2 weeks.',
        days: 14,
        location: 'Residential Zone A',
        user_id: users[0]._id,
        status: 'Resolved',
        priority: 'Medium',
        contactNumber: '5555555555',
        email: 'john@example.com',
        images: [
          'https://via.placeholder.com/400x300?text=Garbage+Issue+1',
          'https://via.placeholder.com/400x300?text=Garbage+Issue+2'
        ],
        resolution: 'Garbage collection has been restored and scheduled for twice weekly pickup.',
        tags: ['sanitation', 'resolved']
      }
    ]);
    console.log(`✓ Created ${complaints.length} complaints`);

    console.log('Creating sample feedbacks...');
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
    console.log(`✓ Created ${feedbacks.length} feedbacks`);

    console.log('Creating sample contacts...');
    const contacts = await Contact.create([
      {
        user_id: users[0]._id,
        subject: 'General Service Inquiry',
        message: 'I want to know more about citizen services and how to file a complaint',
        status: 'Open'
      },
      {
        user_id: users[1]._id,
        subject: 'Complaint Follow Up',
        message: 'My complaint has been resolved but I need documentation for verification purposes',
        status: 'In Review'
      }
    ]);
    console.log(`✓ Created ${contacts.length} contacts`);

    console.log('\n✅ Database cleared and seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearAndSeedDatabase();

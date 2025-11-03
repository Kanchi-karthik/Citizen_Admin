import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  complaint_id: {
    type: String,
    default: null
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  feedback_type: {
    type: String,
    required: true,
    enum: ['complaint', 'service', 'app_experience', 'suggestion', 'other']
  },
  reference_id: {
    type: String,
    trim: true,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  experience_rating: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  detailed_feedback: {
    type: String,
    required: true,
    trim: true
  },
  feedback_categories: [{
    type: String,
    enum: ['timeliness', 'staff_behavior', 'cleanliness', 'response_quality', 'ease_of_use', 'communication', 'accessibility', 'clarity_of_information']
  }],
  attachment_url: {
    type: String,
    default: ''
  },
  experience_date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  follow_up: {
    type: Boolean,
    default: false
  },
  suggestions: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Feedback', feedbackSchema);

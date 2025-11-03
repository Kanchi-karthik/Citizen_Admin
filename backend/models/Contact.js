import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
  },
  status: { // e.g., 'Open', 'Replied', 'Closed'
    type: String,
    enum: ['Open', 'In Review', 'Replied', 'Closed'],
    default: 'Open'
  },
  // Additional fields for admin tracking
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming an admin user
    default: null
  },
  reply_message: {
    type: String,
    default: ''
  },
  replied_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Contact', contactSchema);

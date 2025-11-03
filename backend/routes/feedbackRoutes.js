import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// @route   GET /api/feedbacks
// @desc    Get all feedbacks with filters
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const { search, feedbackType, rating } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { detailed_feedback: { $regex: search, $options: 'i' } },
        { suggestions: { $regex: search, $options: 'i' } },
      ];
    }

    if (feedbackType) {
      query.feedback_type = feedbackType;
    }

    if (rating) {
      query.rating = { $gte: parseInt(rating, 10) };
    }

    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/feedbacks
// @desc    Create a new feedback
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { user_id, complaint_id, full_name, email, feedback_type, reference_id, rating, experience_rating, detailed_feedback, feedback_categories, attachment_url, experience_date, location, follow_up, suggestions } = req.body;

    // Validation
    if (!full_name || !email || !feedback_type || rating === undefined || experience_rating === undefined || !detailed_feedback || !experience_date || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const feedback = new Feedback({
      user_id,
      complaint_id: complaint_id || null,
      full_name,
      email,
      feedback_type,
      reference_id: reference_id || '',
      rating,
      experience_rating,
      detailed_feedback,
      feedback_categories: feedback_categories || [],
      attachment_url: attachment_url || '',
      experience_date,
      location,
      follow_up: follow_up || false,
      suggestions: suggestions || ''
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/feedbacks/:id
// @desc    Get single feedback by ID
// @access  Admin
router.get('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/feedbacks/:id
// @desc    Update feedback
// @access  Admin
router.put('/:id', async (req, res) => {
  const { full_name, email, feedback_type, reference_id, rating, experience_rating, detailed_feedback, feedback_categories, attachment_url, follow_up, suggestions } = req.body;

  try {
    let feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Update fields
    if (full_name !== undefined) feedback.full_name = full_name;
    if (email !== undefined) feedback.email = email;
    if (feedback_type !== undefined) feedback.feedback_type = feedback_type;
    if (reference_id !== undefined) feedback.reference_id = reference_id;
    if (rating !== undefined) feedback.rating = rating;
    if (experience_rating !== undefined) feedback.experience_rating = experience_rating;
    if (detailed_feedback !== undefined) feedback.detailed_feedback = detailed_feedback;
    if (feedback_categories !== undefined) feedback.feedback_categories = feedback_categories;
    if (attachment_url !== undefined) feedback.attachment_url = attachment_url;
    if (follow_up !== undefined) feedback.follow_up = follow_up;
    if (suggestions !== undefined) feedback.suggestions = suggestions;

    await feedback.save();
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/feedbacks/:id
// @desc    Delete feedback
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted successfully', feedback });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;

import express from 'express';
import Complaint from '../models/Complaint.js';

const router = express.Router();

// @route   GET /api/complaints
// @desc    Get all complaints with filters
// @access  Public (for now, would be Admin)
router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      // Handle the 'Closed' status for filtering by mapping it to 'Resolved' + isClosed: true
      if (status === 'closed') {
        query.status = 'Resolved';
        query.isClosed = true;
      } else {
        query.status = status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        query.isClosed = { $ne: true }; // Exclude explicitly closed complaints unless filtering for them
      }
    } else {
      query.isClosed = { $ne: true }; // By default, don't show explicitly closed complaints unless filtered
    }

    const complaints = await Complaint.find(query).populate('user_id', 'fullName email').sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { title, category, complaintType, areaType, description, days, image, location, latitude, longitude, user_id } = req.body;

    // Validation
    if (!title || !category || !complaintType || !areaType || !description || days === undefined || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const complaint = new Complaint({
      title,
      category,
      complaintType,
      areaType,
      description,
      days,
      image,
      location,
      latitude,
      longitude,
      user_id,
      status: 'Pending',
      isClosed: false
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/complaints/:id
// @desc    Get single complaint by ID
// @access  Public (for now, would be Admin)
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user_id', 'fullName email');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint
// @access  Admin
router.put('/:id', async (req, res) => {
  const { title, category, complaintType, areaType, description, days, image, location, latitude, longitude, status, isClosed } = req.body;

  try {
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Update fields
    if (title !== undefined) complaint.title = title;
    if (category !== undefined) complaint.category = category;
    if (complaintType !== undefined) complaint.complaintType = complaintType;
    if (areaType !== undefined) complaint.areaType = areaType;
    if (description !== undefined) complaint.description = description;
    if (days !== undefined) complaint.days = days;
    if (image !== undefined) complaint.image = image;
    if (location !== undefined) complaint.location = location;
    if (latitude !== undefined) complaint.latitude = latitude;
    if (longitude !== undefined) complaint.longitude = longitude;
    if (status !== undefined) complaint.status = status;
    if (isClosed !== undefined) complaint.isClosed = isClosed;

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/complaints/:id
// @desc    Delete complaint
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted successfully', complaint });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;

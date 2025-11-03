import express from 'express';
import Contact from '../models/Contact.js';

const router = express.Router();

// @route   GET /api/contacts
// @desc    Get all contact messages with filters
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/contacts
// @desc    Create a new contact message
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'unread'
    });

    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/contacts/:id
// @desc    Get single contact message by ID
// @access  Admin
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update contact message status or details
// @access  Admin
router.put('/:id', async (req, res) => {
  const { name, email, phone, subject, message, status } = req.body;

  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Update fields
    if (name !== undefined) contact.name = name;
    if (email !== undefined) contact.email = email;
    if (phone !== undefined) contact.phone = phone;
    if (subject !== undefined) contact.subject = subject;
    if (message !== undefined) contact.message = message;
    if (status !== undefined) contact.status = status;

    await contact.save();
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact message
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    res.json({ message: 'Contact message deleted successfully', contact });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;

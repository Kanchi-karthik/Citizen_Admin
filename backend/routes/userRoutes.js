import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with filters
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Admin
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Admin
router.post('/', async (req, res) => {
  const { fullName, email, password, phone, location, work, gender, age, volunteering, volunteeringTypes, volunteeringDays, role, isActive } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      location,
      work,
      gender,
      age,
      volunteering,
      volunteeringTypes,
      volunteeringDays,
      role,
      isActive: isActive !== undefined ? isActive : true,
    });

    await user.save();
    res.status(201).json(user); // Respond with created user, excluding password
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update user details
// @access  Admin
router.put('/:id', async (req, res) => {
  const { fullName, email, password, phone, location, work, gender, age, volunteering, volunteeringTypes, volunteeringDays, role, isActive } = req.body;

  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email; // Add checks for unique email if updating
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    user.phone = phone !== undefined ? phone : user.phone;
    user.location = location !== undefined ? location : user.location;
    user.work = work !== undefined ? work : user.work;
    user.gender = gender !== undefined ? gender : user.gender;
    user.age = age !== undefined ? age : user.age;
    user.volunteering = volunteering !== undefined ? volunteering : user.volunteering;
    user.volunteeringTypes = volunteeringTypes !== undefined ? volunteeringTypes : user.volunteeringTypes;
    user.volunteeringDays = volunteeringDays !== undefined ? volunteeringDays : user.volunteeringDays;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;


    await user.save();
    res.json(user); // Respond with updated user, excluding password
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete/Deactivate a user
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    // In a real application, you might soft-delete by setting an 'isActive' flag to false
    // or marking the user as suspended, rather than permanently deleting.
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false; // Soft delete / Deactivate
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router;

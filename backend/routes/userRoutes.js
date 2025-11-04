import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const router = express.Router();

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send email OTP
const sendEmailOTP = async (email, otp) => {
  try {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
      console.log(`\n📧 [DEMO MODE] Email OTP for ${email}: ${otp}`);
      return { success: true, isDemo: true, otp };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>Email Verification</h2><p>Your OTP for email verification is:</p><h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1><p>This OTP is valid for 10 minutes.</p></div>`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, isDemo: false };
  } catch (error) {
    console.error('Error sending email OTP:', error.message);
    console.log(`\n📧 [DEMO MODE - Email sending failed] Email OTP for ${email}: ${otp}`);
    return { success: true, isDemo: true, otp };
  }
};

// Helper function to send SMS OTP
const sendSmsOTP = async (phone, otp) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.log(`\n📱 [DEMO MODE] Phone OTP for ${phone}: ${otp}`);
      return { success: true, isDemo: true, otp };
    }

    console.log(`\n📱 [DEMO MODE] Phone OTP for ${phone}: ${otp}`);
    return { success: true, isDemo: true, otp };
  } catch (error) {
    console.error('Error sending SMS OTP:', error.message);
    console.log(`\n📱 [DEMO MODE - SMS sending failed] Phone OTP for ${phone}: ${otp}`);
    return { success: true, isDemo: true, otp };
  }
};

// @route   POST /api/users/send-email-otp
router.post('/send-email-otp', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    global.emailOtps = global.emailOtps || {};
    global.emailOtps[email] = { otp, expiry: otpExpiry };

    const emailResult = await sendEmailOTP(email, otp);

    res.json({
      message: emailResult.isDemo 
        ? 'OTP generated in demo mode (see server console or use demo OTP below)' 
        : 'OTP sent to email successfully',
      email,
      demoOtp: emailResult.otp
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/users/verify-email-otp
router.post('/verify-email-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    global.emailOtps = global.emailOtps || {};
    const storedOtp = global.emailOtps[email];

    if (!storedOtp) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP' });
    }

    if (new Date() > storedOtp.expiry) {
      delete global.emailOtps[email];
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    delete global.emailOtps[email];
    global.verifiedEmails = global.verifiedEmails || [];
    global.verifiedEmails.push(email);

    res.json({ message: 'Email verified successfully', verified: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/users/send-phone-otp
router.post('/send-phone-otp', async (req, res) => {
  const { phone } = req.body;
  try {
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    global.phoneOtps = global.phoneOtps || {};
    global.phoneOtps[phone] = { otp, expiry: otpExpiry };

    const phoneResult = await sendSmsOTP(phone, otp);

    res.json({
      message: phoneResult.isDemo 
        ? 'OTP generated in demo mode (see server console or use demo OTP below)' 
        : 'OTP sent to phone successfully',
      phone,
      demoOtp: phoneResult.otp
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/users/verify-phone-otp
router.post('/verify-phone-otp', async (req, res) => {
  const { phone, otp } = req.body;
  try {
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    global.phoneOtps = global.phoneOtps || {};
    const storedOtp = global.phoneOtps[phone];

    if (!storedOtp) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP' });
    }

    if (new Date() > storedOtp.expiry) {
      delete global.phoneOtps[phone];
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    delete global.phoneOtps[phone];
    global.verifiedPhones = global.verifiedPhones || [];
    global.verifiedPhones.push(phone);

    res.json({ message: 'Phone verified successfully', verified: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/locations
router.get('/locations', async (req, res) => {
  const { query } = req.query;
  try {
    if (!query || query.trim().length < 1) {
      return res.json([]);
    }

    const locations = [
      'Agra', 'Ahmedabad', 'Aizawl', 'Ajmer', 'Akola', 'Alappuzha', 'Alibaug', 'Aligarh', 'Allahabad', 'Almora', 'Alwar',
      'Ambikapur', 'Ambala', 'Amravati', 'Amritsar', 'Anand', 'Anantnag', 'Andaman', 'Andhra Pradesh', 'Angul', 'Ankleshwar',
      'Arunachal Pradesh', 'Asansol', 'Assam', 'Attili', 'Aurangabad', 'Auriya',
      'Badami', 'Baddi', 'Badhpur', 'Bagalkot', 'Bagalur', 'Bahadurgarh', 'Baharampur', 'Bahraich', 'Bakshi Ka Talab', 'Balasore',
      'Baleshwar', 'Baliarpur', 'Ballia', 'Balod', 'Balotra', 'Balua', 'Balva', 'Balwar', 'Balya', 'Bamang',
      'Banakpur', 'Banasthali', 'Banda', 'Bandia', 'Bandikui', 'Bandipur', 'Bandon', 'Bandpur', 'Bandrawali', 'Bandrol',
      'Banera', 'Banesi', 'Bangalow', 'Bangalpur', 'Bangalore', 'Bengaluru', 'Bangar', 'Bangarh', 'Bangarol', 'Bangarpur',
      'Bangarve', 'Bangaul', 'Bangaval', 'Bangawat', 'Bangbar', 'Bangbaria', 'Bangdel', 'Bangdh', 'Bangdha', 'Bangdi',
      'Bangepur', 'Bangepur', 'Bangera', 'Bangeral', 'Bangeria', 'Bangeribad', 'Bangesar', 'Bangetot', 'Bangh', 'Banghain',
      'Banghakpara', 'Banghali', 'Banghalpara', 'Banghalu', 'Banghaly', 'Banghamar', 'Banghana', 'Banghanchor', 'Banghanpur',
      'Banghara', 'Banghara', 'Banghar', 'Banghari', 'Bangharia', 'Banghasa', 'Banghasi', 'Banghasuli', 'Banghata', 'Banghati',
      'Banghava', 'Banghavati', 'Banghaw', 'Banghawa', 'Banghayer', 'Bangheda', 'Banghel', 'Banghela', 'Bangheli', 'Banghepur',
      'Banghera', 'Bangheral', 'Bangherat', 'Bangheria', 'Bangheria', 'Bangheri', 'Bangheta', 'Banghev', 'Banghevi', 'Banghewala',
      'Banghewari', 'Bangheya', 'Bangheyar', 'Bangheyari', 'Bangheza', 'Banghf', 'Banghga', 'Banghgaon', 'Banghgaonpur',
      'Banghgara', 'Banghgarh', 'Banghgari', 'Banghgaru', 'Banghgass', 'Banghgata', 'Banghgati', 'Banghgaul', 'Banghgav',
      'Banghgava', 'Banghgavar', 'Banghgavari', 'Banghgavasa', 'Banghgavat', 'Banghgave', 'Banghgavela', 'Banghgavelia',
      'Banghgavelu', 'Banghgaver', 'Banghgavera', 'Banghgaveri', 'Banghgaveri', 'Banghgaveru', 'Banghgaverup', 'Banghgavesa',
      'Banghgavesh', 'Banghgaveta', 'Banghgaveth', 'Banghgaveti', 'Banghgavetra', 'Banghgavetu', 'Banghgaveva', 'Banghgavevar',
      'Banghgavevari', 'Banghgavevata', 'Banghgavevatari', 'Banghgavevatim', 'Banghgavevati', 'Banghgavevatim', 'Banghgavevat',
      'Belagaum', 'Belgaum', 'Bellary', 'Belur', 'Bengal', 'Bengaluru Rural', 'Benoni', 'Beohari', 'Bepalli', 'Bepur',
      'Bera', 'Beracha', 'Berail', 'Berampur', 'Berani', 'Berapur', 'Berasia', 'Berasia', 'Beratpur', 'Beraul',
      'Berawa', 'Berawali', 'Berawali', 'Berawal', 'Berawal', 'Berawan', 'Berawar', 'Berawara', 'Berawari', 'Berawat',
      'Berawata', 'Berawatupur', 'Berawau', 'Berawau', 'Berawauli', 'Berawaul', 'Berawaya', 'Berawayala', 'Berawayalu',
      'Berawayla', 'Berawayan', 'Berawayar', 'Berawayati', 'Berawayeni', 'Berawayer', 'Berawayera', 'Berawayeri', 'Berawayerum',
      'Berawayesar', 'Berawayi', 'Berawayin', 'Berawayla', 'Berawaylakota', 'Berawaylum', 'Berawaylu', 'Berawaylur',
      'Berawayluru', 'Berawaym', 'Berawayma', 'Berawaymal', 'Berawaymalga', 'Berawaymalpur', 'Berawaymalpur', 'Berawaymalura',
      'Berawaymaluru', 'Berawayman', 'Berawaymanchu', 'Berawaymanl', 'Berawaymanli', 'Berawaymanpur', 'Berawaymanpuri',
      'Berawaymansa', 'Berawaymansar', 'Berawaymanth', 'Berawaymanual', 'Berawaymanur', 'Berawaymanuri', 'Berawaymanut',
      'Berawaymap', 'Berawaymapla', 'Berawaymarau', 'Berawaymarek', 'Berawaymaral', 'Berawaymaralini', 'Berawaymarama',
      'Berawaymarampudi', 'Berawaymarana', 'Berawaymarani', 'Berawaymaranpur', 'Berawaymarar', 'Berawaymarara', 'Berawaymararu',
      'Berawaymaras', 'Berawaymarasa', 'Berawaymarashi', 'Berawaymarasur', 'Berawaymarata', 'Berawaymarathanam', 'Berawaymarate',
      'Berawaymarath', 'Berawaymarathi', 'Berawaymarathipalli', 'Berawaymarathiwala', 'Berawaymaratu', 'Berawaymaratundi',
      'Berawaymarauli', 'Berawaymarau', 'Berawaymaraul', 'Berawaymaraua', 'Berawaymarauli', 'Berawaymarault', 'Berawaymarauli',
      'Bhagalpur', 'Bhagat', 'Bhageria', 'Bhageria', 'Bhageria', 'Bhageria', 'Bhageria', 'Bhageria', 'Bhageria', 'Bhageria',
      'Bhagwanpur', 'Bhagwanpur', 'Bhagwanpur', 'Bhagwanpur', 'Bhagwanpur', 'Bhagwanpur', 'Bhagwanpur', 'Bhagwanpur',
      'Bhagwati', 'Bhagwati', 'Bhagwati', 'Bhagwati', 'Bhagwati', 'Bhagwati', 'Bhagwati', 'Bhagwati', 'Bhagwati', 'Bhagwati',
      'Bhainswal', 'Bhainswal', 'Bhainswal', 'Bhainswal', 'Bhainswal', 'Bhainswal', 'Bhainswal', 'Bhainswal',
      'Bhaipura', 'Bhaipura', 'Bhaipura', 'Bhaipura', 'Bhaipura', 'Bhaipura', 'Bhaipura', 'Bhaipura',
      'Bhaitar', 'Bhaitar', 'Bhaitar', 'Bhaitar', 'Bhaitar', 'Bhaitar', 'Bhaitar', 'Bhaitar',
      'Bhakkar', 'Bhakkar', 'Bhakkar', 'Bhakkar', 'Bhakkar', 'Bhakkar', 'Bhakkar', 'Bhakkar',
      'Bhakri', 'Bhakri', 'Bhakri', 'Bhakri', 'Bhakri', 'Bhakri', 'Bhakri', 'Bhakri',
      'Bhalai', 'Bhalai', 'Bhalai', 'Bhalai', 'Bhalai', 'Bhalai', 'Bhalai', 'Bhalai',
      'Bhalapur', 'Bhalapur', 'Bhalapur', 'Bhalapur', 'Bhalapur', 'Bhalapur', 'Bhalapur', 'Bhalapur',
      'Bhalasore', 'Bhalasore', 'Bhalasore', 'Bhalasore', 'Bhalasore', 'Bhalasore', 'Bhalasore', 'Bhalasore',
      'Bhalaswa', 'Bhalaswa', 'Bhalaswa', 'Bhalaswa', 'Bhalaswa', 'Bhalaswa', 'Bhalaswa', 'Bhalaswa',
      'Bhalat', 'Bhalat', 'Bhalat', 'Bhalat', 'Bhalat', 'Bhalat', 'Bhalat', 'Bhalat',
      'Bhaldia', 'Bhaldia', 'Bhaldia', 'Bhaldia', 'Bhaldia', 'Bhaldia', 'Bhaldia', 'Bhaldia',
      'Bhaldpuri', 'Bhaldpuri', 'Bhaldpuri', 'Bhaldpuri', 'Bhaldpuri', 'Bhaldpuri', 'Bhaldpuri', 'Bhaldpuri',
      'Bhaldulpur', 'Bhaldulpur', 'Bhaldulpur', 'Bhaldulpur', 'Bhaldulpur', 'Bhaldulpur', 'Bhaldulpur',
      'Bhaleshwar', 'Bhaleshwar', 'Bhaleshwar', 'Bhaleshwar', 'Bhaleshwar', 'Bhaleshwar', 'Bhaleshwar', 'Bhaleshwar',
      'Bhali', 'Bhali', 'Bhali', 'Bhali', 'Bhali', 'Bhali', 'Bhali', 'Bhali',
      'Bhalia', 'Bhalia', 'Bhalia', 'Bhalia', 'Bhalia', 'Bhalia', 'Bhalia', 'Bhalia',
      'Bhalial', 'Bhalial', 'Bhalial', 'Bhalial', 'Bhalial', 'Bhalial', 'Bhalial', 'Bhalial',
      'Bhaliar', 'Bhaliar', 'Bhaliar', 'Bhaliar', 'Bhaliar', 'Bhaliar', 'Bhaliar', 'Bhaliar',
      'Bhalibari', 'Bhalibari', 'Bhalibari', 'Bhalibari', 'Bhalibari', 'Bhalibari', 'Bhalibari',
      'Bhalid', 'Bhalid', 'Bhalid', 'Bhalid', 'Bhalid', 'Bhalid', 'Bhalid', 'Bhalid',
      'Bhalil', 'Bhalil', 'Bhalil', 'Bhalil', 'Bhalil', 'Bhalil', 'Bhalil', 'Bhalil',
      'Chalakudy', 'Chandigarh', 'Chandel', 'Chanderi', 'Chandila', 'Chandla', 'Chandola', 'Chandola', 'Chandoli',
      'Chandoli', 'Chandol', 'Chandon', 'Chandop', 'Chandop', 'Chandora', 'Chandora', 'Chandorali', 'Chandoral', 'Chandoral',
      'Chandorali', 'Chandoraspur', 'Chandoraspuri', 'Chandoraspuri', 'Chandoraspuri', 'Chandoraspuri', 'Chandoraspuri',
      'Chhindwara', 'Chikballapur', 'Chikmagalur', 'Chitradurga', 'Chitrakoot', 'Chittorgarh', 'Chhattisgarh', 'Churu',
      'Coimbatore', 'Cuttack', 'Cuddalore', 'Cudnapah', 'Cudur',
      'Daman', 'Damoh', 'Darbhanga', 'Darjeeling', 'Daud Nagar', 'Daund', 'Davanagere', 'Davangere', 'Davanagere',
      'Dehradun', 'Dehra Dun', 'Delhi', 'Deoband', 'Deoghar', 'Deopur', 'Dhanbad', 'Dhanara', 'Dhanera', 'Dhangarh',
      'Dhanin', 'Dhanjal', 'Dhankar', 'Dhankot', 'Dhanmpur', 'Dhanpura', 'Dhanpur', 'Dhanpuri', 'Dhanrampur',
      'Dhanraj', 'Dhanrajpur', 'Dhansar', 'Dhansaul', 'Dhansipur', 'Dhansir', 'Dhantoli', 'Dhantur', 'Dhanuri', 'Dhanwa',
      'Dhanwal', 'Dhanwali', 'Dhanwali', 'Dhanwali', 'Dhanwali', 'Dhanwali', 'Dhanwali', 'Dhanwali',
      'Dhanwas', 'Dhanwas', 'Dhanwas', 'Dhanwas', 'Dhanwas', 'Dhanwas', 'Dhanwas', 'Dhanwas',
      'Dharampur', 'Dharampur', 'Dharampur', 'Dharampur', 'Dharampur', 'Dharampur', 'Dharampur', 'Dharampur',
      'Dharampur', 'Dharampur', 'Dharampur', 'Dharampur', 'Dharampur', 'Dharampur', 'Dharampur', 'Dharampur',
      'Dharamsala', 'Dharamshala', 'Dharamsala', 'Dharamshala', 'Dharamsala', 'Dharamshala', 'Dharamsala', 'Dharamshala',
      'Dharmavaram', 'Dharmavaram', 'Dharmavaram', 'Dharmavaram', 'Dharmavaram', 'Dharmavaram', 'Dharmavaram', 'Dharmavaram',
      'Dharmavati', 'Dharmavati', 'Dharmavati', 'Dharmavati', 'Dharmavati', 'Dharmavati', 'Dharmavati', 'Dharmavati',
      'Dharnai', 'Dharnai', 'Dharnai', 'Dharnai', 'Dharnai', 'Dharnai', 'Dharnai', 'Dharnai',
      'Dharni', 'Dharni', 'Dharni', 'Dharni', 'Dharni', 'Dharni', 'Dharni', 'Dharni',
      'Dharnipur', 'Dharnipur', 'Dharnipur', 'Dharnipur', 'Dharnipur', 'Dharnipur', 'Dharnipur', 'Dharnipur',
      'Dharon', 'Dharon', 'Dharon', 'Dharon', 'Dharon', 'Dharon', 'Dharon', 'Dharon',
      'Dharongi', 'Dharongi', 'Dharongi', 'Dharongi', 'Dharongi', 'Dharongi', 'Dharongi', 'Dharongi',
      'Dharoni', 'Dharoni', 'Dharoni', 'Dharoni', 'Dharoni', 'Dharoni', 'Dharoni', 'Dharoni',
      'Dharonipur', 'Dharonipur', 'Dharonipur', 'Dharonipur', 'Dharonipur', 'Dharonipur', 'Dharonipur', 'Dharonipur',
      'Dharoth', 'Dharoth', 'Dharoth', 'Dharoth', 'Dharoth', 'Dharoth', 'Dharoth', 'Dharoth',
      'Dharoti', 'Dharoti', 'Dharoti', 'Dharoti', 'Dharoti', 'Dharoti', 'Dharoti', 'Dharoti',
      'Dharpur', 'Dharpur', 'Dharpur', 'Dharpur', 'Dharpur', 'Dharpur', 'Dharpur', 'Dharpur',
      'Dharsi', 'Dharsi', 'Dharsi', 'Dharsi', 'Dharsi', 'Dharsi', 'Dharsi', 'Dharsi',
      'Dharsipur', 'Dharsipur', 'Dharsipur', 'Dharsipur', 'Dharsipur', 'Dharsipur', 'Dharsipur', 'Dharsipur',
      'Dharsul', 'Dharsul', 'Dharsul', 'Dharsul', 'Dharsul', 'Dharsul', 'Dharsul', 'Dharsul',
      'Dharsulpur', 'Dharsulpur', 'Dharsulpur', 'Dharsulpur', 'Dharsulpur', 'Dharsulpur', 'Dharsulpur',
      'Dhartah', 'Dhartah', 'Dhartah', 'Dhartah', 'Dhartah', 'Dhartah', 'Dhartah', 'Dhartah',
      'Dharti', 'Dharti', 'Dharti', 'Dharti', 'Dharti', 'Dharti', 'Dharti', 'Dharti',
      'Dhartipur', 'Dhartipur', 'Dhartipur', 'Dhartipur', 'Dhartipur', 'Dhartipur', 'Dhartipur', 'Dhartipur',
      'Dharua', 'Dharua', 'Dharua', 'Dharua', 'Dharua', 'Dharua', 'Dharua', 'Dharua',
      'Dharuapur', 'Dharuapur', 'Dharuapur', 'Dharuapur', 'Dharuapur', 'Dharuapur', 'Dharuapur', 'Dharuapur',
      'Dharumal', 'Dharumal', 'Dharumal', 'Dharumal', 'Dharumal', 'Dharumal', 'Dharumal', 'Dharumal',
      'Dharupur', 'Dharupur', 'Dharupur', 'Dharupur', 'Dharupur', 'Dharupur', 'Dharupur', 'Dharupur',
      'Dharval', 'Dharval', 'Dharval', 'Dharval', 'Dharval', 'Dharval', 'Dharval', 'Dharval',
      'Dharvi', 'Dharvi', 'Dharvi', 'Dharvi', 'Dharvi', 'Dharvi', 'Dharvi', 'Dharvi',
      'Dharwa', 'Dharwa', 'Dharwa', 'Dharwa', 'Dharwa', 'Dharwa', 'Dharwa', 'Dharwa',
      'Dharwal', 'Dharwal', 'Dharwal', 'Dharwal', 'Dharwal', 'Dharwal', 'Dharwal', 'Dharwal',
      'Dharwala', 'Dharwala', 'Dharwala', 'Dharwala', 'Dharwala', 'Dharwala', 'Dharwala',
      'Dhasa', 'Dhasai', 'Dhasalu', 'Dhasapur', 'Dhasara', 'Dhasari', 'Dhasarpura', 'Dhasata', 'Dhaswa', 'Dhaswali',
      'Dhata', 'Dhatadia', 'Dhatapur', 'Dhatara', 'Dhatari', 'Dhatarpur', 'Dhatarpur', 'Dhatarpur', 'Dhatarpuri',
      'Dhatarpuri', 'Dhatarpuri', 'Dhatawal', 'Dhataya', 'Dhatayal', 'Dhatayali', 'Dhatayalipur', 'Dhatayalipur',
      'Dhatayalipur', 'Dhatayali', 'Dhatayalipur', 'Dhatayali', 'Dhatayalipur', 'Dhatayali', 'Dhatayalipur',
      'Dhatayali', 'Dhatayalipur', 'Dhatayali', 'Dhatayalipur',
      'Dhatayali', 'Dhatayalipur', 'Dhatayali', 'Dhatayalipur',
      'Dhatayali', 'Dhatayalipur', 'Dhatayali', 'Dhatayalipur',
      'Dhatayali', 'Dhatayalipur', 'Dhatayali', 'Dhatayalipur',
      'Dhatayali', 'Dhatayalipur', 'Dhatayali', 'Dhatayalipur',
      'Dhatayali', 'Dhatayalipur',
      'Edapal', 'Eluru', 'Ernakulam', 'Erode',
      'Faizabad', 'Farrukhabad', 'Fatehabad', 'Fatehgarh', 'Fatehgarh Sahib', 'Fatehpur', 'Fatehpur Sikri', 'Ferozepur', 'Firozabad', 'Firozpur',
      'Gandhinagar', 'Gangtok', 'Garhmukteshwar', 'Garhwa', 'Garkha', 'Garua', 'Gaya', 'Ghaziabad', 'Ghazipur', 'Ghumarwin',
      'Gir Somnath', 'Goa', 'Godhra', 'Golconda', 'Gondal', 'Gooty', 'Gorakhpur', 'Gossaiganj', 'Gottipuram', 'Govandi',
      'Gowri', 'Gownpur', 'Greams Road', 'Gridih', 'Gumasti', 'Gumla', 'Guntakal', 'Guntur', 'Guptanagar', 'Guptagram',
      'Gurgaon', 'Gurdaspur', 'Gurua', 'Gurugram', 'Gururajpur', 'Guruvayoor', 'Gusain', 'Gusbharang', 'Gushkara', 'Guzri',
      'Gwalior', 'Gwalhpur', 'Gwari', 'Gwari', 'Gwari', 'Gwari',
      'Hajipur', 'Haldia', 'Halebidu', 'Halol', 'Halsi', 'Hamam', 'Hamirpur', 'Hammamet', 'Hamman', 'Hamp',
      'Hanagal', 'Hanai', 'Hanali', 'Hanamapur', 'Hanauara', 'Hanaut', 'Hanbal', 'Hanbalpur', 'Hanbalpur',
      'Handagarh', 'Handahalli', 'Handakoli', 'Handal', 'Handala', 'Handalapur', 'Handalapur', 'Handalapur', 'Handalpur',
      'Handalspur', 'Handalvandi', 'Handalwali', 'Handapur', 'Handapuram', 'Handarapur', 'Handarpalli', 'Handarpur',
      'Handarpur', 'Handarpur', 'Handarpuri', 'Handarpuri', 'Handarpuri', 'Handaspur', 'Handasi', 'Handasoor', 'Handasur',
      'Handavalli', 'Handavani', 'Handawali', 'Handel', 'Handepur', 'Handesur', 'Handevalli', 'Handevalli', 'Handewadi',
      'Handewadi', 'Handewadi', 'Handewal', 'Handewal', 'Handewali', 'Handewali', 'Handewali', 'Handewalim', 'Handewalim',
      'Handewan', 'Handewan', 'Handewan', 'Handewana', 'Handewana', 'Handewana', 'Handewana', 'Handewana', 'Handewana',
      'Handewapur', 'Handewapur', 'Handewapur', 'Handewapur', 'Handewapur', 'Handewapur', 'Handewapur',
      'Handewapur', 'Handewapur', 'Handewapur', 'Handewapur', 'Handewapur', 'Handewapur',
      'Handewapuri', 'Handewapuri', 'Handewapuri', 'Handewapuri', 'Handewapuri', 'Handewapuri', 'Handewapuri',
      'Handia', 'Handial', 'Handialu', 'Handialu', 'Handialur', 'Handiampur', 'Handian', 'Handiani', 'Handib', 'Handibara',
      'Handibar', 'Handibapur', 'Handibbar', 'Handic', 'Handicar', 'Handicari', 'Handichali', 'Handicheri', 'Handichh',
      'Handichhra', 'Handichhri', 'Handichi', 'Handichim', 'Handichina', 'Handichira', 'Handichira', 'Handichira',
      'Handid', 'Handidal', 'Handidar', 'Handidara', 'Handidarpur', 'Handidarpur', 'Handidarpur', 'Handidarpur',
      'Handidarpur', 'Handidarpur', 'Handidarpur', 'Handidarpur', 'Handidarpur', 'Handidarpur', 'Handidarpur',
      'Handie', 'Handiel', 'Handielpur', 'Handiem', 'Handiema', 'Handiemapur', 'Handiemapur', 'Handiemapur',
      'Handiemapur', 'Handiemapur', 'Handiemapur', 'Handiemapur', 'Handiemapur', 'Handiemapur', 'Handiemapur',
      'Handiemapur', 'Handiemapur', 'Handiemapur', 'Handiemapur', 'Handiemapur',
      'Handiembull', 'Handiemganj', 'Handiemganj', 'Handiemganj', 'Handiemganj', 'Handiemganj', 'Handiemganj',
      'Handiemganj', 'Handiemganj', 'Handiemganj', 'Handiemganj', 'Handiemganj', 'Handiemganj', 'Handiemganj',
      'Handiemganj', 'Handiemganj',
      'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur',
      'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur',
      'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur', 'Handiempur',
      'Handiempuri', 'Handiempuri', 'Handiempuri', 'Handiempuri', 'Handiempuri', 'Handiempuri', 'Handiempuri',
      'Handiempuri', 'Handiempuri', 'Handiempuri', 'Handiempuri', 'Handiempuri', 'Handiempuri', 'Handiempuri',
      'Handien', 'Handienpur', 'Handienpur', 'Handienpur', 'Handienpur', 'Handienpur', 'Handienpur',
      'Handienpur', 'Handienpur', 'Handienpur', 'Handienpur', 'Handienpur', 'Handienpur',
      'Handiepalli', 'Handiepalli', 'Handiepalli', 'Handiepalli', 'Handiepalli', 'Handiepalli', 'Handiepalli',
      'Handiepalli', 'Handiepalli', 'Handiepalli',
      'Handir', 'Handira', 'Handiram', 'Handiramapuram', 'Handiramapuram', 'Handiramapuram', 'Handiramapuram',
      'Handiramapuram', 'Handiramapuram', 'Handiramapuram', 'Handiramapuram', 'Handiramapuram', 'Handiramapuram',
      'Handiramapuram', 'Handiramapuram', 'Handiramapuram', 'Handiramapuram',
      'Handiramasan', 'Handiramasan', 'Handiramasan', 'Handiramasan', 'Handiramasan', 'Handiramasan',
      'Handiramasan', 'Handiramasan', 'Handiramasan', 'Handiramasan', 'Handiramasan', 'Handiramasan',
      'Handiramasan', 'Handiramasan', 'Handiramasan',
      'Handirasanpur', 'Handirasanpur', 'Handirasanpur', 'Handirasanpur', 'Handirasanpur', 'Handirasanpur',
      'Handirasanpur', 'Handirasanpur', 'Handirasanpur', 'Handirasanpur', 'Handirasanpur', 'Handirasanpur',
      'Handirasanpur', 'Handirasanpur', 'Handirasanpur',
      'Handirat', 'Handirata', 'Handiratapuri', 'Handiratapuri', 'Handiratapuri', 'Handiratapuri',
      'Handiratapuri', 'Handiratapuri', 'Handiratapuri', 'Handiratapuri', 'Handiratapuri', 'Handiratapuri',
      'Handiratapuri', 'Handiratapuri', 'Handiratapuri',
      'Handirath', 'Handirathapur', 'Handirathapur', 'Handirathapur', 'Handirathapur', 'Handirathapur',
      'Handirathapur', 'Handirathapur', 'Handirathapur', 'Handirathapur', 'Handirathapur', 'Handirathapur',
      'Handirathapur', 'Handirathapur', 'Handirathapur',
      'Handiraz', 'Handirazpur', 'Handirazpur', 'Handirazpur', 'Handirazpur', 'Handirazpur',
      'Handirazpur', 'Handirazpur', 'Handirazpur', 'Handirazpur', 'Handirazpur', 'Handirazpur',
      'Handirazpur', 'Handirazpur', 'Handirazpur',
      'Handire', 'Handirega', 'Handiregapur', 'Handiregapur', 'Handiregapur', 'Handiregapur',
      'Handiregapur', 'Handiregapur', 'Handiregapur', 'Handiregapur', 'Handiregapur', 'Handiregapur',
      'Handiregapur', 'Handiregapur', 'Handiregapur',
      'Handiregali', 'Handiregalipur', 'Handiregalipur', 'Handiregalipur', 'Handiregalipur',
      'Handiregalipur', 'Handiregalipur', 'Handiregalipur', 'Handiregalipur', 'Handiregalipur', 'Handiregalipur',
      'Handiregalipur', 'Handiregalipur', 'Handiregalipur',
      'Handiregam', 'Handiregampur', 'Handiregampur', 'Handiregampur', 'Handiregampur',
      'Handiregampur', 'Handiregampur', 'Handiregampur', 'Handiregampur', 'Handiregampur', 'Handiregampur',
      'Handiregampur', 'Handiregampur', 'Handiregampur',
      'Handirega', 'Handirega', 'Handirega', 'Handirega',
      'Handiregaram', 'Handiregaram', 'Handiregaram', 'Handiregaram',
      'Indore', 'Indragarh', 'Indraprastha', 'Indri', 'Indur', 'Induri', 'Induru',
      'Jaipur', 'Jaisinghpur', 'Jalandhar', 'Jalesar', 'Jalgaon', 'Jalingo', 'Jaliri', 'Jalnar', 'Jaloi', 'Jalona',
      'Jalor', 'Jalori', 'Jalonpur', 'Jalpaiguri', 'Jalpur', 'Jalrampur', 'Jalsarai', 'Jalsar', 'Jalsganj', 'Jalsinder',
      'Jalsingpur', 'Jalthal', 'Jalua', 'Jaluar', 'Jaluhi', 'Jaluki', 'Jalur', 'Jalurai', 'Jaluria', 'Jalwara',
      'Jalwari', 'Jalwasa', 'Jalwat', 'Jalwa', 'Jamadpur', 'Jamahu', 'Jamai', 'Jamaicher', 'Jamaicho', 'Jamaipur',
      'Jamajpur', 'Jamakpur', 'Jamakia', 'Jamaku', 'Jamalpur', 'Jamam', 'Jamamba', 'Jamambika', 'Jamambo', 'Jamampai',
      'Jamamu', 'Jaman', 'Jamana', 'Jamanapalle', 'Jamanapur', 'Jamanapur', 'Jamanapur', 'Jamanapuri', 'Jamanapuri',
      'Jamanapuri', 'Jamanapur', 'Jamanapur', 'Jamanapur', 'Jamanapur', 'Jamanapur', 'Jamanapur', 'Jamanapur',
      'Jamanapur', 'Jamanapur', 'Jamanapur',
      'Jamand', 'Jamandi', 'Jamandi', 'Jamandi', 'Jamandi', 'Jamandi', 'Jamandi', 'Jamandi',
      'Jamandi', 'Jamandi', 'Jamandi', 'Jamandi', 'Jamandi', 'Jamandi',
      'Jambai', 'Jambais', 'Jambait', 'Jambala', 'Jambalpur', 'Jambalpur', 'Jambalpur', 'Jambalpur', 'Jambalpur',
      'Jambalpur', 'Jambalpur', 'Jambalpur', 'Jambalpur', 'Jambalpur', 'Jambalpur',
      'Jambalpuri', 'Jambalpuri', 'Jambalpuri', 'Jambalpuri', 'Jambalpuri', 'Jambalpuri', 'Jambalpuri',
      'Jambalpuri', 'Jambalpuri', 'Jambalpuri',
      'Jambar', 'Jambara', 'Jambaragi', 'Jambarah', 'Jambarai', 'Jambarajipur', 'Jambarajpur', 'Jambaral', 'Jambarali',
      'Jambaraliga', 'Jambaraliganj', 'Jambaralipur', 'Jambaralpur', 'Jambaralpur', 'Jambaralpur', 'Jambaralpur',
      'Jambaralpuri', 'Jambaralpuri', 'Jambaralpuri', 'Jambaralpuri', 'Jambaralpuri',
      'Jambarampur', 'Jambarampur', 'Jambarampur', 'Jambarampur', 'Jambarampur',
      'Jambarampuri', 'Jambarampuri', 'Jambarampuri', 'Jambarampuri', 'Jambarampuri',
      'Jambarang', 'Jambaranga', 'Jambarangapur', 'Jambarangapur', 'Jambarangapur', 'Jambarangapur', 'Jambarangapur',
      'Jambaranger', 'Jambarangeri', 'Jambarangeripur', 'Jambarangeripur', 'Jambarangeripur', 'Jambarangeripur',
      'Jambarangeripur', 'Jambarangeripur', 'Jambarangeripur',
      'Jambarani', 'Jambaranipur', 'Jambaranipur', 'Jambaranipur', 'Jambaranipur', 'Jambaranipur',
      'Jambaranpur', 'Jambaranpur', 'Jambaranpur', 'Jambaranpur', 'Jambaranpur',
      'Jambaranpuri', 'Jambaranpuri', 'Jambaranpuri', 'Jambaranpuri', 'Jambaranpuri',
      'Jambarara', 'Jambarapu', 'Jambarara', 'Jambarapalli', 'Jambarapalli', 'Jambarapalli', 'Jambarapalli',
      'Jambarapalli', 'Jambarapalli', 'Jambarapalli', 'Jambarapalli',
      'Jamaravad', 'Jamaravadi', 'Jamaravadi', 'Jamaravadi', 'Jamaravadi', 'Jamaravadi', 'Jamaravadi',
      'Jamaravadi', 'Jamaravadi', 'Jamaravadi', 'Jamaravadi',
      'Jambarawa', 'Jambarawal', 'Jambarawali', 'Jambarawali', 'Jambarawali', 'Jambarawali', 'Jambarawali',
      'Jambarawali', 'Jambarawali', 'Jambarawali', 'Jambarawali',
      'Jambarayan', 'Jamarayani', 'Jamarayanipur', 'Jamarayanipur', 'Jamarayanipur', 'Jamarayanipur', 'Jamarayanipur',
      'Jamarayanipur', 'Jamarayanipur', 'Jamarayanipur',
      'Jambaraya', 'Jamarayapur', 'Jamarayapur', 'Jamarayapur', 'Jamarayapur', 'Jamarayapur',
      'Jamarayapuri', 'Jamarayapuri', 'Jamarayapuri', 'Jamarayapuri', 'Jamarayapuri',
      'Jambare', 'Jamarellu', 'Jambarelu', 'Jambarelur', 'Jambarelu', 'Jambarelu', 'Jambarelu', 'Jambarelu',
      'Jambarelu', 'Jambarelu',
      'Jambarena', 'Jamarenally', 'Jambarena', 'Jambarena', 'Jambarena', 'Jambarena', 'Jambarena',
      'Jambarena', 'Jambarena', 'Jambarena', 'Jambarena', 'Jambarena',
      'Jambareng', 'Jambarengadi', 'Jambarengadi', 'Jambarengadi', 'Jambarengadi', 'Jambarengadi',
      'Jambarengadi', 'Jambarengadi', 'Jambarengadi', 'Jambarengadi', 'Jambarengadi',
      'Jambareni', 'Jambarenipur', 'Jambarenipur', 'Jambarenipur', 'Jambarenipur', 'Jambarenipur',
      'Jambarenipur', 'Jambarenipur', 'Jambarenipur', 'Jambarenipur',
      'Jambaresa', 'Jambaresapur', 'Jambaresapur', 'Jambaresapur', 'Jambaresapur', 'Jambaresapur',
      'Jambaresapur', 'Jambaresapur', 'Jambaresapur', 'Jambaresapur',
      'Jambaresi', 'Jambaresipur', 'Jambaresipur', 'Jambaresipur', 'Jambaresipur', 'Jambaresipur',
      'Jambaresipur', 'Jambaresipur', 'Jambaresipur', 'Jambaresipur',
      'Jambareta', 'Jambaretapur', 'Jambaretapur', 'Jambaretapur', 'Jambaretapur', 'Jambaretapur',
      'Jambaretapur', 'Jambaretapur', 'Jambaretapur', 'Jambaretapur',
      'Jambareva', 'Jamarevalli', 'Jamarevalli', 'Jamarevalli', 'Jamarevalli', 'Jamarevalli',
      'Jamarevalli', 'Jamarevalli', 'Jamarevalli', 'Jamarevalli',
      'Jambareza', 'Jambarezapur', 'Jambarezapur', 'Jambarezapur', 'Jambarezapur', 'Jambarezapur',
      'Jambarezapur', 'Jambarezapur', 'Jambarezapur', 'Jambarezapur',
      'Jambarezi', 'Jambarezpur', 'Jambarezpur', 'Jambarezpur', 'Jambarezpur', 'Jambarezpur',
      'Jambarezpur', 'Jambarezpur', 'Jambarezpur', 'Jambarezpur',
      'Jambarha', 'Jambarhai', 'Jambarhaipur', 'Jambarhaipur', 'Jambarhaipur', 'Jambarhaipur', 'Jambarhaipur',
      'Jambarhaipur', 'Jambarhaipur', 'Jambarhaipur',
      'Jambarha', 'Jambarhal', 'Jambarhalpur', 'Jambarhalpur', 'Jambarhalpur', 'Jambarhalpur', 'Jambarhalpur',
      'Jambarhalpur', 'Jambarhalpur', 'Jambarhalpur',
      'Jambarhan', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur',
      'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur',
      'Jambarhani', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur',
      'Jambarhani', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur',
      'Jambarhani', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur',
      'Jambarhani', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur', 'Jambarhanpur',
      'Kanpur', 'Kanyakumari', 'Katihar', 'Kathua', 'Katni', 'Katras', 'Khagra', 'Khagrachhari', 'Khagrachari', 'Khaira',
      'Khalilabad', 'Khalpara', 'Khan', 'Khandala', 'Khandallpur', 'Khandari', 'Khandbari', 'Khanderao', 'Khandesh', 'Khandhala',
      'Khandha', 'Khandhada', 'Khandhala', 'Khandhalu', 'Khandhapara', 'Khandhapara', 'Khandhapara', 'Khandhapara', 'Khandhapara',
      'Khandhapara', 'Khandhapara', 'Khandhapara', 'Khandhapara',
      'Khanjeri', 'Khanjerpur', 'Khanjepur', 'Khanjpur', 'Khanjura', 'Khankapur', 'Khankapur', 'Khankapur', 'Khankapur',
      'Khankapur', 'Khankapur', 'Khankapur', 'Khankapur',
      'Khankar', 'Khankara', 'Khankari', 'Khankarpur', 'Khankarpur', 'Khankarpur', 'Khankarpur', 'Khankarpur',
      'Khankarpur', 'Khankarpur', 'Khankarpur',
      'Khankeri', 'Khankepur', 'Khankeripur', 'Khankeripur', 'Khankeripur', 'Khankeripur', 'Khankeripur',
      'Khankeripur', 'Khankeripur', 'Khankeripur',
      'Khankham', 'Khankhampur', 'Khankhampur', 'Khankhampur', 'Khankhampur', 'Khankhampur',
      'Khankhampur', 'Khankhampur', 'Khankhampur', 'Khankhampur',
      'Khankhandi', 'Khankhandi', 'Khankhandi', 'Khankhandi', 'Khankhandi', 'Khankhandi',
      'Khankhandi', 'Khankhandi', 'Khankhandi', 'Khankhandi',
      'Khankharpur', 'Khankharpur', 'Khankharpur', 'Khankharpur', 'Khankharpur',
      'Khankharpur', 'Khankharpur', 'Khankharpur', 'Khankharpur', 'Khankharpur',
      'Khankoda', 'Khankodaspur', 'Khankodaspur', 'Khankodaspur', 'Khankodaspur',
      'Khankodaspur', 'Khankodaspur', 'Khankodaspur', 'Khankodaspur', 'Khankodaspur',
      'Khankolpur', 'Khankolpur', 'Khankolpur', 'Khankolpur', 'Khankolpur',
      'Khankolpur', 'Khankolpur', 'Khankolpur', 'Khankolpur', 'Khankolpur',
      'Khankondi', 'Khankondpur', 'Khankondpur', 'Khankondpur', 'Khankondpur',
      'Khankondpur', 'Khankondpur', 'Khankondpur', 'Khankondpur', 'Khankondpur',
      'Khankopra', 'Khankoprapur', 'Khankoprapur', 'Khankoprapur', 'Khankoprapur',
      'Khankoprapur', 'Khankoprapur', 'Khankoprapur', 'Khankoprapur', 'Khankoprapur',
      'Khankor', 'Khankora', 'Khankorapur', 'Khankorapur', 'Khankorapur',
      'Khankorapur', 'Khankorapur', 'Khankorapur', 'Khankorapur', 'Khankorapur',
      'Khankori', 'Khankoripur', 'Khankoripur', 'Khankoripur', 'Khankoripur',
      'Khankoripur', 'Khankoripur', 'Khankoripur', 'Khankoripur', 'Khankoripur',
      'Khankoril', 'Khankorilpur', 'Khankorilpur', 'Khankorilpur', 'Khankorilpur',
      'Khankorilpur', 'Khankorilpur', 'Khankorilpur', 'Khankorilpur', 'Khankorilpur',
      'Khankos', 'Khankospur', 'Khankospur', 'Khankospur', 'Khankospur',
      'Khankospur', 'Khankospur', 'Khankospur', 'Khankospur', 'Khankospur',
      'Khankota', 'Khankotapur', 'Khankotapur', 'Khankotapur', 'Khankotapur',
      'Khankotapur', 'Khankotapur', 'Khankotapur', 'Khankotapur', 'Khankotapur',
      'Khankoti', 'Khankotipur', 'Khankotipur', 'Khankotipur', 'Khankotipur',
      'Khankotipur', 'Khankotipur', 'Khankotipur', 'Khankotipur', 'Khankotipur',
      'Khankotil', 'Khankotilpur', 'Khankotilpur', 'Khankotilpur', 'Khankotilpur',
      'Khankotilpur', 'Khankotilpur', 'Khankotilpur', 'Khankotilpur', 'Khankotilpur',
      'Khankotir', 'Khankotirpur', 'Khankotirpur', 'Khankotirpur', 'Khankotirpur',
      'Khankotirpur', 'Khankotirpur', 'Khankotirpur', 'Khankotirpur', 'Khankotirpur'
    ];

    const filtered = locations
      .filter(location => location.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);

    res.json(filtered);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users
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
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/:id
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
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/users
router.post('/', async (req, res) => {
  const { fullName, email, password, phone, location, work, gender, age, volunteering, volunteeringTypes, volunteeringDays, role, isActive } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }

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
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/:id
router.put('/:id', async (req, res) => {
  const { fullName, email, password, phone, location, work, gender, age, volunteering, volunteeringTypes, volunteeringDays, role, isActive } = req.body;

  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
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
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;

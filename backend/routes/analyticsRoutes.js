import express from 'express';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// Helper function to calculate average resolution time
const calculateAverageResolutionTime = (complaints) => {
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved' && c.createdAt && c.updatedAt);
  if (resolvedComplaints.length === 0) return 0;

  const totalResolutionDays = resolvedComplaints.reduce((sum, c) => {
    const created = new Date(c.createdAt);
    const updated = new Date(c.updatedAt);
    const diffTime = Math.abs(updated - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);

  return totalResolutionDays / resolvedComplaints.length;
};

// @route   GET /api/analytics
// @desc    Get various analytics data for the dashboard
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const [
      totalUsers,
      totalComplaints,
      pendingComplaints,
      totalFeedbacks,
      complaintsByCategory,
      complaintsByStatus,
      feedbacksByCategory,
      usersByRole,
      allComplaints,
      allFeedbacks
    ] = await Promise.all([
      User.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Feedback.countDocuments(),
      Complaint.aggregate([
        { $unwind: "$category" },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { category: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ]),
      Complaint.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { status: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ]),
      Feedback.aggregate([
        { $group: { _id: "$feedback_type", count: { $sum: 1 } } },
        { $project: { category: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $project: { role: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ]),
      Complaint.find({}),
      Feedback.find({})
    ]);

    const avgResolutionTime = calculateAverageResolutionTime(allComplaints);

    // Resolution time trend
    const resolutionTimeTrend = {};
    allComplaints
      .filter(c => c.status === 'Resolved' && c.createdAt && c.updatedAt)
      .forEach(c => {
        const created = new Date(c.createdAt);
        const updated = new Date(c.updatedAt);
        const diffTime = Math.abs(updated - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const monthYear = `${updated.toLocaleString('en-US', { month: 'short' })}-${updated.getFullYear().toString().slice(-2)}`;
        if (!resolutionTimeTrend[monthYear]) {
          resolutionTimeTrend[monthYear] = { totalDays: 0, count: 0 };
        }
        resolutionTimeTrend[monthYear].totalDays += diffDays;
        resolutionTimeTrend[monthYear].count += 1;
      });

    const resolutionTrendData = Object.keys(resolutionTimeTrend).map(key => ({
      period: key,
      avgDays: resolutionTimeTrend[key].totalDays / resolutionTimeTrend[key].count,
    })).sort((a, b) => {
      const dateA = new Date(`01-${a.period.replace('-', ' 20')}`);
      const dateB = new Date(`01-${b.period.replace('-', ' 20')}`);
      return dateA - dateB;
    });

    res.json({
      totalUsers,
      totalComplaints,
      pendingComplaints,
      totalFeedbacks,
      avgResolutionTime,
      complaintsByCategory: complaintsByCategory.map(item => ({ name: item.category, count: item.count })),
      complaintsByStatus: complaintsByStatus.map(item => ({ status: item.status, count: item.count })),
      feedbacksByCategory: feedbacksByCategory.map(item => ({ category: item.category, count: item.count })),
      usersByRole: usersByRole.map(item => ({ role: item.role, count: item.count })),
      resolutionTimeTrend: resolutionTrendData,
      allFeedbacks: allFeedbacks.map(f => ({
        _id: f._id,
        full_name: f.full_name,
        email: f.email,
        rating: f.rating,
        experience_rating: f.experience_rating,
        feedback_type: f.feedback_type,
        location: f.location,
        createdAt: f.createdAt
      }))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;

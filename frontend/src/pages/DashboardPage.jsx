import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ComplaintCategoryChart from '../components/charts/ComplaintCategoryChart.jsx';
import ComplaintStatusChart from '../components/charts/ComplaintStatusChart.jsx';
import ResolutionTimeChart from '../components/charts/ResolutionTimeChart.jsx';
import UsersByRoleChart from '../components/charts/UsersByRoleChart.jsx';
import FeedbackRatioChart from '../components/charts/FeedbackRatioChart.jsx';
import FeedbackRatingStatsChart from '../components/charts/FeedbackRatingStatsChart.jsx';
import { getAnalytics, getUsers } from '../utils/api.js';

const DashboardPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analytics, users] = await Promise.all([
          getAnalytics(),
          getUsers()
        ]);
        console.log('Analytics Data:', analytics);
        console.log('All Users:', users);
        setAnalyticsData(analytics);
        setAllUsers(users || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner className="h-10 w-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600">
        <p>Error loading dashboard data: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-3 md:py-6 px-2 md:px-0">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card>
          <p className="text-xs md:text-sm font-medium text-gray-500">Total Users</p>
          <p className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">{analyticsData.totalUsers}</p>
        </Card>
        <Card>
          <p className="text-xs md:text-sm font-medium text-gray-500">Total Complaints</p>
          <p className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">{analyticsData.totalComplaints}</p>
        </Card>
        <Card>
          <p className="text-xs md:text-sm font-medium text-gray-500">Pending Complaints</p>
          <p className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">{analyticsData.pendingComplaints}</p>
        </Card>
        <Card>
          <p className="text-xs md:text-sm font-medium text-gray-500">Total Feedbacks</p>
          <p className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">{analyticsData.totalFeedbacks || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <ComplaintCategoryChart data={analyticsData.complaintsByCategory} />
        <FeedbackRatioChart 
          totalFeedbacks={analyticsData.totalFeedbacks || 0} 
          data={analyticsData.feedbacksByCategory || []} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <ComplaintStatusChart data={analyticsData.complaintsByStatus} />
        <FeedbackRatingStatsChart 
          totalFeedbacks={analyticsData.totalFeedbacks || 0} 
          data={analyticsData.allFeedbacks || []} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ResolutionTimeChart data={analyticsData.resolutionTimeTrend} />
        <UsersByRoleChart data={analyticsData.usersByRole} />
      </div>

      {/* All Users Table */}
      <div className="mt-6 md:mt-8">
        <Card title="All Users">
          {allUsers.length === 0 ? (
            <p className="text-gray-500 text-center">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">{user.fullName}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 hidden sm:table-cell">{user.email}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 capitalize hidden md:table-cell">{user.role}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

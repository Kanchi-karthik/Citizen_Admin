import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import InputField from '../../components/common/InputField.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import FeedbackDetailModal from './FeedbackDetailModal.jsx';
import { getFeedbacks } from '../../utils/api.js';
import { formatDate, convertToCSV, downloadCSV } from '../../utils/helpers.js';
import { FEEDBACK_TYPES, FEEDBACK_CATEGORIES } from '../../constants.js';
import * as LucideIcons from 'lucide-react';

const FeedbackManagementPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', feedbackType: '', rating: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbacksPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFeedbacks(filters);
      setFeedbacks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFeedbacks]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', feedbackType: '', rating: '' });
    setCurrentPage(1);
  };

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      'Feedback ID', 'Complaint ID', 'User ID', 'Full Name', 'Email', 'Feedback Type',
      'Reference ID', 'Rating (1-5)', 'Experience Rating (0-100)', 'Detailed Feedback',
      'Feedback Categories', 'Attachment URL', 'Experience Date', 'Location',
      'Follow Up', 'Suggestions', 'Created At'
    ];
    const csvData = feedbacks.map(feedback => ({
      'Feedback ID': feedback._id, // Assuming _id is used as PK for export
      'Complaint ID': feedback.complaint_id,
      'User ID': feedback.user_id,
      'Full Name': feedback.full_name,
      'Email': feedback.email,
      'Feedback Type': feedback.feedback_type,
      'Reference ID': feedback.reference_id,
      'Rating (1-5)': feedback.rating,
      'Experience Rating (0-100)': feedback.experience_rating,
      'Detailed Feedback': feedback.detailed_feedback,
      'Feedback Categories': feedback.feedback_categories ? feedback.feedback_categories.join(', ') : '',
      'Attachment URL': feedback.attachment_url,
      'Experience Date': formatDate(feedback.experience_date),
      'Location': feedback.location,
      'Follow Up': feedback.follow_up ? 'Yes' : 'No',
      'Suggestions': feedback.suggestions,
      'Created At': formatDate(feedback.createdAt),
    }));
    const csvString = convertToCSV(csvData, csvHeaders);
    downloadCSV(csvString, 'feedbacks_report.csv');
  };

  // Pagination logic
  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
  const totalPages = Math.ceil(feedbacks.length / feedbacksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Feedback Management</h2>

      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Feedback Filters</h3>
          <Button onClick={handleExportCSV} variant="outline">Export CSV</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by feedback text, name, email"
          />
          <InputField
            label="Feedback Type"
            name="feedbackType"
            type="select"
            value={filters.feedbackType}
            onChange={handleFilterChange}
            options={[{ label: 'All Types', value: '' }, ...FEEDBACK_TYPES.map(type => ({ label: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), value: type }))]}
          />
          <InputField
            label="Min Rating"
            name="rating"
            type="select"
            value={filters.rating}
            onChange={handleFilterChange}
            options={[
              { label: 'All Ratings', value: '' },
              { label: '1 Star & Up', value: '1' },
              { label: '2 Stars & Up', value: '2' },
              { label: '3 Stars & Up', value: '3' },
              { label: '4 Stars & Up', value: '4' },
              { label: '5 Stars', value: '5' },
            ]}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleClearFilters} variant="secondary">Clear Filters</Button>
        </div>
      </Card>

      <Card title="All Feedback Submissions">
        {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : feedbacks.length === 0 ? (
          <p className="text-gray-500 text-center">No feedback found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User/Complaint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentFeedbacks.map((feedback) => (
                    <tr key={feedback._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {feedback.full_name} ({feedback.complaint_id ? `Complaint: ${feedback.complaint_id.slice(-6)}` : 'N/A'})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {feedback.feedback_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{feedback.rating}/5</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{feedback.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(feedback.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button onClick={() => handleViewDetails(feedback)} variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstFeedback + 1}</span> to <span className="font-medium">{Math.min(indexOfLastFeedback, feedbacks.length)}</span> of <span className="font-medium">{feedbacks.length}</span> results
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="rounded-l-md"
                >Previous</Button>
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    variant={currentPage === index + 1 ? 'primary' : 'outline'}
                    size="sm"
                    className={`${currentPage === index + 1 ? 'z-10 bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="rounded-r-md"
                >Next</Button>
              </nav>
            </div>
          </>
        )}
      </Card>

      {/* Feedback Detail Modal */}
      <FeedbackDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        feedback={selectedFeedback}
      />
    </div>
  );
};

export default FeedbackManagementPage;

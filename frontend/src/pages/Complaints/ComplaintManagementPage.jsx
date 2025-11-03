import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import InputField from '../../components/common/InputField.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import ComplaintDetailModal from './ComplaintDetailModal.jsx';
import { getComplaints, updateComplaint } from '../../utils/api.js';
import { formatDate, convertToCSV, downloadCSV } from '../../utils/helpers.js';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../../constants.js';

const ComplaintManagementPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [complaintsPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getComplaints(filters);
      // Ensure status 'Closed' is available for admin view even if not in DB enum default
      const processedData = data.map(complaint => ({
        ...complaint,
        status: complaint.status === 'Resolved' && complaint.isClosed ? 'Closed' : complaint.status,
      }));
      setComplaints(processedData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchComplaints]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', category: '', status: '' });
    setCurrentPage(1);
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      let updatePayload = { status: newStatus };
      if (newStatus === 'Closed') {
        updatePayload = { status: 'Resolved', isClosed: true };
      } else if (newStatus !== 'Closed' && selectedComplaint.isClosed) {
        updatePayload = { status: newStatus, isClosed: false };
      }
      
      await updateComplaint(complaintId, updatePayload);
      fetchComplaints();
      setSelectedComplaint(prev => ({ ...prev, status: newStatus, isClosed: newStatus === 'Closed' }));
      alert('Complaint status updated successfully!');
    } catch (err) {
      setError(`Failed to update complaint status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      'Complaint ID', 'Title', 'Description', 'Category', 'Type', 'Area Type',
      'Days Active', 'Location', 'Status', 'Image URL', 'Created At', 'Last Updated'
    ];
    const csvData = complaints.map(complaint => ({
      'Complaint ID': complaint.complaintId,
      'Title': complaint.title,
      'Description': complaint.description,
      'Category': Array.isArray(complaint.category) ? complaint.category.join(', ') : complaint.category,
      'Type': complaint.complaintType,
      'Area Type': complaint.areaType,
      'Days Active': complaint.days,
      'Location': complaint.location,
      'Status': complaint.status,
      'Image URL': complaint.image,
      'Created At': formatDate(complaint.createdAt),
      'Last Updated': formatDate(complaint.updatedAt),
    }));
    const csvString = convertToCSV(csvData, csvHeaders);
    downloadCSV(csvString, 'complaints_report.csv');
  };

  // Pagination logic
  const indexOfLastComplaint = currentPage * complaintsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - complaintsPerPage;
  const currentComplaints = complaints.slice(indexOfFirstComplaint, indexOfLastComplaint);
  const totalPages = Math.ceil(complaints.length / complaintsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Complaint Management</h2>

      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Complaint Filters</h3>
          <Button onClick={handleExportCSV} variant="outline">Export CSV</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by title or description"
          />
          <InputField
            label="Category"
            name="category"
            type="select"
            value={filters.category}
            onChange={handleFilterChange}
            options={[{ label: 'All Categories', value: '' }, ...COMPLAINT_CATEGORIES.map(cat => ({ label: cat, value: cat }))]}
          />
          <InputField
            label="Status"
            name="status"
            type="select"
            value={filters.status}
            onChange={handleFilterChange}
            options={[
              { label: 'All Statuses', value: '' },
              ...COMPLAINT_STATUSES.map(status => ({ label: status, value: status.toLowerCase().replace(' ', '-') }))
            ]}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleClearFilters} variant="secondary">Clear Filters</Button>
        </div>
      </Card>

      <Card title="All Complaints">
        {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-gray-500 text-center">No complaints found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentComplaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.complaintId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Array.isArray(complaint.category) ? complaint.category.join(', ') : complaint.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(complaint.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button onClick={() => handleViewDetails(complaint)} variant="ghost" size="sm">View/Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstComplaint + 1}</span> to <span className="font-medium">{Math.min(indexOfLastComplaint, complaints.length)}</span> of <span className="font-medium">{complaints.length}</span> results
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

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        complaint={selectedComplaint}
        onUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={isUpdatingStatus}
      />
    </div>
  );
};

export default ComplaintManagementPage;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import InputField from '../../components/common/InputField.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import { getUsers, updateUser, deleteUser } from '../../utils/api.js';
import { formatDate, convertToCSV, downloadCSV } from '../../utils/helpers.js';
import { USER_ROLES } from '../../constants.js';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(filters);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUsers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setFilters({ search: '', role: '', status: '' });
    setCurrentPage(1);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsUpdatingUser(true);
    try {
      // Permanently delete user from database
      await deleteUser(userToDelete._id);
      fetchUsers(); // Refresh list
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError(`Failed to delete user: ${err.message}`);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    setIsUpdatingUser(true);
    try {
      await updateUser(user._id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      setError(`Failed to update user status: ${err.message}`);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      'User ID', 'Full Name', 'Email', 'Phone', 'Location', 'Work', 'Gender', 'Age',
      'Volunteering', 'Volunteering Types', 'Volunteering Days', 'Role', 'Status', 'Registered At'
    ];
    const csvData = users.map(user => ({
      'User ID': user.userId,
      'Full Name': user.fullName,
      'Email': user.email,
      'Phone': user.phone,
      'Location': user.location,
      'Work': user.work,
      'Gender': user.gender,
      'Age': user.age,
      'Volunteering': user.volunteering,
      'Volunteering Types': user.volunteeringTypes ? user.volunteeringTypes.join(', ') : '',
      'Volunteering Days': user.volunteeringDays,
      'Role': user.role,
      'Status': user.isActive ? 'Active' : 'Inactive',
      'Registered At': formatDate(user.createdAt),
    }));
    const csvString = convertToCSV(csvData, csvHeaders);
    downloadCSV(csvString, 'users_report.csv');
  };


  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <div className="container mx-auto py-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Management</h2>

      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">User Filters</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => navigate('/users/new')} variant="primary" size="sm" className="md:size-auto">Add New User</Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="md:size-auto">Export CSV</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <InputField
            label="Search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name or email"
          />
          <InputField
            label="Role"
            name="role"
            type="select"
            value={filters.role}
            onChange={handleFilterChange}
            options={[{ label: 'All Roles', value: '' }, ...USER_ROLES.map(role => ({ label: role.charAt(0).toUpperCase() + role.slice(1), value: role }))]}
          />
          <InputField
            label="Status"
            name="status"
            type="select"
            value={filters.status}
            onChange={handleFilterChange}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleClearFilters} variant="secondary">Clear Filters</Button>
        </div>
      </Card>

      <Card title="All Users">
        {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-center">No users found.</p>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">User ID</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Role</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Registered At</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">{user.fullName}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 hidden sm:table-cell">{user.email}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 hidden md:table-cell">{user.userId}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 capitalize hidden lg:table-cell">{user.role}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">{formatDate(user.createdAt)}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                        <div className="flex justify-end gap-1 md:gap-2 flex-wrap">
                          <Button onClick={() => handleViewDetails(user)} variant="ghost" size="sm" className="hidden md:inline-flex">View</Button>
                          <Button onClick={() => navigate(`/users/edit/${user._id}`)} variant="ghost" size="sm">Edit</Button>
                          <Button
                            onClick={() => handleToggleUserStatus(user)}
                            variant={user.isActive ? 'danger' : 'primary'}
                            size="sm"
                            loading={isUpdatingUser}
                            className="hidden md:inline-flex"
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button onClick={() => handleDeleteClick(user)} variant="danger" size="sm" className="hidden md:inline-flex">Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to <span className="font-medium">{Math.min(indexOfLastUser, users.length)}</span> of <span className="font-medium">{users.length}</span> results
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

      {/* User Details Modal */}
      <Modal
        isOpen={showUserDetailsModal}
        onClose={() => setShowUserDetailsModal(false)}
        title="User Details"
      >
        {selectedUser && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">User ID</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.userId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Work</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.work || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Age</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.age || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Volunteering</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.volunteering || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Volunteering Types</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.volunteeringTypes && selectedUser.volunteeringTypes.length > 0 ? selectedUser.volunteeringTypes.join(', ') : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Volunteering Days</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.volunteeringDays || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="mt-1 text-sm text-gray-900 capitalize">{selectedUser.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="mt-1 text-sm text-gray-900">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
            </div>
            {selectedUser.profile_pic && (
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-500">Profile Picture</p>
                <img src={selectedUser.profile_pic} alt="Profile" className="mt-2 w-32 h-32 object-cover rounded-full shadow" />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        <p className="text-gray-700 mb-4">Are you sure you want to delete user <span className="font-semibold">{userToDelete?.fullName}</span>? This action cannot be undone.</p>
        <p className="text-sm text-red-600 mb-4">The user and all their data will be permanently removed from the database.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} loading={isUpdatingUser}>Delete Permanently</Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;

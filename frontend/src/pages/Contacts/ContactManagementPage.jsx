import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import InputField from '../../components/common/InputField.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ContactDetailModal from './ContactDetailModal.jsx';
import { getContacts } from '../../utils/api.js';
import { formatDate, convertToCSV, downloadCSV } from '../../utils/helpers.js';
import * as LucideIcons from 'lucide-react';

const ContactManagementPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getContacts(filters);
      setContacts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchContacts]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: '' });
    setCurrentPage(1);
  };

  const handleViewDetails = (contact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      'Contact ID', 'User ID', 'Subject', 'Message', 'Created At'
    ];
    const csvData = contacts.map(contact => ({
      'Contact ID': contact._id,
      'User ID': contact.user_id,
      'Subject': contact.subject,
      'Message': contact.message,
      'Created At': formatDate(contact.createdAt),
    }));
    const csvString = convertToCSV(csvData, csvHeaders);
    downloadCSV(csvString, 'contacts_report.csv');
  };

  // Pagination logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(contacts.length / contactsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const ArrowLeftIcon = LucideIcons.ArrowLeft;
  const ArrowRightIcon = LucideIcons.ArrowRight;
  const FileDownIcon = LucideIcons.FileDown;
  const EyeIcon = LucideIcons.Eye;
  const RefreshCcwIcon = LucideIcons.RefreshCcw;

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Messages</h2>

      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Contact Filters</h3>
          <Button onClick={handleExportCSV} icon="FileDown" variant="outline">Export CSV</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by subject or message"
            className="md:col-span-2"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleClearFilters} variant="secondary" icon="RefreshCcw">Clear Filters</Button>
        </div>
      </Card>

      <Card title="All Contact Submissions">
        {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-gray-500 text-center">No contact messages found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentContacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.user_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{contact.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(contact.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button onClick={() => handleViewDetails(contact)} variant="ghost" size="sm" icon="Eye">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstContact + 1}</span> to <span className="font-medium">{Math.min(indexOfLastContact, contacts.length)}</span> of <span className="font-medium">{contacts.length}</span> results
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="rounded-l-md"
                  icon="ArrowLeft"
                />
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
                  icon="ArrowRight"
                />
              </nav>
            </div>
          </>
        )}
      </Card>

      {/* Contact Detail Modal */}
      <ContactDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        contact={selectedContact}
      />
    </div>
  );
};

export default ContactManagementPage;

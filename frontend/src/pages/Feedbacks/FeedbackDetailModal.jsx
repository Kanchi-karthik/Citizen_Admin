import React from 'react';
import Modal from '../../components/common/Modal.jsx';
import { formatDate } from '../../utils/helpers.js';

const FeedbackDetailModal = ({ isOpen, onClose, feedback }) => {
  if (!feedback) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Feedback Details" className="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500">Feedback ID</p>
          <p className="mt-1 text-sm text-gray-900">{feedback._id}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Complaint ID (if applicable)</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.complaint_id || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">User ID</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.user_id}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Full Name</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.full_name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Feedback Type</p>
          <p className="mt-1 text-sm text-gray-900">
            {feedback.feedback_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Reference ID</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.reference_id || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Rating (1-5)</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.rating}/5</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Experience Rating (0-100)</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.experience_rating}%</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Experience Date</p>
          <p className="mt-1 text-sm text-gray-900">{formatDate(feedback.experience_date)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Location</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.location}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Follow Up Required?</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.follow_up ? 'Yes' : 'No'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-gray-500">Detailed Feedback</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.detailed_feedback}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-gray-500">Feedback Categories</p>
          <p className="mt-1 text-sm text-gray-900">
            {feedback.feedback_categories && feedback.feedback_categories.length > 0
              ? feedback.feedback_categories.map(cat => cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ')
              : 'N/A'}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-gray-500">Suggestions</p>
          <p className="mt-1 text-sm text-gray-900">{feedback.suggestions || 'N/A'}</p>
        </div>
        {feedback.attachment_url && (
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Attachment</p>
            <a href={feedback.attachment_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">View Attachment</a>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-500">Submitted At</p>
          <p className="mt-1 text-sm text-gray-900">{formatDate(feedback.createdAt)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Last Updated</p>
          <p className="mt-1 text-sm text-gray-900">{formatDate(feedback.updatedAt)}</p>
        </div>
      </div>
    </Modal>
  );
};

export default FeedbackDetailModal;

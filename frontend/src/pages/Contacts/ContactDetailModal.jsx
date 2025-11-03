import React from 'react';
import Modal from '../../components/common/Modal.jsx';
import { formatDate } from '../../utils/helpers.js';

const ContactDetailModal = ({ isOpen, onClose, contact }) => {
  if (!contact) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Message Details" className="max-w-xl">
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500">Contact ID</p>
          <p className="mt-1 text-sm text-gray-900">{contact._id}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">User ID</p>
          <p className="mt-1 text-sm text-gray-900">{contact.user_id}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Subject</p>
          <p className="mt-1 text-sm text-gray-900">{contact.subject}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Message</p>
          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{contact.message}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Sent At</p>
          <p className="mt-1 text-sm text-gray-900">{formatDate(contact.createdAt)}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ContactDetailModal;

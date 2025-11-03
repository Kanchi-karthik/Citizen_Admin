import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import InputField from '../../components/common/InputField.jsx';
import { formatDate } from '../../utils/helpers.js';
import { COMPLAINT_STATUSES } from '../../constants.js';
import * as LucideIcons from 'lucide-react';

const ComplaintDetailModal = ({ isOpen, onClose, complaint, onUpdateStatus, isUpdatingStatus }) => {
  const [newStatus, setNewStatus] = useState('');
  const [formData, setFormData] = useState({
    priority: 'Medium',
    estimatedResolutionDate: '',
    resolution: '',
    tags: '',
    contactNumber: '',
    email: '',
    severity: 'Moderate',
    assignedDepartment: '',
    escalationLevel: 1,
    escalationReason: '',
    satisfactionRating: null,
    satisfactionFeedback: '',
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: '',
  });
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [resolutionMedia, setResolutionMedia] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [tooltipOpen, setTooltipOpen] = useState(null);

  const emojis = ['😀', '😂', '😍', '🎉', '👍', '❤️', '🔥', '💯', '✨', '😢', '😡', '👌', '🙏', '💪', '🤔', '😎', '🚀', '⭐', '😴', '😷'];

  useEffect(() => {
    if (complaint) {
      setNewStatus(complaint.status || '');
      setFormData({
        priority: complaint.priority || 'Medium',
        estimatedResolutionDate: complaint.estimatedResolutionDate ? complaint.estimatedResolutionDate.split('T')[0] : '',
        resolution: complaint.resolution || '',
        tags: complaint.tags ? complaint.tags.join(', ') : '',
        contactNumber: complaint.contactNumber || '',
        email: complaint.email || '',
        severity: complaint.severity || 'Moderate',
        assignedDepartment: complaint.assignedDepartment || '',
        escalationLevel: complaint.escalationLevel || 1,
        escalationReason: complaint.escalationReason || '',
        satisfactionRating: complaint.satisfactionRating || null,
        satisfactionFeedback: complaint.satisfactionFeedback || '',
        followUpRequired: complaint.followUpRequired || false,
        followUpDate: complaint.followUpDate ? complaint.followUpDate.split('T')[0] : '',
        followUpNotes: complaint.followUpNotes || '',
      });
      setChatMessages(complaint?.chatMessages || []);
    }
  }, [complaint]);

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitStatusUpdate = () => {
    if (complaint && newStatus) {
      onUpdateStatus(complaint._id, newStatus);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  const formatMessageTime = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const showChatNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        _id: Date.now().toString(),
        userName: 'Admin',
        text: newMessage,
        createdAt: new Date(),
        sender: 'admin',
        isRead: false
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      showChatNotification('✓ Message sent');

      try {
        const response = await fetch(`http://localhost:5000/api/complaints/${complaint._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatMessages: [...chatMessages, message],
          }),
        });

        if (!response.ok) {
          console.error('Failed to save chat message');
        }
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  };

  const handleResolutionMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video',
      name: file.name
    }));
    setResolutionMedia(prev => [...prev, ...newMedia]);
  };

  const handleUploadResolutionMedia = async () => {
    if (resolutionMedia.length === 0) return;

    setUploadingMedia(true);
    try {
      const formDataToSend = new FormData();
      resolutionMedia.forEach((media, idx) => {
        formDataToSend.append(`media${idx}`, media.file);
      });
      formDataToSend.append('complaintId', complaint._id);

      const response = await fetch(`http://localhost:5000/api/complaints/${complaint._id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Resolution media uploaded successfully!');
        setResolutionMedia([]);
        window.location.reload();
      } else {
        alert('Failed to upload media');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMediaFile = (idx) => {
    setResolutionMedia(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[idx].preview);
      updated.splice(idx, 1);
      return updated;
    });
  };

  const ImageIcon = LucideIcons.Image;
  const VideoIcon = LucideIcons.Video;
  const SmileIcon = LucideIcons.Smile;
  const SendIcon = LucideIcons.Send;
  const AlertIcon = LucideIcons.AlertCircle;
  const CheckIcon = LucideIcons.Check;
  const HelpIcon = LucideIcons.HelpCircle;

  if (!complaint) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complaint Details" className="max-w-4xl max-h-[90vh] overflow-y-auto">
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse z-50">
          {notificationMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'details'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'media'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Media
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'comments'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Comments ({complaint.comments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap relative ${
            activeTab === 'chat'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Chat ({chatMessages.length})
          {chatMessages.some(m => !m.isRead && m.sender === 'user') && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Complaint ID</p>
              <p className="mt-1 text-sm text-slate-900">{complaint.complaintId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Title</p>
              <p className="mt-1 text-sm text-slate-900">{complaint.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Category</p>
              <p className="mt-1 text-sm text-slate-900">{Array.isArray(complaint.category) ? complaint.category.join(', ') : complaint.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Priority</p>
              <p className={`mt-1 text-sm font-semibold px-2 inline-flex rounded ${
                complaint.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                complaint.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                complaint.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>{complaint.priority || 'Medium'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Contact Number</p>
              <p className="mt-1 text-sm text-slate-900">{complaint.contactNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Email</p>
              <p className="mt-1 text-sm text-slate-900">{complaint.email || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-slate-600">Description</p>
              <p className="mt-1 text-sm text-slate-900 bg-slate-50 p-3 rounded">{complaint.description}</p>
            </div>
            {complaint.resolution && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-slate-600">Resolution</p>
                <p className="mt-1 text-sm text-slate-900 bg-green-50 p-3 rounded">{complaint.resolution}</p>
              </div>
            )}
          </div>

          {/* Government Management Fields */}
          <div className="border-t border-slate-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-blue-600">Government Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Severity with Info Icon */}
              <div>
                <div className="flex items-center gap-2 mb-2 relative">
                  <span className="text-sm font-medium text-slate-700">Severity Level</span>
                  <button
                    type="button"
                    onClick={() => setTooltipOpen(tooltipOpen === 'severity' ? null : 'severity')}
                    className="relative"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-slate-700 text-slate-700 flex items-center justify-center text-xs font-bold hover:border-slate-800 hover:text-slate-800 cursor-help">
                      ?
                    </div>
                    {tooltipOpen === 'severity' && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 text-white text-xs rounded-lg p-3 z-50 shadow-lg">
                        <p className="font-semibold mb-1">How Serious?</p>
                        <ul className="text-left space-y-1">
                          <li><strong>Minor:</strong> Small issue</li>
                          <li><strong>Moderate:</strong> Medium issue</li>
                          <li><strong>Major:</strong> Affects many people</li>
                          <li><strong>Critical:</strong> Emergency, urgent</li>
                        </ul>
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
                      </div>
                    )}
                  </button>
                </div>
                <InputField
                  name="severity"
                  type="select"
                  value={formData.severity}
                  onChange={handleFormChange}
                  options={[
                    { label: 'Minor', value: 'Minor' },
                    { label: 'Moderate', value: 'Moderate' },
                    { label: 'Major', value: 'Major' },
                    { label: 'Critical', value: 'Critical' }
                  ]}
                />
              </div>

              {/* Department */}
              <div>
                <InputField
                  label="Assigned Department"
                  name="assignedDepartment"
                  type="select"
                  value={formData.assignedDepartment}
                  onChange={handleFormChange}
                  options={[
                    { label: 'Select Department', value: '' },
                    { label: 'Public Works', value: 'Public Works' },
                    { label: 'Sanitation', value: 'Sanitation' },
                    { label: 'Infrastructure', value: 'Infrastructure' },
                    { label: 'Healthcare', value: 'Healthcare' },
                    { label: 'Education', value: 'Education' },
                    { label: 'Police', value: 'Police' },
                    { label: 'Fire', value: 'Fire' },
                    { label: 'Water', value: 'Water' },
                    { label: 'Electricity', value: 'Electricity' },
                    { label: 'Parks', value: 'Parks' },
                    { label: 'Transportation', value: 'Transportation' },
                    { label: 'Other', value: 'Other' }
                  ]}
                />
              </div>

              {/* Escalation with Info Icon */}
              <div>
                <div className="flex items-center gap-2 mb-2 relative">
                  <span className="text-sm font-medium text-slate-700">Escalation Level</span>
                  <button
                    type="button"
                    onClick={() => setTooltipOpen(tooltipOpen === 'escalation' ? null : 'escalation')}
                    className="relative"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-slate-700 text-slate-700 flex items-center justify-center text-xs font-bold hover:border-slate-800 hover:text-slate-800 cursor-help">
                      ?
                    </div>
                    {tooltipOpen === 'escalation' && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-800 text-white text-xs rounded-lg p-3 z-50 shadow-lg">
                        <p className="font-semibold mb-1">Move to Higher Authority?</p>
                        <ul className="text-left space-y-1">
                          <li><strong>Level 1:</strong> Citizen reported (start)</li>
                          <li><strong>Level 2:</strong> Department handling</li>
                          <li><strong>Level 3:</strong> Manager approval</li>
                          <li><strong>Level 4:</strong> Director approval</li>
                        </ul>
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
                      </div>
                    )}
                  </button>
                </div>
                <InputField
                  name="escalationLevel"
                  type="select"
                  value={formData.escalationLevel}
                  onChange={handleFormChange}
                  options={[
                    { label: 'Level 1 - Citizen', value: 1 },
                    { label: 'Level 2 - Department', value: 2 },
                    { label: 'Level 3 - Manager', value: 3 },
                    { label: 'Level 4 - Director', value: 4 }
                  ]}
                />
              </div>

              {/* Escalation Reason */}
              <div>
                <InputField
                  label="Escalation Reason"
                  name="escalationReason"
                  type="text"
                  placeholder="Why was this escalated?"
                  value={formData.escalationReason}
                  onChange={handleFormChange}
                />
              </div>

              {/* Satisfaction Rating with Info Icon */}
              <div>
                <div className="flex items-center gap-2 mb-2 relative">
                  <span className="text-sm font-medium text-slate-700">Citizen Satisfaction</span>
                  <button
                    type="button"
                    onClick={() => setTooltipOpen(tooltipOpen === 'satisfaction' ? null : 'satisfaction')}
                    className="relative"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-slate-700 text-slate-700 flex items-center justify-center text-xs font-bold hover:border-slate-800 hover:text-slate-800 cursor-help">
                      ?
                    </div>
                    {tooltipOpen === 'satisfaction' && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-800 text-white text-xs rounded-lg p-3 z-50 shadow-lg">
                        <p className="font-semibold mb-1">Rate Resolution Quality</p>
                        <p className="mb-2">Is the citizen happy with how the problem was solved?</p>
                        <ul className="text-left space-y-1">
                          <li>1 = Problem not solved</li>
                          <li>2 = Only partially solved</li>
                          <li>3 = Mostly solved</li>
                          <li>4 = Solved well</li>
                          <li>5 = Excellent solution!</li>
                        </ul>
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
                      </div>
                    )}
                  </button>
                </div>
                <InputField
                  name="satisfactionRating"
                  type="select"
                  value={formData.satisfactionRating || ''}
                  onChange={handleFormChange}
                  options={[
                    { label: 'Not Yet Rated', value: '' },
                    { label: '😢 1 - Very Unhappy', value: 1 },
                    { label: '😕 2 - Unhappy', value: 2 },
                    { label: '😐 3 - Okay', value: 3 },
                    { label: '😊 4 - Happy', value: 4 },
                    { label: '😄 5 - Very Happy!', value: 5 }
                  ]}
                />
              </div>

              {/* Follow-up Checkbox with Info Icon */}
              <div className="flex items-start gap-3 pt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 relative">
                <label className="flex items-start gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    name="followUpRequired"
                    checked={formData.followUpRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">Need Follow-up Visit?</span>
                      <button
                        type="button"
                        onClick={() => setTooltipOpen(tooltipOpen === 'followup' ? null : 'followup')}
                        className="relative"
                      >
                        <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold hover:bg-slate-800 cursor-help">
                          ?
                        </div>
                        {tooltipOpen === 'followup' && (
                          <div className="absolute bottom-full left-0 mb-2 w-60 bg-slate-800 text-white text-xs rounded-lg p-3 z-50 shadow-lg">
                            <p className="font-semibold mb-1">What is a Follow-up?</p>
                            <p className="mb-2">A follow-up visit means going back to check if the problem is STILL fixed after some time.</p>
                            <p className="text-blue-300">Example: Visit road again next week to confirm the pothole is still fixed.</p>
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
                          </div>
                        )}
                      </button>
                    </div>
                    <span className="text-xs text-slate-500">Check if you need to visit citizen again to verify the problem is still fixed</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Satisfaction Feedback with Info Icon */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2 relative">
                <span className="text-sm font-medium text-slate-700">Citizen's Comments</span>
                <button
                  type="button"
                  onClick={() => setTooltipOpen(tooltipOpen === 'comments' ? null : 'comments')}
                  className="relative"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold hover:bg-slate-800 cursor-help">
                    ?
                  </div>
                  {tooltipOpen === 'comments' && (
                    <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-800 text-white text-xs rounded-lg p-3 z-50 shadow-lg">
                      <p className="font-semibold mb-1">Why Write Comments?</p>
                      <p className="mb-2">Record what the citizen said about the solution.</p>
                      <p className="text-green-300 text-left">Examples: 'Very fast service', 'Problem still exists', 'Road was fixed', 'Water working now'</p>
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
                    </div>
                  )}
                </button>
              </div>
              <textarea
                name="satisfactionFeedback"
                value={formData.satisfactionFeedback}
                onChange={handleFormChange}
                placeholder="Write what the citizen said..."
                className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              ></textarea>
            </div>

            {/* Follow-up Details - With Info Icon */}
            {formData.followUpRequired && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-semibold text-slate-800">Plan Your Follow-up Visit</h4>
                  <button
                    type="button"
                    onClick={() => setTooltipOpen(tooltipOpen === 'followupplan' ? null : 'followupplan')}
                    className="relative"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-slate-700 text-slate-700 flex items-center justify-center text-xs font-bold hover:border-slate-800 hover:text-slate-800 cursor-help">
                      ?
                    </div>
                    {tooltipOpen === 'followupplan' && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-800 text-white text-xs rounded-lg p-3 z-50 shadow-lg">
                        <p className="font-semibold mb-1">How to Plan?</p>
                        <p className="mb-2">Set a date and write what to check.</p>
                        <p className="text-amber-300 text-left">Date Example: Next Monday</p>
                        <p className="text-amber-300 text-left">Check Example: 'Verify pothole is still fixed' or 'Check water supply working'</p>
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
                      </div>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Follow-up Date</label>
                    <InputField
                      name="followUpDate"
                      type="date"
                      value={formData.followUpDate}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">What to Check?</label>
                    <textarea
                      name="followUpNotes"
                      value={formData.followUpNotes}
                      onChange={handleFormChange}
                      placeholder="Write what to check..."
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Update Section */}
          <div className="border-t border-slate-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Update Status</h3>
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <InputField
                  label="New Status"
                  name="status"
                  type="select"
                  value={newStatus}
                  onChange={handleStatusChange}
                  options={COMPLAINT_STATUSES.map(status => ({ label: status, value: status }))}
                />
              </div>
              <Button
                onClick={handleSubmitStatusUpdate}
                loading={isUpdatingStatus}
                variant="primary"
                className="w-full sm:w-auto"
              >
                Save Status
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="space-y-8">
          {/* Citizen Uploaded Media */}
          <div className="bg-slate-50 p-5 rounded-lg border-2 border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2 pb-3 border-b-2 border-slate-300">
              <ImageIcon className="h-5 w-5 text-blue-600" /> Citizen Uploaded Media
            </h3>
            
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-600 mb-3">Images ({complaint.images?.length || 0})</p>
              {complaint.images && complaint.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.images.map((image, idx) => (
                    <img key={idx} src={image} alt={`Complaint ${idx}`} className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition" />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6 bg-white rounded p-3">No images attached</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-3">Videos ({complaint.videos?.length || 0})</p>
              {complaint.videos && complaint.videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complaint.videos.map((video, idx) => (
                    <video key={idx} controls className="w-full h-64 bg-black rounded-lg shadow-md">
                      <source src={video} type="video/mp4" />
                    </video>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6 bg-white rounded p-3">No videos attached</p>
              )}
            </div>
          </div>

          {/* Admin Resolution Media */}
          <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2 pb-3 border-b-2 border-green-300">
              <VideoIcon className="h-5 w-5 text-green-600" /> Resolution Media (Admin)
            </h3>
            <p className="text-sm text-slate-600 mb-4">Upload images or videos showing the resolution/fix</p>
            
            <div className="bg-white border-2 border-dashed border-green-300 rounded-lg p-6 mb-4 text-center cursor-pointer hover:bg-green-100 transition">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                id="resolutionMedia"
                onChange={handleResolutionMediaChange}
              />
              <label htmlFor="resolutionMedia" className="cursor-pointer flex flex-col items-center">
                <svg className="h-8 w-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500">Images or Videos (PNG, JPG, MP4, etc.)</p>
              </label>
            </div>

            {resolutionMedia.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Selected Files ({resolutionMedia.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {resolutionMedia.map((media, idx) => (
                    <div key={idx} className="relative bg-white rounded-lg overflow-hidden border border-green-200">
                      {media.type === 'image' ? (
                        <img src={media.preview} alt={media.name} className="w-full h-40 object-cover" />
                      ) : (
                        <video src={media.preview} className="w-full h-40 bg-black object-cover" />
                      )}
                      <button
                        onClick={() => removeMediaFile(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ✕
                      </button>
                      <p className="text-xs text-slate-600 p-2 truncate bg-slate-50">{media.name}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={handleUploadResolutionMedia}
                    loading={uploadingMedia}
                    variant="primary"
                  >
                    Upload Media
                  </Button>
                  <Button
                    onClick={() => setResolutionMedia([])}
                    variant="secondary"
                    disabled={uploadingMedia}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {resolutionMedia.length === 0 && (
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                <p className="text-slate-500 text-sm">No resolution media selected. Click above to upload.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">Add Comment</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            ></textarea>
            <div className="mt-3 flex justify-end">
              <Button
                onClick={handleAddComment}
                variant="primary"
                size="sm"
                disabled={!newComment.trim()}
              >
                Post Comment
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {complaint.comments && complaint.comments.length > 0 ? (
              complaint.comments.map((comment, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{comment.userName || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-slate-700">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No comments yet</p>
            )}
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-96 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {chatMessages && chatMessages.length > 0 ? (
              chatMessages.map((message, idx) => {
                const isAdmin = message.sender === 'admin';
                return (
                  <div key={message._id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${
                      isAdmin
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                        : 'bg-slate-200 text-slate-900 rounded-bl-none shadow-md'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${
                        isAdmin ? 'text-blue-100' : 'text-slate-600'
                      }`}>
                        {message.userName || (isAdmin ? 'Admin' : 'User')}
                        {isAdmin && ' ✓'}
                      </p>
                      <p className="text-sm break-words">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        isAdmin ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-center py-12">No messages yet. Start the conversation! 💬</p>
            )}
          </div>

          {showEmojiPicker && (
            <div className="bg-white border-t border-slate-200 p-3 flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => addEmoji(emoji)}
                  className="text-2xl hover:scale-125 transition transform"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-slate-200 p-4 bg-white">
            <div className="flex gap-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                title="Add emoji"
              >
                <SmileIcon className="h-5 w-5" />
              </button>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message... (Shift+Enter for new line)"
                className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="2"
              ></textarea>
              <Button
                onClick={handleSendMessage}
                variant="primary"
                disabled={!newMessage.trim()}
                className="self-end"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ComplaintDetailModal;

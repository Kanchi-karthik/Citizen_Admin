import axios from 'axios';
import { API_BASE_URL } from '../constants.js';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic error handler
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', error.response.data);
    console.error('Error Status:', error.response.status);
    
    // Handle specific error messages from server
    if (error.response.data && typeof error.response.data === 'string') {
      throw new Error(error.response.data);
    }
    throw new Error(error.response.data?.message || `Server Error (${error.response.status})`);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error Request:', error.request);
    throw new Error('No response received from server. Please check your network connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error Message:', error.message);
    throw new Error(error.message || 'An unknown error occurred.');
  }
};

// Users
export const getUsers = async (filters = {}) => {
  try {
    const response = await api.get('/users', { params: filters });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};


// Complaints
export const getComplaints = async (filters = {}) => {
  try {
    const response = await api.get('/complaints', { params: filters });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getComplaintById = async (id) => {
  try {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateComplaint = async (id, complaintData) => {
  try {
    const response = await api.put(`/complaints/${id}`, complaintData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Feedbacks
export const getFeedbacks = async (filters = {}) => {
  try {
    const response = await api.get('/feedbacks', { params: filters });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getFeedbackById = async (id) => {
  try {
    const response = await api.get(`/feedbacks/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Contacts
export const getContacts = async (filters = {}) => {
  try {
    const response = await api.get('/contacts', { params: filters });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getContactById = async (id) => {
  try {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Analytics
export const getAnalytics = async () => {
  try {
    const response = await api.get('/analytics');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// OTP and Verification
export const sendEmailOTP = async (email) => {
  try {
    const response = await api.post('/users/send-email-otp', { email });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const verifyEmailOTP = async (email, otp) => {
  try {
    const response = await api.post('/users/verify-email-otp', { email, otp });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const sendPhoneOTP = async (phone) => {
  try {
    const response = await api.post('/users/send-phone-otp', { phone });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const verifyPhoneOTP = async (phone, otp) => {
  try {
    const response = await api.post('/users/verify-phone-otp', { phone, otp });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Location Autocomplete
export const getLocationSuggestions = async (query) => {
  try {
    const response = await api.get('/users/locations', { params: { query } });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export default api;

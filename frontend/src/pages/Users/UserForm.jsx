import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import InputField from '../../components/common/InputField.jsx';
import LocationAutocomplete from '../../components/common/LocationAutocomplete.jsx';
import PhoneNumberInput from '../../components/common/PhoneNumberInput.jsx';
import SimpleCaptcha from '../../components/common/SimpleCaptcha.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { createUser, getUserById, updateUser, getLocationSuggestions } from '../../utils/api.js';
import { USER_ROLES } from '../../constants.js';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    work: '',
    gender: '',
    age: '',
    volunteering: '',
    volunteeringTypes: [],
    volunteeringDays: '',
    role: 'user', // Default role for new users
    isActive: true, // Default active status
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const volunteeringTypeOptions = [
    'Environmental Cleanup',
    'Community Support',
    'Education',
    'Animal Welfare',
    'Disaster Relief',
  ];

  const volunteeringDaysOptions = [
    'Weekdays',
    'Weekends',
    'Flexible',
  ];

  const genderOptions = [
    { label: 'Select Gender', value: '' },
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

  const roleOptions = USER_ROLES.map(role => ({
    label: role.charAt(0).toUpperCase() + role.slice(1),
    value: role,
  }));

  const fetchUserData = useCallback(async () => {
    if (isEditMode) {
      setLoading(true);
      try {
        const user = await getUserById(id);
        setFormData({
          fullName: user.fullName || '',
          email: user.email || '',
          // password is not loaded for security reasons
          phone: user.phone || '',
          location: user.location || '',
          work: user.work || '',
          gender: user.gender || '',
          age: user.age || '',
          volunteering: user.volunteering || '',
          volunteeringTypes: user.volunteeringTypes || [],
          volunteeringDays: user.volunteeringDays || '',
          role: user.role || 'user',
          isActive: user.isActive !== undefined ? user.isActive : true,
        });
      } catch (err) {
        setSubmitError(err.message);
      } finally {
        setLoading(false);
      }
    }
  }, [id, isEditMode]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Real-time password match validation
  useEffect(() => {
    if (!isEditMode && formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  }, [formData.password, formData.confirmPassword, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for the field being edited and related fields
    setErrors((prev) => {
      const newErrors = { ...prev, [name]: '' };
      // Also clear confirmPassword error when either password field changes
      if (name === 'password' || name === 'confirmPassword') {
        newErrors.confirmPassword = '';
      }
      return newErrors;
    });
  };

  const handleVolunteeringTypeChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentTypes = prev.volunteeringTypes;
      if (checked) {
        return { ...prev, volunteeringTypes: [...currentTypes, value] };
      } else {
        return { ...prev, volunteeringTypes: currentTypes.filter((type) => type !== value) };
      }
    });
    setErrors((prev) => ({ ...prev, volunteeringTypes: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = 'Password is required for new users';
    } else if (!isEditMode && formData.password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (!isEditMode && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!isEditMode && !captchaVerified) {
      newErrors.captcha = 'Please verify CAPTCHA';
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = { ...formData };
      delete dataToSubmit.confirmPassword; // Don't send confirmPassword to API
      if (isEditMode && !formData.password) {
        delete dataToSubmit.password; // Don't send empty password on edit if not changed
      }

      if (isEditMode) {
        await updateUser(id, dataToSubmit);
        alert('User updated successfully!');
      } else {
        await createUser(dataToSubmit);
        alert('User created successfully!');
      }
      navigate('/users');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{isEditMode ? 'Edit User' : 'Add New User'}</h2>

      <Card>
        {submitError && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{submitError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="Enter full name"
              required
            />
            <div>
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter email address"
                required
              />
            </div>
            {!isEditMode && (
              <>
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter password"
                  required={!isEditMode}
                />
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm password"
                  required={!isEditMode}
                />
              </>
            )}
            <PhoneNumberInput
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Enter phone number"
            />
            <LocationAutocomplete
              label="Location (City)"
              name="location"
              value={formData.location}
              onChange={handleChange}
              getSuggestions={getLocationSuggestions}
              error={errors.location}
              placeholder="e.g., New York"
            />
            <InputField
              label="Work/Profession"
              name="work"
              value={formData.work}
              onChange={handleChange}
              error={errors.work}
              placeholder="e.g., Engineer"
            />
            <InputField
              label="Gender"
              name="gender"
              type="select"
              value={formData.gender}
              onChange={handleChange}
              error={errors.gender}
              options={genderOptions}
            />
            <InputField
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              error={errors.age}
              placeholder="Enter age"
            />
            <InputField
              label="Volunteering Interest"
              name="volunteering"
              type="select"
              value={formData.volunteering}
              onChange={handleChange}
              error={errors.volunteering}
              options={[
                { label: 'Select interest', value: '' },
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ]}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Volunteering Types (Select all that apply)</label>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {volunteeringTypeOptions.map((option) => (
                  <InputField
                    key={option}
                    id={`volunteeringTypes-${option.replace(/\s+/g, '-').toLowerCase()}`}
                    name="volunteeringTypes"
                    type="checkbox"
                    label={option}
                    value={option}
                    checked={formData.volunteeringTypes.includes(option)}
                    onChange={handleVolunteeringTypeChange}
                  />
                ))}
              </div>
              {errors.volunteeringTypes && <p className="mt-1 text-sm text-red-600">{errors.volunteeringTypes}</p>}
            </div>
            <InputField
              label="Preferred Volunteering Days"
              name="volunteeringDays"
              type="select"
              value={formData.volunteeringDays}
              onChange={handleChange}
              error={errors.volunteeringDays}
              options={[
                { label: 'Select preferred days', value: '' },
                ...volunteeringDaysOptions.map(day => ({ label: day, value: day }))
              ]}
            />
            <InputField
              label="Role"
              name="role"
              type="select"
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              options={roleOptions}
              required
            />
            {!isEditMode && (
              <div className="md:col-span-2">
                <SimpleCaptcha
                  onVerify={setCaptchaVerified}
                  error={errors.captcha}
                />
              </div>
            )}
            {isEditMode && (
              <InputField
                label="Account Status"
                name="isActive"
                type="checkbox"
                labelClassName="ml-2"
                checked={formData.isActive}
                onChange={handleChange}
              />
            )}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate('/users')} type="button">Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>
              {isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserForm;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaUser,
  FaPhone,
  FaGraduationCap,
  FaSave,
  FaCamera,
  FaCity,
  FaGlobe
} from 'react-icons/fa';
import { IoMdMail } from 'react-icons/io';
import { BiSolidBookAlt } from 'react-icons/bi';

const UserProfile = ({ user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pic: '',
    class: '',
    mobile: '',
    bio: '',
    city: '',
    country: ''
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [readOnly, setReadOnly] = useState(false); // <-- added
  const navigate = useNavigate();

  const getToken = () => {
    const raw = localStorage.getItem('token');
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
          }
        );
        setFormData({
  name: data.name || '',
  email: data.email || '',
  pic: data.pic || '',
  class: data.class || '',
  mobile: data.mobile || '',
  bio: data.bio || '',
  city: data.city || '',
  country: data.country || ''
});

        calculateProfileCompletion(data);
      } catch (error) {
        toast.error('Failed to load profile data');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [navigate]);

  const calculateProfileCompletion = (data) => {
    let completedFields = 0;
    const totalFields = 7;
    if (data.name) completedFields++;
    if (data.email) completedFields++;
    if (data.class) completedFields++;
    if (data.mobile) completedFields++;
    if (data.bio) completedFields++;
    if (data.city) completedFields++;
    if (data.country) completedFields++;
    setProfileCompletion(Math.round((completedFields / totalFields) * 100));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    const formDataPic = new FormData();
    formDataPic.append('image', file);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload/profile-pic`,
        formDataPic,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      setFormData(prev => ({ ...prev, pic: data.url }));
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // MODIFIED: handleSubmit now sets readOnly and reloads data
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const { data } = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/users/profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );
    toast.success('Successfully created');
    setFormData({
      name: data.name || '',
      email: data.email || '',
      pic: data.pic || '',
      class: data.class || '',
      mobile: data.mobile || '',
      bio: data.bio || '',
      city: data.city || '',
      country: data.country || ''
    });
    calculateProfileCompletion(data);
    setReadOnly(true);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update profile');
  }
};


  // Allow switching back to edit mode
  const handleEdit = () => setReadOnly(false);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="relative group">
            <img
              src={
                formData.pic ||
                user?.pic ||
                'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
              }
              alt="Profile"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-purple-100 object-cover"
            />
            {!readOnly && (
              <label className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <FaCamera className="text-white text-xl" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePicChange}
                  className="hidden"
                />
              </label>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <span className="text-white text-xs">Uploading...</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {formData.name}
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-32 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-800 h-2.5 rounded-full"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-500 mt-1">
            Profile {profileCompletion}% complete
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaUser size={14} className="text-purple-800" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              required
              placeholder="Enter your full name"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </div>
          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <IoMdMail size={16} className="text-purple-800" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              required
              readOnly={readOnly}
              disabled={readOnly}
            />
          </div>

          {/* Class/Grade Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaGraduationCap size={14} className="text-purple-800" />
              Class/Grade
            </label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your class/grade"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </div>

          {/* Mobile Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaPhone size={14} className="text-purple-800" />
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter mobile number"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </div>

          {/* City Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaCity size={14} className="text-purple-800" />
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your city"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </div>

          {/* Country Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaGlobe size={14} className="text-purple-800" />
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your country"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </div>
        </div>
        {/* Bio Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <BiSolidBookAlt size={16} className="text-purple-800" />
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Tell us about yourself..."
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        {/* Save & Edit Buttons */}
        <div className="flex justify-end">
          {!readOnly && (
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition font-medium flex items-center gap-2"
            >
              <FaSave size={14} /> Save Profile
            </button>
          )}
          {readOnly && (
            <button
              type="button"
              className="ml-2 px-6 py-2.5 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition font-medium flex items-center gap-2"
              onClick={handleEdit}
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfile;

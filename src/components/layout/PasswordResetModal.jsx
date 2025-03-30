// src/components/layout/PasswordResetModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import api from '../../services/api/axios.config';
import kitovuLogo from '../../assets/images/kitovu-logo.svg';

const PasswordResetModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const modalRef = useRef(null);
  
  // State for password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await api.post('/reset-password', {
        currentPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess(true);
      setIsLoading(false);
      
      // Close after 3 seconds of showing success message
      setTimeout(() => {
        handleClose();
      }, 3000);

    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        // Handle specific error responses
        if (error.response.status === 400) {
          setError('Current password is incorrect');
        } else if (error.response.status === 401) {
          setError('Unauthorized - Please login again');
        } else if (error.response.status === 404) {
          setError('User not found');
        } else {
          setError(error.response.data?.message || 'Failed to reset password');
        }
      } else {
        setError('Network error - Please try again');
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center">
            <img src={kitovuLogo} alt="Kitovu Logo" className="h-6 mr-2" />
            <h3 className="text-lg font-medium text-kitovu-purple">Reset Password</h3>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {success ? (
            <div className="py-4">
              <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800">
                Password reset successfully. This dialog will close automatically.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">
                    {error}
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pr-10"
                      placeholder="Enter current password"
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex="-1"
                    >
                      {showCurrentPassword ? 
                        <EyeOff className="h-5 w-5" /> : 
                        <Eye className="h-5 w-5" />
                      }
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pr-10"
                      placeholder="Enter new password"
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex="-1"
                    >
                      {showNewPassword ? 
                        <EyeOff className="h-5 w-5" /> : 
                        <Eye className="h-5 w-5" />
                      }
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pr-10"
                      placeholder="Confirm new password"
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? 
                        <EyeOff className="h-5 w-5" /> : 
                        <Eye className="h-5 w-5" />
                      }
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-gray-300"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-kitovu-purple hover:bg-purple-800 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">&#9696;</span>
                      Resetting...
                    </>
                  ) : 'Reset Password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = ({ position = 'right' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getStatusColor = () => {
    switch (user?.user_type) {
      case 'admin':
        return 'bg-purple-500';
      case 'supervisor':
        return 'bg-blue-500';
      case 'worker':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDropdownPosition = () => {
    return position === 'left' 
      ? 'left-0' 
      : 'right-0';
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* Avatar with initials */}
        <div className={`w-10 h-10 ${getStatusColor()} rounded-full flex items-center justify-center text-white font-semibold text-sm relative`}>
          {getInitials(user.name)}
          {/* Online status indicator */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
        </div>
        
        {/* User name and role (hidden on mobile) */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {user.name?.split(' ')[0] || 'User'}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {user.user_type}
          </div>
        </div>

        {/* Dropdown arrow */}
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full mt-2 ${getDropdownPosition()} w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden`}>
          {/* Header */}
          <div className={`${getStatusColor()} px-4 py-3 text-white`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold">
                {getInitials(user.name)}
              </div>
              <div>
                <div className="font-semibold">{user.name || 'N/A'}</div>
                <div className="text-sm opacity-90 capitalize">{user.user_type}</div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">
              Profile Information
            </h4>
            
            <div className="space-y-3">
              {/* Primary Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID</label>
                  <p className="text-sm text-gray-900 font-medium">{user.user_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</label>
                  <p className="text-sm text-gray-900">{user.domain || 'N/A'}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-sm text-gray-900">{user.email || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</label>
                <p className="text-sm text-gray-900">{user.contact || 'N/A'}</p>
              </div>

              {/* Location Info */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</label>
                <p className="text-sm text-gray-900">{user.location || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">City</label>
                  <p className="text-sm text-gray-900">{user.city || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">State</label>
                  <p className="text-sm text-gray-900">{user.state || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats (for non-admin users) */}
          {user.user_type !== 'admin' && (
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <h5 className="text-xs font-semibold text-gray-700 mb-2">Quick Stats</h5>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  Active
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact Profile Icon (for mobile or minimal space)
const CompactProfileIcon = ({ showName = false }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getStatusColor = () => {
    switch (user?.user_type) {
      case 'admin':
        return 'bg-purple-500';
      case 'supervisor':
        return 'bg-blue-500';
      case 'worker':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
      >
        <div className={`w-8 h-8 ${getStatusColor()} rounded-full flex items-center justify-center text-white font-semibold text-xs relative`}>
          {getInitials(user.name)}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border border-white rounded-full"></div>
        </div>
        {showName && (
          <span className="text-sm font-medium text-gray-700">
            {user.name?.split(' ')[0]}
          </span>
        )}
      </button>

      {/* Simple tooltip on hover */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block">
        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {user.name} ({user.user_type})
        </div>
      </div>
    </div>
  );
};

export { ProfileDropdown, CompactProfileIcon };
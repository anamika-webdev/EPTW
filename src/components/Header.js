import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CompactProfileIcon } from './ProfileDropdown';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-blue-800 text-white p-4 shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Zuree Telecom-EPTW</h1>
          {user && (
            <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">
              {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)} Dashboard
            </span>
          )}
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            {/* Compact Profile Icon for Header */}
            <div className="flex items-center gap-3">
              
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
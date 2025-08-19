import React from 'react';

const NotificationPanel = ({ notifications, onClose }) => {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div key={notification.id} className={`p-4 border-b ${!notification.is_read ? 'bg-blue-50' : ''}`}>
              <p className="text-sm text-gray-800">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(notification.created_at).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-6">No new notifications.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
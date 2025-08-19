import React from 'react';

const PTWDetailsModal = ({ ptw, onClose }) => {
  if (!ptw) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold">PTW Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Request No: {ptw.task_id}</h3>
          <p><strong>Status:</strong> {ptw.status.replace(/_/g, ' ').toUpperCase()}</p>
          <p><strong>Worker:</strong> {ptw.worker_name}</p>
          <p><strong>Site:</strong> {ptw.site_name}</p>
          <p><strong>Location:</strong> {ptw.location_of_work}</p>
          <p><strong>Work Description:</strong> {ptw.work_description}</p>
          
          <h4 className="text-md font-semibold mt-4 mb-2">Timestamps</h4>
          <ul>
            <li><strong>Date Issued:</strong> {new Date(ptw.date_issued).toLocaleDateString()} at {ptw.time_issued}</li>
            <li><strong>Valid Until:</strong> {new Date(ptw.valid_until_date).toLocaleDateString()} at {ptw.valid_until_time}</li>
            {ptw.created_at && <li><strong>Created At:</strong> {new Date(ptw.created_at).toLocaleString()}</li>}
            {ptw.updated_at && <li><strong>Last Updated At:</strong> {new Date(ptw.updated_at).toLocaleString()}</li>}
          </ul>
        </div>
        
        <div className="mt-6 text-right">
          <button onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default PTWDetailsModal;
import React, { useState } from 'react';
import { TASK_STATUS_COLORS } from '../utils/constants';

const TaskCard = ({ task, onAction, onPtwInitiate }) => {
  const [showActionForm, setShowActionForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [remarks, setRemarks] = useState('');
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
  };
  
  const handleActionClick = (action) => {
    onAction(task.task_id, action, selectedFile, remarks);
    // Reset state after action
    setShowActionForm(false);
    setSelectedFile(null);
    setRemarks('');
  };

  const statusColorClass = TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.active;
  const isPtwReady = task.task_type === 'ptw' && task.status === 'ptw_initiated';
  const isActiveOrInProgress = task.status === 'active' || task.status === 'in_progress';

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${statusColorClass.border}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{task.task_type === 'ptw' ? 'Permit to Work' : 'General Task'}</h3>
          <p className="text-sm font-medium text-gray-600 mt-1">Task ID: {task.task_id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColorClass.bg} ${statusColorClass.text}`}>
          {task.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      <div className="mt-4 text-sm text-gray-700 space-y-2">
        {task.permit_number && (
          <p><strong>Permit No:</strong> {task.permit_number}</p>
        )}
        <p><strong>Site:</strong> {task.site_name || 'N/A'}</p>
        <p><strong>Location:</strong> {task.location_of_work || task.site_location || 'N/A'}</p>
        <p><strong>Description:</strong> {task.task_description || task.work_description}</p>
        <p><strong>Assigned By:</strong> {task.supervisor_name}</p>
      </div>

      <div className="mt-6 space-y-4">
        {isPtwReady && (
          <button
            onClick={() => onPtwInitiate(task)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Fill PTW Form
          </button>
        )}
        
        {isActiveOrInProgress && !showActionForm && (
          <button
            onClick={() => setShowActionForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Update Status
          </button>
        )}
        
        {showActionForm && (
          <div className="border p-4 rounded-lg bg-gray-50 space-y-3">
            <h4 className="text-md font-bold text-gray-800">Complete Action</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                value={remarks}
                onChange={handleRemarksChange}
                className="w-full p-2 border rounded-md"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <input
                type="file"
                className="w-full text-sm text-gray-500"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowActionForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              {task.status === 'active' && (
                <button
                  onClick={() => handleActionClick('start')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Start Task
                </button>
              )}
              {task.status === 'in_progress' && (
                <>
                  <button
                    onClick={() => handleActionClick('pause')}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => handleActionClick('complete')}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Complete
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
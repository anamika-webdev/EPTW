import React, { useState } from 'react';
import { TASK_STATUS_COLORS } from '../utils/constants';

const TaskCard = ({ task, onAction, onPtwInitiate }) => {
  const [showFile, setShowFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  
  const handleActionClick = (action) => {
    if (['start', 'complete'].includes(action)) {
      onAction(task.task_id, action, selectedFile);
      setShowFile(false);
      setSelectedFile(null);
    }
  };

  const statusColorClass = TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.active;

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
        <p><strong>Site:</strong> {task.site_name || 'N/A'}</p>
        <p><strong>Location:</strong> {task.location_of_work || task.site_location || 'N/A'}</p>
        <p><strong>Description:</strong> {task.task_description || task.work_description}</p>
        <p><strong>Assigned By:</strong> {task.supervisor_name}</p>
      </div>
      
      {task.status === 'ptw_initiated' && (
        <div className="mt-6">
          <button
            onClick={() => onPtwInitiate(task)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            View PTW Form
          </button>
        </div>
      )}
      
      {task.status === 'active' && task.task_type !== 'ptw' && (
        <div className="mt-6 flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">Attach start-of-work photo</label>
          <input 
            type="file" 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleFileChange}
          />
          <button
            onClick={() => handleActionClick('start')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg mt-4 transition-colors duration-200"
          >
            Start Task
          </button>
        </div>
      )}
      
      {task.status === 'in_progress' && (
        <div className="mt-6">
          <button
            onClick={() => handleActionClick('complete')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Complete Task
          </button>
        </div>
      )}
    </div>
  );
};
export default TaskCard;
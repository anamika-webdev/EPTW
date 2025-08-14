import React, { useState } from 'react';
import { TASK_STATUS } from '../utils/constants';

const TaskCard = ({ task, onAction, onPtwInitiate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileAction = async (action) => {
    if (action === 'complete' && !selectedFile) {
      alert('Please select an image before completing the task');
      return;
    }

    setLoading(true);
    try {
      await onAction(task.task_id, action, selectedFile);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Active' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      ptw_submitted: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'PTW Submitted' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };
  
  const isPtwTask = task.task_type === 'ptw';

  return (
    <div className="bg-white border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-bold text-gray-800">{task.task_id}</h4>
          <p className="text-sm text-gray-500">Assigned by: {task.supervisor_name}</p>
        </div>
        {getStatusBadge(task.status)}
      </div>

      {isPtwTask && (
        <div className="bg-purple-50 p-4 rounded-lg mb-4 border-l-4 border-purple-500">
          <p className="text-purple-800 font-bold">Permit to Work Task</p>
          <p className="text-sm text-gray-600">Permit Number: <span className="font-medium">{task.permit_number}</span></p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-gray-700">Site:</span>
            <p className="text-gray-600">{task.site_name}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Area:</span>
            <p className="text-gray-600">{task.assigned_area || task.location_of_work}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Location:</span>
            <p className="text-gray-600">{task.site_location}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-gray-700">Description:</span>
            <p className="text-gray-600">{task.task_description || task.work_description}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Date:</span>
            <p className="text-gray-600">{formatDate(task.implementation_date || task.date_issued)}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Time:</span>
            <p className="text-gray-600">{formatTime(task.implementation_time || task.time_issued)}</p>
          </div>
        </div>
      </div>

      {task.status === 'active' && !isPtwTask && (
        <div className="border-t pt-4">
          <h5 className="font-semibold text-gray-700 mb-3">Start Task</h5>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
            <button
              onClick={() => handleFileAction('start')}
              disabled={!selectedFile || loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {loading ? 'Starting...' : 'Start Task'}
            </button>
          </div>
        </div>
      )}
      
      {task.status === 'active' && isPtwTask && (
        <div className="border-t pt-4">
          <h5 className="font-semibold text-gray-700 mb-3">PTW Actions</h5>
          <button
            onClick={() => onPtwInitiate(task)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Fill PTW Assurance Form
          </button>
        </div>
      )}

      {task.status === 'in_progress' && (
        <div className="border-t pt-4">
          <h5 className="font-semibold text-gray-700 mb-3">Task Actions</h5>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleFileAction('pause')}
                disabled={loading}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors duration-200 font-medium"
              >
                {loading ? 'Pausing...' : 'Pause Task'}
              </button>
              <button
                onClick={() => handleFileAction('complete')}
                disabled={!selectedFile || loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {loading ? 'Completing...' : 'Complete Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {(task.start_image || task.pause_image || task.completed_image || isPtwTask) && (
        <div className="border-t pt-4 mt-4">
          <h5 className="font-semibold text-gray-700 mb-3">Task Images</h5>
          <div className="flex flex-wrap gap-4">
            {task.start_image && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Start Image</p>
                <img 
                  src={`http://localhost:5000/uploads/${task.start_image}`} 
                  alt="Task Start" 
                  className="w-20 h-20 object-cover rounded-lg border-2 border-green-200"
                />
              </div>
            )}
            {task.pause_image && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Pause Image</p>
                <img 
                  src={`http://localhost:5000/uploads/${task.pause_image}`} 
                  alt="Task Pause" 
                  className="w-20 h-20 object-cover rounded-lg border-2 border-yellow-200"
                />
              </div>
            )}
            {task.completed_image && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Completed Image</p>
                <img 
                  src={`http://localhost:5000/uploads/${task.completed_image}`} 
                  alt="Task Completed" 
                  className="w-20 h-20 object-cover rounded-lg border-2 border-blue-200"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {(task.started_at || task.paused_at || task.completed_at) && (
        <div className="border-t pt-4 mt-4">
          <h5 className="font-semibold text-gray-700 mb-3">Timeline</h5>
          <div className="space-y-2 text-sm">
            {task.started_at && (
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Started: {new Date(task.started_at).toLocaleString()}
              </div>
            )}
            {task.paused_at && (
              <div className="flex items-center text-yellow-600">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                Paused: {new Date(task.paused_at).toLocaleString()}
              </div>
            )}
            {task.completed_at && (
              <div className="flex items-center text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Completed: {new Date(task.completed_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
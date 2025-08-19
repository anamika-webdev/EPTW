import React from 'react';
import { TASK_STATUS_COLORS } from '../utils/constants';

const TaskCard = ({ task, onUpdateClick, onPtwInitiate }) => {
  const statusColorClass = TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.active;
  const isPtwReady = task.task_type === 'ptw' && task.status === 'ptw_initiated';
  const isUpdatable = ['active', 'in_progress', 'paused'].includes(task.status);
  
  const displayLocation = task.task_type === 'ptw' ? task.location_of_work : task.assigned_area;
  const displayDescription = task.task_type === 'ptw' ? task.work_description : task.task_description;

  const getUpdateButtonText = () => {
    switch(task.status) {
      case 'active': return 'Start Task';
      case 'in_progress': return 'Update Status';
      case 'paused': return 'Resume Task';
      default: return 'Update Status';
    }
  };

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
        <p><strong>Location:</strong> {displayLocation || 'N/A'}</p>
        <p><strong>Description:</strong> {displayDescription || 'N/A'}</p>
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
        
        {isUpdatable && (
          <button
            onClick={() => onUpdateClick(task)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {getUpdateButtonText()}
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
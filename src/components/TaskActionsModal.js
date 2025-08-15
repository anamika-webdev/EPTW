import React, { useState } from 'react';

const TaskActionsModal = ({ task, onClose, onUpdate }) => {
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action) {
      alert('Please select an action.');
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('action', action);

    try {
      await onUpdate(task.task_id, action, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative p-8 bg-white w-96 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4">Update Task Status</h3>
        <p className="mb-2">Task ID: <span className="font-semibold">{task.task_id}</span></p>
        <p className="mb-4">Current Status: <span className="font-semibold">{task.status.replace('_', ' ').toUpperCase()}</span></p>

        <div className="mb-4">
          <label htmlFor="action" className="block text-sm font-medium text-gray-700">Select Action</label>
          <select
            id="action"
            name="action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select an action</option>
            <option value="start">Start Task</option>
            <option value="complete">Complete Task</option>
          </select>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !action}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              loading || !action ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskActionsModal;
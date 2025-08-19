import React, { useState } from 'react';

const TaskActionsModal = ({ task, onClose, onAction }) => {
  const [remarks, setRemarks] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleFileChange = (e) => {
    setAttachments([...e.target.files]);
  };

  const handleSubmit = (action) => {
    const formData = new FormData();
    formData.append('action', action);
    formData.append('remarks', remarks);
    attachments.forEach(file => {
      formData.append('attachments', file);
    });
    onAction(task.task_id, formData);
  };

  const getAvailableActions = () => {
    switch (task.status) {
      case 'active':
        return ['start'];
      case 'in_progress':
        return ['pause', 'complete'];
      case 'paused':
        return ['resume'];
      default:
        return [];
    }
  };

  const availableActions = getAvailableActions();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Task Actions for {task.task_id}</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">{task.task_description}</p>
          </div>
          
          <div className="mt-4">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 text-left">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any comments..."
            ></textarea>
          </div>

          <div className="mt-4">
            <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 text-left">Attachments</label>
            <input
              id="attachments"
              name="attachments"
              type="file"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="items-center px-4 py-3 mt-4">
            <div className="flex justify-center gap-2">
              {availableActions.includes('start') && (
                <button onClick={() => handleSubmit('start')} className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300">Start Task</button>
              )}
              {availableActions.includes('pause') && (
                <button onClick={() => handleSubmit('pause')} className="px-4 py-2 bg-yellow-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300">Pause Task</button>
              )}
              {availableActions.includes('resume') && (
                <button onClick={() => handleSubmit('resume')} className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">Resume Task</button>
              )}
              {availableActions.includes('complete') && (
                <button onClick={() => handleSubmit('complete')} className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">Complete Task</button>
              )}
            </div>
            <button onClick={onClose} className="mt-3 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskActionsModal;
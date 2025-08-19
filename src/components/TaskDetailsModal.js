import React from 'react';
import { API_CONFIG } from '../utils/constants';

const TaskDetailsModal = ({ task, onClose }) => {
  if (!task) return null;

  // Safely parse attachments
  const getAttachments = (update) => {
    if (!update.attachments) {
      return [];
    }
    // Handle both stringified JSON and already-parsed arrays
    if (typeof update.attachments === 'string') {
      try {
        return JSON.parse(update.attachments);
      } catch (e) {
        console.error("Failed to parse attachments:", e);
        return [];
      }
    }
    return update.attachments;
  };

  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) {
      return <p className="text-sm text-gray-500 italic">No attachments for this update.</p>;
    }

    return attachments.map((file, index) => {
      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file);
      const url = `${API_CONFIG.BASE_URL.replace('/api', '')}/uploads/${file}`;
      
      if (isImage) {
        return (
          <a key={index} href={url} target="_blank" rel="noopener noreferrer">
            <img  src={url} alt={`attachment ${index + 1}`} className="max-w-[100px] h-auto mt-2 rounded-md shadow-md hover:ring-2 hover:ring-blue-500 transition-all"/>
          </a>
        );
      }
      return (
        <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block mt-1 bg-gray-100 px-3 py-1 rounded-md">{file}</a>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">Task Details: {task.task_id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Main Task Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6 bg-blue-50 p-4 rounded-lg">
            <div><p><strong>Status:</strong> {task.status.replace(/_/g, ' ').toUpperCase()}</p></div>
            <div><p><strong>Worker:</strong> {task.worker_name}</p></div>
            <div><p><strong>Site:</strong> {task.site_name}</p></div>
            <div><p><strong>Assigned Area:</strong> {task.assigned_area}</p></div>
            <div className="col-span-2"><p><strong>Description:</strong> {task.task_description}</p></div>
            {task.permit_number && <div className="col-span-2"><p><strong>Permit No:</strong> {task.permit_number}</p></div>}
          </div>
          
          {/* History Timeline */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Task History & Updates</h3>
            {task.history && task.history.length > 0 ? (
              task.history.map((update) => {
                const attachments = getAttachments(update);
                return (
                  <div key={update.id} className="p-4 bg-gray-50 rounded-lg shadow-sm border-l-4 border-blue-400">
                    <p className="font-semibold text-md capitalize text-blue-800">{update.status_change}</p>
                    <p className="text-xs text-gray-500 mb-2">{new Date(update.created_at).toLocaleString()}</p>
                    {update.remarks && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-700">Remarks:</p>
                        <p className="text-sm bg-white p-2 rounded-md border mt-1">{update.remarks}</p>
                      </div>
                    )}
                    {attachments.length > 0 && (
                      <div className="mt-3">
                        <p className="font-semibold text-sm text-gray-700">Attachments:</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {renderAttachments(attachments)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 italic">No updates have been recorded for this task yet.</p>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t mt-auto text-right bg-gray-50">
          <button onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
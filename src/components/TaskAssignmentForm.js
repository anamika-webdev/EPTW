import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TaskAssignmentForm = ({ worker, sites, onClose, onSuccess, permitNumber, preselectedSite }) => {
  const [taskDetails, setTaskDetails] = useState({
    worker_id: worker.user_id,
    task_type: permitNumber ? 'ptw' : 'general',
    status: 'active',
    // Pre-populate site_id if available
    site_id: preselectedSite?.site_id || '',
    assigned_area: '',
    task_description: '',
    implementation_date: '',
    implementation_time: '',
    permit_number: permitNumber || ''
  });
  
  // This useEffect ensures the site_id is updated when preselectedSite changes
  useEffect(() => {
    if (preselectedSite) {
      setTaskDetails(prevDetails => ({
        ...prevDetails,
        site_id: preselectedSite.site_id
      }));
    }
  }, [preselectedSite]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskDetails({ ...taskDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Find the selected site_name based on the site_id
    const selectedSite = sites.find(site => site.site_id === taskDetails.site_id);
    const siteName = selectedSite ? selectedSite.site_name : '';

    try {
      await api.createTask({
        ...taskDetails,
        supervisor_id: 'SUP001',
        permit_number: permitNumber,
        site_name: siteName // Ensure site_name is included in the payload
      });
      onSuccess();
    } catch (error) {
      alert('Failed to assign task. Please try again.');
      console.error('Task assignment error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative p-8 bg-white w-full max-w-lg rounded-lg shadow-xl">
        <h3 className="text-2xl font-bold mb-4">Assign Task to {worker.name}</h3>
        {taskDetails.permit_number && (
          <p className="mb-4 text-lg">Permit No: <span className="font-semibold">{taskDetails.permit_number}</span></p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="site_id" className="block text-sm font-medium text-gray-700">Site</label>
            <select
              id="site_id"
              name="site_id"
              value={taskDetails.site_id}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Select a site</option>
              {sites.map(site => (
                <option key={site.site_id} value={site.site_id}>{site.site_name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="assigned_area" className="block text-sm font-medium text-gray-700">Assigned Area</label>
            <input
              type="text"
              id="assigned_area"
              name="assigned_area"
              value={taskDetails.assigned_area}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="task_description" className="block text-sm font-medium text-gray-700">Task Description</label>
            <textarea
              id="task_description"
              name="task_description"
              value={taskDetails.task_description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="implementation_date" className="block text-sm font-medium text-gray-700">Implementation Date</label>
              <input type="date" id="implementation_date" name="implementation_date" value={taskDetails.implementation_date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="implementation_time" className="block text-sm font-medium text-gray-700">Implementation Time</label>
              <input type="time" id="implementation_time" name="implementation_time" value={taskDetails.implementation_time} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" required />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TaskAssignmentForm;
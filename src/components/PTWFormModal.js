import React, { useState } from 'react';
import api from '../services/api';

const PTWFormModal = ({ worker, sites, onClose, onAssignTask, permitNumber }) => {
  const [taskDetails, setTaskDetails] = useState({
    task_type: 'ptw',
    worker_id: worker.user_id,
    site_id: '',
    site_name: '',
    location_of_work: '',
    work_description: '',
    date_issued: '',
    time_issued: '',
    valid_until_date: '',
    valid_until_time: '',
    permit_number: permitNumber || '', // Use the auto-generated number
    status: 'ptw_initiated'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'site_id') {
      const selectedSite = sites.find(site => site.site_id.toString() === value.toString());
      setTaskDetails(prevDetails => ({
        ...prevDetails,
        site_id: value,
        site_name: selectedSite ? selectedSite.site_name : ''
      }));
    } else {
      setTaskDetails({ ...taskDetails, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskDetails.site_id || !taskDetails.work_description) {
      alert('Please fill all required fields.');
      return;
    }
    try {
      await onAssignTask(taskDetails);
      onClose();
    } catch (error) {
      console.error('Error assigning PTW task:', error);
      alert('Failed to assign PTW task. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative p-8 bg-white w-full max-w-lg rounded-lg shadow-xl">
        <h3 className="text-2xl font-bold mb-4">Initiate Permit to Work for {worker.name}</h3>
        <form onSubmit={handleSubmit}>
          {/* Permit number is no longer displayed on initiation */}
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
            <label htmlFor="location_of_work" className="block text-sm font-medium text-gray-700">Location of Work</label>
            <input
              type="text"
              id="location_of_work"
              name="location_of_work"
              value={taskDetails.location_of_work}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="work_description" className="block text-sm font-medium text-gray-700">Work Description</label>
            <textarea
              id="work_description"
              name="work_description"
              value={taskDetails.work_description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date_issued" className="block text-sm font-medium text-gray-700">Date Issued</label>
              <input type="date" id="date_issued" name="date_issued" value={taskDetails.date_issued} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="time_issued" className="block text-sm font-medium text-gray-700">Time Issued</label>
              <input type="time" id="time_issued" name="time_issued" value={taskDetails.time_issued} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="valid_until_date" className="block text-sm font-medium text-gray-700">Valid Until Date</label>
              <input type="date" id="valid_until_date" name="valid_until_date" value={taskDetails.valid_until_date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="valid_until_time" className="block text-sm font-medium text-gray-700">Valid Until Time</label>
              <input type="time" id="valid_until_time" name="valid_until_time" value={taskDetails.valid_until_time} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" required />
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
              Assign PTW Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PTWFormModal;
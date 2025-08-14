import React, { useState } from 'react';
import { TASK_STATUS } from '../utils/constants';

const PTWFormModal = ({ worker, sites, onClose, onAssignTask }) => {
  const [formData, setFormData] = useState({
    site_id: '', // Added site_id to formData state
    site_name: '',
    permit_number: '',
    date_issued: '',
    time_issued: '',
    valid_until_date: '',
    valid_until_time: '',
    work_description: '',
    location_of_work: '',
    status: TASK_STATUS.PTW_INITIATED,
    task_type: 'ptw',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.site_id) newErrors.site_id = 'Site is required';
    if (!formData.permit_number.trim()) newErrors.permit_number = 'Permit Number is required';
    if (!formData.date_issued.trim()) newErrors.date_issued = 'Date Issued is required';
    if (!formData.work_description.trim()) newErrors.work_description = 'Work Description is required';
    if (!formData.location_of_work.trim()) newErrors.location_of_work = 'Location of Work is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === 'site_id') {
        const selectedSite = sites.find(site => site.site_id === value);
        newState.site_name = selectedSite ? selectedSite.site_name : '';
        newState.location_of_work = selectedSite ? selectedSite.location : '';
      }
      return newState;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onAssignTask({
        worker_id: worker.user_id,
        ...formData,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create PTW task:', error);
      alert('Failed to create PTW task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Permit to Work (PTW) Assurance Form</h3>
        <p className="text-gray-600 mb-6">Assigning to: <span className="font-medium">{worker.name} ({worker.user_id})</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project / Site *</label>
              <select
                name="site_id"
                value={formData.site_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.site_id ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.site_id}>
                    {site.site_name}
                  </option>
                ))}
              </select>
              {errors.site_id && <p className="text-red-500 text-xs mt-1">{errors.site_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permit Number *</label>
              <input type="text" name="permit_number" value={formData.permit_number} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              {errors.permit_number && <p className="text-red-500 text-xs mt-1">{errors.permit_number}</p>}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued *</label>
                <input type="date" name="date_issued" value={formData.date_issued} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Issued</label>
                <input type="time" name="time_issued" value={formData.time_issued} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Permit Valid Until Date</label>
                <input type="date" name="valid_until_date" value={formData.valid_until_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Permit Valid Until Time</label>
                <input type="time" name="valid_until_time" value={formData.valid_until_time} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Description *</label>
            <textarea name="work_description" rows="3" value={formData.work_description} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
            {errors.work_description && <p className="text-red-500 text-xs mt-1">{errors.work_description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location of Work *</label>
            <input type="text" name="location_of_work" value={formData.location_of_work} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            {errors.location_of_work && <p className="text-red-500 text-xs mt-1">{errors.location_of_work}</p>}
          </div>

          <div className="flex gap-2 mt-6">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors duration-200">
              {loading ? 'Initiating...' : 'Initiate PTW'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PTWFormModal;
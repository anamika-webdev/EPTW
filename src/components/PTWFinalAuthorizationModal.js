import React, { useState } from 'react';
import api from '../services/api';
import { TASK_STATUS } from '../utils/constants';

const PTWFinalAuthorizationModal = ({ task, onClose, onAuthorize }) => {
  const [formData, setFormData] = useState({
    supervisor_name: '',
    supervisor_signature: '',
    authorization_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.supervisor_name.trim()) newErrors.supervisor_name = 'Name is required';
    if (!formData.supervisor_signature.trim()) newErrors.supervisor_signature = 'Signature is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await onAuthorize(task.task_id, {
        supervisor_name: formData.supervisor_name,
        supervisor_signature: formData.supervisor_signature,
        authorization_date: formData.authorization_date,
      });
      onClose();
    } catch (error) {
      console.error('Error authorizing PTW:', error);
      alert('Failed to authorize PTW. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderChecklist = (category, title) => {
    const ptwFormData = typeof task.ptw_form_data === 'string' ? JSON.parse(task.ptw_form_data) : task.ptw_form_data;
    const ptwFiles = typeof task.ptw_files === 'string' ? JSON.parse(task.ptw_files) : task.ptw_files;

    return (
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <div className="space-y-1 mt-2 text-sm text-gray-600">
          {Object.entries(ptwFormData[category] || {}).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                {value === true ? '✅' : value === false ? '❌' : '🤷'}
              </span>
              <span>{key.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
        {ptwFiles && ptwFiles[category] && (
          <div className="mt-2">
            {Object.entries(ptwFiles[category]).map(([key, file]) => (
              <p key={key} className="text-xs text-gray-500">
                Uploaded file for {key.replace(/_/g, ' ')}: <a href={`http://localhost:5000/uploads/${file}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a>
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Final Authorization for PTW</h3>
        <p className="text-gray-600 mb-6">Review the worker's submitted form and provide final authorization.</p>

        <div className="border border-gray-200 p-4 rounded-lg mb-6 max-h-80 overflow-y-auto">
          <h4 className="text-xl font-semibold mb-3">Worker's Submission for PTW #{task.permit_number}</h4>
          {renderChecklist('generalDetails', '1. General PTW Details')}
          {renderChecklist('hazardAssessment', '2. Hazard Identification & Risk Assessment')}
          {renderChecklist('worksitePreparation', '3. Worksite Preparation')}
          {renderChecklist('ppe', '4. Personal Protective Equipment (PPE)')}
          {renderChecklist('workforceCommunication', '5. Workforce Competence & Communication')}
          {renderChecklist('specialConditions', '6. Special Conditions & Additional Controls')}
          {task.remarks && (
            <div className="mt-4">
              <h4 className="font-semibold">Worker Remarks:</h4>
              <p className="text-sm text-gray-600 mt-1">{task.remarks}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permit Issuer Name</label>
              <input type="text" name="supervisor_name" value={formData.supervisor_name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              {errors.supervisor_name && <p className="text-red-500 text-xs mt-1">{errors.supervisor_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permit Issuer Signature</label>
              <input type="text" name="supervisor_signature" value={formData.supervisor_signature} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              {errors.supervisor_signature && <p className="text-red-500 text-xs mt-1">{errors.supervisor_signature}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50">
              {loading ? 'Authorizing...' : 'Final Authorize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PTWFinalAuthorizationModal;
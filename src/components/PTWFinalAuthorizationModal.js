import React, { useState } from 'react';
import api from '../services/api';
import { TASK_STATUS } from '../utils/constants';

const PTWFinalAuthorizationModal = ({ task, onClose, onAuthorize }) => {
  const [issuerName, setIssuerName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issuerName.trim() || !receiverName.trim()) {
      alert('Please fill in both names before authorizing.');
      return;
    }

    setLoading(true);
    try {
      await onAuthorize(task.id, {
        issuer_name: issuerName,
        receiver_name: receiverName,
        status: TASK_STATUS.COMPLETED,
      });
      onClose();
    } catch (error) {
      console.error('Error authorizing PTW:', error);
      alert('Failed to authorize PTW. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderChecklist = (category, title) => (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <div className="space-y-1 mt-2 text-sm text-gray-600">
        {Object.entries(task[category] || {}).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
              {value === true ? '✅' : value === false ? '❌' : '🤷'}
            </span>
            <span>{key.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>
      {task.ptw_files && task.ptw_files[category] && (
        <div className="mt-2">
          {Object.entries(task.ptw_files[category]).map(([key, file]) => (
            <p key={key} className="text-xs text-gray-500">
              Uploaded file for {key.replace(/_/g, ' ')}: <a href={`http://localhost:5000/uploads/${file}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a>
            </p>
          ))}
        </div>
      )}
    </div>
  );

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
              <input type="text" value={issuerName} onChange={(e) => setIssuerName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permit Receiver Name</label>
              <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
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
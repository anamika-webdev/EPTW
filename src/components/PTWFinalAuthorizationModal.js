import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../utils/constants';

// Helper function to render nested object details recursively
const renderDetails = (details) => {
  if (!details || Object.keys(details).length === 0) {
    return <li className="italic text-gray-500">No details provided.</li>;
  }

  return Object.entries(details).map(([key, value]) => (
    <li key={key}>
      <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
      {typeof value === 'object' && value !== null ? (
        <ul className="list-disc list-inside ml-4 mt-1">
          {renderDetails(value)}
        </ul>
      ) : (
        <span> {value.toString()}</span>
      )}
    </li>
  ));
};

// Helper function to render file uploads
const renderFiles = (files) => {
  if (!files || Object.keys(files).length === 0) {
    return <p className="italic text-gray-500">No files uploaded.</p>;
  }

  const allFiles = [];
  Object.entries(files).forEach(([category, fileObject]) => {
    Object.entries(fileObject).forEach(([key, filename]) => {
      const imageUrl = `${API_CONFIG.BASE_URL}/uploads/${filename}`;
      allFiles.push({ key: `${category}-${key}`, url: imageUrl, label: `${category.replace(/_/g, ' ')} - ${key.replace(/_/g, ' ')}` });
    });
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {allFiles.map((file) => (
        <a key={file.key} href={file.url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <img src={file.url} alt={file.label} className="w-full h-32 object-cover"/>
          <p className="p-2 text-center text-sm font-medium text-gray-700">{file.label}</p>
        </a>
      ))}
    </div>
  );
};

const PTWFinalAuthorizationModal = ({ task, onClose, onAuthorize }) => {
  const { user } = useAuth();
  const [supervisorSignature, setSupervisorSignature] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthorize = async () => {
    if (!supervisorSignature) {
      alert('Supervisor signature is required.');
      return;
    }

    setLoading(true);
    try {
      await onAuthorize(task, {
        supervisor_name: user.name,
        supervisor_signature: supervisorSignature,
        authorization_date: new Date().toISOString().split('T')[0],
      });
      onClose();
    } catch (error) {
      alert('Failed to authorize PTW. Please try again.');
      console.error('Authorization error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return null;
  }

  const ptwFormData = typeof task.ptw_form_data === 'string' ? JSON.parse(task.ptw_form_data) : task.ptw_form_data;
  const ptwFilesData = typeof task.ptw_files === 'string' ? JSON.parse(task.ptw_files) : task.ptw_files;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative p-8 bg-white w-full max-w-2xl rounded-lg shadow-xl">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Final PTW Authorization</h3>
        
        <div className="mb-6 border-b pb-4">
          <p className="mb-2 text-lg">Permit No: <span className="font-semibold text-blue-600">{task.permit_number}</span></p>
          <p className="mb-2 text-lg">Worker: <span className="font-semibold text-gray-700">{task.worker_name}</span></p>
          <p className="text-lg">Site: <span className="font-semibold text-gray-700">{task.site_name}</span></p>
        </div>

        <div className="mb-6 max-h-96 overflow-y-auto border p-4 rounded-lg bg-gray-50">
          <h4 className="text-xl font-bold mb-3 text-gray-800">Worker Submitted Details</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {renderDetails(ptwFormData)}
          </ul>
        </div>

        <div className="mb-6 max-h-96 overflow-y-auto border p-4 rounded-lg bg-gray-50">
          <h4 className="text-xl font-bold mb-3 text-gray-800">Uploaded Files</h4>
          {renderFiles(ptwFilesData)}
        </div>
        
        <label htmlFor="supervisorSignature" className="block text-sm font-medium text-gray-700">
          Your Signature
        </label>
        <input
          type="text"
          id="supervisorSignature"
          value={supervisorSignature}
          onChange={(e) => setSupervisorSignature(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
        
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleAuthorize}
            disabled={loading || !supervisorSignature}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 ${
              loading || !supervisorSignature ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Authorizing...' : 'Authorize'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PTWFinalAuthorizationModal;
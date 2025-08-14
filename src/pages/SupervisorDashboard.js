import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileDropdown } from '../components/ProfileDropdown';
import api from '../services/api';

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [sites, setSites] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadWorkers(),
        loadSites(),
        loadTasks()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      const data = await api.getWorkers();
      setWorkers(data);
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const loadSites = async () => {
    try {
      const data = await api.getSites();
      setSites(data);
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await api.getTasks({ supervisor_id: user.user_id });
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleAssignTask = (worker) => {
    if (!worker.is_available) {
      alert('This worker is currently busy with another task.');
      return;
    }
    setSelectedWorker(worker);
    setShowTaskForm(true);
  };

  const handleTaskAssigned = () => {
    setShowTaskForm(false);
    setSelectedWorker(null);
    loadTasks();
    loadWorkers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        {/* Header with Profile */}
        <div className="flex justify-between items-center mb-4">
          
          <ProfileDropdown position="right" />
        </div>
        
        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workers</p>
                <p className="text-2xl font-bold text-blue-600">{workers.length}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Workers</p>
                <p className="text-2xl font-bold text-green-600">
                  {workers.filter(w => w.is_available).length}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tasks.filter(t => t.status === 'active').length}
                </p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-purple-600">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Workers Table - Takes 2 columns */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Workers Management</h3>
            <p className="text-sm text-gray-600 mt-1">Assign tasks to available workers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Domain</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3">
                          {worker.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'W'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                          <div className="text-xs text-gray-500">{worker.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{worker.domain || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{worker.contact || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {worker.city && worker.state ? `${worker.city}, ${worker.state}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          worker.is_available ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span className={`text-sm font-medium ${
                          worker.is_available ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {worker.is_available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleAssignTask(worker)}
                        disabled={!worker.is_available}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Assign Task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Tasks - Takes 1 column */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Recent Tasks</h3>
            <p className="text-sm text-gray-600 mt-1">Tasks you've assigned</p>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No tasks assigned yet</p>
              </div>
            ) : (
              tasks.slice(0, 10).map((task) => (
                <div key={task.id} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{task.task_id}</p>
                      <p className="text-sm text-gray-600">Worker: {task.worker_name}</p>
                      <p className="text-sm text-gray-600">Site: {task.site_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Assignment Modal */}
      {showTaskForm && selectedWorker && (
        <TaskAssignmentForm
          worker={selectedWorker}
          sites={sites}
          onClose={() => {
            setShowTaskForm(false);
            setSelectedWorker(null);
          }}
          onSuccess={handleTaskAssigned}
        />
      )}
    </div>
  );
};

const TaskAssignmentForm = ({ worker, sites, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    site_id: '',
    assigned_area: '',
    task_description: '',
    implementation_date: '',
    implementation_time: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.site_id) newErrors.site_id = 'Site is required';
    if (!formData.assigned_area.trim()) newErrors.assigned_area = 'Assigned area is required';
    if (!formData.task_description.trim()) newErrors.task_description = 'Task description is required';
    if (!formData.implementation_date) newErrors.implementation_date = 'Implementation date is required';
    if (!formData.implementation_time) newErrors.implementation_time = 'Implementation time is required';

    // Check if date is not in the past
    const selectedDate = new Date(formData.implementation_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.implementation_date = 'Implementation date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.createTask({
        worker_id: worker.user_id,
        ...formData
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to assign task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const selectedSite = sites.find(site => site.site_id === formData.site_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Assign Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Worker Info */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">Assigning to:</h4>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {worker.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'W'}
            </div>
            <div>
              <div className="font-medium">{worker.name}</div>
              <div className="text-sm text-gray-600">{worker.user_id} • {worker.domain || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
            <select
              name="site_id"
              value={formData.site_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.site_id ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.site_id}>
                  {site.site_name} - {site.location}
                </option>
              ))}
            </select>
            {errors.site_id && <p className="text-red-500 text-xs mt-1">{errors.site_id}</p>}
          </div>

          {selectedSite && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p><strong>Coordinates:</strong> {selectedSite.latitude}, {selectedSite.longitude}</p>
              <p><strong>Location:</strong> {selectedSite.location}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Area *</label>
            <input
              type="text"
              name="assigned_area"
              value={formData.assigned_area}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.assigned_area ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Tower Section A, Ground Floor"
              required
            />
            {errors.assigned_area && <p className="text-red-500 text-xs mt-1">{errors.assigned_area}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Description *</label>
            <textarea
              name="task_description"
              value={formData.task_description}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.task_description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="3"
              placeholder="Describe the task in detail..."
              required
            />
            {errors.task_description && <p className="text-red-500 text-xs mt-1">{errors.task_description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Implementation Date *</label>
              <input
                type="date"
                name="implementation_date"
                value={formData.implementation_date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.implementation_date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.implementation_date && <p className="text-red-500 text-xs mt-1">{errors.implementation_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Implementation Time *</label>
              <input
                type="time"
                name="implementation_time"
                value={formData.implementation_time}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.implementation_time ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.implementation_time && <p className="text-red-500 text-xs mt-1">{errors.implementation_time}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </div>
              ) : (
                'Assign Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
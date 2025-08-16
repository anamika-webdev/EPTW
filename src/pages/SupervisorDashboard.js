import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileDropdown } from '../components/ProfileDropdown';
import api from '../services/api';
import PTWFormModal from '../components/PTWFormModal';
import PTWFinalAuthorizationModal from '../components/PTWFinalAuthorizationModal';
import TaskAssignmentForm from '../components/TaskAssignmentForm';
import { TASK_STATUS_COLORS } from '../utils/constants';

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [sites, setSites] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPTWForm, setShowPTWForm] = useState(false);
  const [selectedWorkerForPTW, setSelectedWorkerForPTW] = useState(null);
  const [ptwToAuthorize, setPtwToAuthorize] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [nextPermitNumber, setNextPermitNumber] = useState('');
  const [preselectedSite, setPreselectedSite] = useState(null); 
  const [prefilledTaskDetails, setPrefilledTaskDetails] = useState(null);

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

  const loadNotifications = async () => {
    try {
      const data = await api.getActiveTasksCount(user.user_id);
      setNotifications(data.count);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications(0);
    }
  };

  const loadData = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, loadData]);

  const handleCreateTask = async (taskData) => {
    try {
      await api.createTask({
        supervisor_id: user.user_id,
        ...taskData,
      });
      loadData();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };
  
  const handleRegularTaskAssign = async (worker) => {
    if (!worker.is_available) {
      alert('This worker is currently busy with another task.');
      return;
    }
    try {
      const ptwNumber = await api.getNextPermitNumber();
      setNextPermitNumber(ptwNumber.permit_number);
      setSelectedWorker(worker);
      setPreselectedSite(null);
      setPrefilledTaskDetails(null);
      setShowTaskForm(true);
    } catch (error) {
      alert('Failed to generate permit number.');
      console.error('Error fetching permit number:', error);
    }
  };
  
  const handleInitiatePTW = async (worker) => {
    if (!worker.is_available) {
      alert('This worker is currently busy with another task.');
      return;
    }
    try {
      const ptwNumber = await api.getNextPermitNumber();
      setNextPermitNumber(ptwNumber.permit_number);
      setSelectedWorkerForPTW(worker);
      setShowPTWForm(true);
    } catch (error) {
      alert('Failed to generate permit number.');
      console.error('Error fetching permit number:', error);
    }
  };
  
  const handleAuthorizePTW = async (task, authorizationData) => {
    try {
      await api.authorizePtw(task.task_id, authorizationData);
      
      const workerToAssign = workers.find(worker => worker.user_id === task.worker_id);
      if (workerToAssign) {
        setSelectedWorker(workerToAssign);
        setNextPermitNumber(task.permit_number);
        setPreselectedSite({ site_id: task.site_id, site_name: task.site_name });
        setPrefilledTaskDetails({
          assigned_area: task.location_of_work,
          task_description: task.work_description,
        });
        setShowTaskForm(true);
      }
      
      setPtwToAuthorize(null);
    } catch (error) {
      console.error('Error authorizing PTW:', error);
      throw error;
    }
  };

  const handleCancelPTW = async (task) => {
    if (window.confirm(`Are you sure you want to cancel the PTW for Permit No. ${task.permit_number}?`)) {
      try {
        await api.cancelPtw(task.task_id);
        loadData();
      } catch (error) {
        console.error('Error canceling PTW:', error);
        alert('Failed to cancel PTW. Please try again.');
      }
    }
  };

  const handleTaskAssigned = () => {
    setShowTaskForm(false);
    setSelectedWorker(null);
    setShowPTWForm(false);
    setSelectedWorkerForPTW(null);
    setPreselectedSite(null);
    setPrefilledTaskDetails(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const assignedTasks = tasks.filter(task => task.task_type !== 'ptw');
  const ptwTasks = tasks.filter(task => task.task_type === 'ptw');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <ProfileDropdown position="right" />
        </div>
        
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
                  {assignedTasks.filter(t => t.status !== 'completed').length}
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

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md">
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
                {workers.map((worker) => {
                  const hasPtwInitiatedTask = tasks.some(task => task.worker_id === worker.user_id && task.status === 'ptw_initiated');
                  const isAvailable = worker.is_available;
                  let statusText;
                  let statusColor;

                  if (hasPtwInitiatedTask) {
                    statusText = 'PTW Initiated';
                    statusColor = 'bg-orange-500';
                  } else if (isAvailable) {
                    statusText = 'Available';
                    statusColor = 'bg-green-500';
                  } else {
                    statusText = 'Busy';
                    statusColor = 'bg-red-500';
                  }

                  return (
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
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${statusColor}`}></span>
                          <span className={`text-sm font-medium ${
                            hasPtwInitiatedTask ? 'text-orange-800' : isAvailable ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {statusText}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInitiatePTW(worker)}
                            disabled={!isAvailable}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            Initiate PTW
                          </button>
                          <button
                            onClick={() => handleRegularTaskAssign(worker)}
                            disabled={!isAvailable}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            Assign Task
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Recent Tasks</h3>
            <p className="text-sm text-gray-600 mt-1">Tasks you've assigned</p>
          </div>
          <div className="p-4 overflow-x-auto max-h-96">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No tasks assigned yet</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Task ID</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Permit No.</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Site</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Worker Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {new Date(task.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{task.task_id}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{task.permit_number || 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{task.site_name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{task.worker_name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'ptw_initiated' ? 'bg-orange-100 text-orange-800' :
                          task.status === 'ptw_submitted' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm flex gap-2">
                        {task.status === 'ptw_submitted' && (
                          <>
                            <button
                              onClick={() => setPtwToAuthorize(task)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
                            >
                              Authorize
                            </button>
                            <button
                              onClick={() => handleCancelPTW(task)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      
      {showTaskForm && selectedWorker && (
        <TaskAssignmentForm
          worker={selectedWorker}
          sites={sites}
          onClose={() => {
            setShowTaskForm(false);
            setSelectedWorker(null);
          }}
          onSuccess={handleTaskAssigned}
          permitNumber={nextPermitNumber}
          preselectedSite={preselectedSite}
          prefilledDetails={prefilledTaskDetails}
        />
      )}
      
      {showPTWForm && selectedWorkerForPTW && (
        <PTWFormModal
          worker={selectedWorkerForPTW}
          sites={sites}
          onClose={() => setShowPTWForm(false)}
          onAssignTask={handleCreateTask}
          permitNumber={nextPermitNumber}
        />
      )}
      
      {ptwToAuthorize && (
        <PTWFinalAuthorizationModal
          task={ptwToAuthorize}
          onClose={() => setPtwToAuthorize(null)}
          onAuthorize={handleAuthorizePTW}
        />
      )}
    </div>
  );
};
export default SupervisorDashboard;
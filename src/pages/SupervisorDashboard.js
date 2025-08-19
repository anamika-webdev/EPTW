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
    setNextPermitNumber(''); 
    setSelectedWorker(worker);
    setPreselectedSite(null);
    setPrefilledTaskDetails(null);
    setShowTaskForm(true);
  };
  
  const handleInitiatePTW = async (worker) => {
    if (!worker.is_available) {
      alert('This worker is currently busy with another task.');
      return;
    }
    setNextPermitNumber(''); 
    setSelectedWorkerForPTW(worker);
    setShowPTWForm(true);
  };
  
  const handleAuthorizePTW = async (task, authorizationData) => {
    try {
      const ptwNumberResponse = await api.getNextPermitNumber();
      const permitNumber = ptwNumberResponse.permit_number;
  
      await api.authorizePtw(task.task_id, {
        ...authorizationData,
        permit_number: permitNumber,
      });
      
      const workerToAssign = workers.find(worker => worker.user_id === task.worker_id);
      if (workerToAssign) {
        setSelectedWorker(workerToAssign);
        setNextPermitNumber(permitNumber);
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
    // Set a max height for the whole container to prevent body scroll
    <div className="p-4 max-w-screen-2xl mx-auto h-screen flex flex-col">
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Supervisor Dashboard</h2>
          <ProfileDropdown position="right" />
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600">Total Workers</p>
            <p className="text-2xl font-bold text-blue-600">{workers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600">Available Workers</p>
            <p className="text-2xl font-bold text-green-600">{workers.filter(w => w.is_available).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-600">Active Tasks</p>
            <p className="text-2xl font-bold text-yellow-600">{assignedTasks.filter(t => t.status !== 'completed').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
            <p className="text-2xl font-bold text-purple-600">{tasks.filter(t => t.status === 'completed').length}</p>
          </div>
        </div>
      </div>

      {/* Main content area - tables */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
        
        {/* Left Column: Workers Management */}
        <div className="bg-white rounded-lg shadow-md flex flex-col">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-800">Workers Management</h3>
          </div>
          <div className="overflow-auto flex-grow">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Worker</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workers.map((worker) => {
                   const isAvailable = worker.is_available;
                   let statusText = isAvailable ? 'Available' : 'Busy';
                   let statusColor = isAvailable ? 'bg-green-500' : 'bg-red-500';
                   return (
                    <tr key={worker.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                        <div className="text-xs text-gray-500">{worker.user_id}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${statusColor}`}></span>
                          <span className={`text-sm font-medium ${isAvailable ? 'text-green-800' : 'text-red-800'}`}>{statusText}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleInitiatePTW(worker)} disabled={!isAvailable} className="bg-purple-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50">PTW</button>
                          <button onClick={() => handleRegularTaskAssign(worker)} disabled={!isAvailable} className="bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50">Task</button>
                        </div>
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Task Tables */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Recent Tasks Table */}
          <div className="bg-white rounded-lg shadow-md flex flex-col h-1/2">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">Recent Tasks</h3>
            </div>
            <div className="overflow-auto flex-grow">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Task ID</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Worker</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{task.task_id}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{task.worker_name}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${TASK_STATUS_COLORS[task.status]?.bg} ${TASK_STATUS_COLORS[task.status]?.text}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permit to Work (PTW) Table */}
          <div className="bg-white rounded-lg shadow-md flex flex-col h-1/2">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">Permit to Work (PTW)</h3>
            </div>
            <div className="overflow-auto flex-grow">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Task ID</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Worker</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ptwTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{task.task_id}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{task.worker_name}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${TASK_STATUS_COLORS[task.status]?.bg} ${TASK_STATUS_COLORS[task.status]?.text}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm flex gap-2">
                        {task.status === 'ptw_submitted' && (
                          <>
                            <button onClick={() => setPtwToAuthorize(task)} className="bg-green-600 text-white text-xs px-3 py-1 rounded">Authorize</button>
                            <button onClick={() => handleCancelPTW(task)} className="bg-red-600 text-white text-xs px-3 py-1 rounded">Cancel</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {showTaskForm && selectedWorker && (
        <TaskAssignmentForm
          worker={selectedWorker}
          sites={sites}
          onClose={() => {setShowTaskForm(false); setSelectedWorker(null);}}
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
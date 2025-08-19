import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileDropdown } from '../components/ProfileDropdown';
import api from '../services/api';
import PTWFormModal from '../components/PTWFormModal';
import PTWFinalAuthorizationModal from '../components/PTWFinalAuthorizationModal';
import TaskAssignmentForm from '../components/TaskAssignmentForm';
import PTWDetailsModal from '../components/PTWDetailsModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
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
  const [notifications, setNotifications] = useState([]);
  const [nextPermitNumber, setNextPermitNumber] = useState('');
  const [nextTaskNumber, setNextTaskNumber] = useState('');
  const [preselectedSite, setPreselectedSite] = useState(null);
  const [prefilledTaskDetails, setPrefilledTaskDetails] = useState(null);
  const [authorizedPermitNumber, setAuthorizedPermitNumber] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [taskForAssignment, setTaskForAssignment] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [viewingPtw, setViewingPtw] = useState(null);

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
      const submittedPtw = data.filter(task => task.status === 'ptw_submitted');
      setNotifications(submittedPtw);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadWorkers(), loadSites(), loadTasks()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadTasks, 30000); // Refresh tasks for notifications
    return () => clearInterval(interval);
  }, [user, loadData]);

  const handleCreateTask = async (taskData) => {
    try {
      const numberResponse = await api.getNextPermitNumber();
      let taskId;
      if (taskData.task_type === 'ptw') {
        taskId = numberResponse.request_number;
      } else {
        taskId = numberResponse.task_number;
      }

      await api.createTask({
        supervisor_id: user.user_id,
        ...taskData,
        task_id: taskId,
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
    const numberResponse = await api.getNextPermitNumber();
    setNextTaskNumber(numberResponse.task_number);
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
    const numberResponse = await api.getNextPermitNumber();
    setNextPermitNumber(numberResponse.request_number);
    setSelectedWorkerForPTW(worker);
    setShowPTWForm(true);
  };

  const handleAuthorizePTW = async (task, authorizationData) => {
    try {
      const numberResponse = await api.getNextPermitNumber();
      const permitNumber = numberResponse.permit_number;

      await api.authorizePtw(task.task_id, {
        ...authorizationData,
        permit_number: permitNumber,
      });

      setAuthorizedPermitNumber(permitNumber);
      setTaskForAssignment(task);
      setShowSuccessPopup(true);
      setPtwToAuthorize(null);
      loadData();
    } catch (error) {
      console.error('Error authorizing PTW:', error);
      throw error;
    }
  };
  
  const openTaskAssignmentFromPopup = () => {
      setShowSuccessPopup(false);
      const workerToAssign = workers.find(w => w.user_id === taskForAssignment.worker_id);
      if (workerToAssign) {
          api.getNextPermitNumber().then(res => {
              setNextTaskNumber(res.task_number);
              setSelectedWorker(workerToAssign);
              setPreselectedSite({ site_id: taskForAssignment.site_id, site_name: taskForAssignment.site_name });
              setPrefilledTaskDetails({
                  assigned_area: taskForAssignment.location_of_work,
                  task_description: taskForAssignment.work_description,
                  permit_number: authorizedPermitNumber,
              });
              setShowTaskForm(true);
          });
      }
  };

  const handleCancelPTW = async (task) => {
    if (window.confirm(`Are you sure you want to cancel the PTW for Request No. ${task.task_id}?`)) {
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
    setTaskForAssignment(null);
    loadData();
  };

  const handleViewTask = async (task) => {
    try {
      const detailedTask = await api.getTaskDetails(task.task_id);
      setViewingTask(detailedTask);
    } catch (error) {
      console.error('Error fetching task details:', error);
      alert('Could not load task details.');
    }
  };

  const handleViewPtw = async (ptw) => {
    try {
      const detailedPtw = await api.getTaskDetails(ptw.task_id);
      setViewingPtw(detailedPtw);
    } catch (error) {
      console.error('Error fetching PTW details:', error);
      alert('Could not load PTW details.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const assignedTasks = tasks.filter(task => task.task_type !== 'ptw' );
  const ptwTasks = tasks.filter(task => task.task_type === 'ptw');

  return (
    <div className="p-4 max-w-screen-2xl mx-auto h-screen flex flex-col">
       <div className="flex-shrink-0">
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-bold text-gray-800">Supervisor Dashboard</h2>
           <div className="flex items-center">
             <div className="relative mr-4">
               <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
               {notifications.length > 0 && (
                 <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{notifications.length}</span>
               )}
             </div>
             <ProfileDropdown position="right" />
           </div>
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

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
        
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

        <div className="flex flex-col gap-4 overflow-hidden">
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
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
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
                      <td className="px-4 py-2 text-sm">
                        <button onClick={() => handleViewTask(task)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md flex flex-col h-1/2">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">Permit to Work (PTW)</h3>
            </div>
            <div className="overflow-auto flex-grow">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Request No.</th>
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
                          {task.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm flex gap-2">
                        <button onClick={() => handleViewPtw(task)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs">View</button>
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
          taskNumber={nextTaskNumber}
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
          requestNumber={nextPermitNumber}
        />
      )}
      
      {ptwToAuthorize && (
        <PTWFinalAuthorizationModal
          task={ptwToAuthorize}
          onClose={() => setPtwToAuthorize(null)}
          onAuthorize={handleAuthorizePTW}
        />
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-xl font-bold mb-2">Permit Authorized!</h3>
            <p className="mb-4">Permit Number: <span className="font-semibold">{authorizedPermitNumber}</span> has been generated.</p>
            <button
              onClick={openTaskAssignmentFromPopup}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Assign Task
            </button>
          </div>
        </div>
      )}

      {viewingTask && (
        <TaskDetailsModal task={viewingTask} onClose={() => setViewingTask(null)} />
      )}

      {viewingPtw && (
        <PTWDetailsModal ptw={viewingPtw} onClose={() => setViewingPtw(null)} />
      )}
    </div>
  );
};
export default SupervisorDashboard;
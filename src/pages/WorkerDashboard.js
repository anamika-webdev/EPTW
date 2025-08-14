import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileDropdown } from '../components/ProfileDropdown';
import TaskCard from '../components/TaskCard';
import api from '../services/api';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Set up polling for notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTasks(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await api.getTasks({ worker_id: user.user_id });
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
    }
  };

  const handleTaskAction = async (taskId, action, file = null) => {
    const formData = new FormData();
    formData.append('action', action);
    if (file) {
      formData.append('image', file);
    }

    try {
      await api.updateTaskStatus(taskId, formData);
      await loadData(); // Reload both tasks and notifications
    } catch (error) {
      console.error('Error updating task:', error);
      throw error; // Re-throw to let TaskCard handle the error display
    }
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'active':
        return tasks.filter(task => task.status === 'active');
      case 'in_progress':
        return tasks.filter(task => task.status === 'in_progress');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      default:
        return tasks;
    }
  };

  const getTaskCounts = () => {
    return {
      active: tasks.filter(task => task.status === 'active').length,
      in_progress: tasks.filter(task => task.status === 'in_progress').length,
      completed: tasks.filter(task => task.status === 'completed').length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const taskCounts = getTaskCounts();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        {/* Header with Profile and Notifications */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            
            
            {/* Profile Dropdown */}
            <ProfileDropdown position="right" />
          </div>
          {/* Notification Bell */}
            <div className="relative">
              <div className="text-3xl cursor-pointer hover:scale-110 transition-transform duration-200">
                🔔
              </div>
              {notifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold notification-badge">
                  {notifications}
                </span>
              )}
              <div className="text-center mt-1">
                <div className="text-xs text-gray-600">Active Tasks</div>
                <div className="text-sm font-bold text-blue-600">{notifications}</div>
              </div>
            </div>
        </div>
      </div>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Active Tasks</h3>
              <p className="text-3xl font-bold text-yellow-600">{taskCounts.active}</p>
              <p className="text-xs text-gray-500 mt-1">Ready to start</p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">In Progress</h3>
              <p className="text-3xl font-bold text-blue-600">{taskCounts.in_progress}</p>
              <p className="text-xs text-gray-500 mt-1">Currently working</p>
            </div>
            <div className="text-4xl">🔄</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{taskCounts.completed}</p>
              <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
          <div className="text-center">
            <div className="font-semibold text-gray-800">Total Tasks</div>
            <div className="text-lg font-bold text-blue-600">{tasks.length}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">Completion Rate</div>
            <div className="text-lg font-bold text-green-600">
              {tasks.length > 0 ? Math.round((taskCounts.completed / tasks.length) * 100) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">Tasks This Month</div>
            <div className="text-lg font-bold text-purple-600">
              {tasks.filter(task => {
                const taskDate = new Date(task.created_at);
                const now = new Date();
                return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">Status</div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              <div className="text-lg font-bold text-green-600">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Navigation and Content */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'active', label: 'Active', count: taskCounts.active, icon: '⚡', color: 'yellow' },
              { key: 'in_progress', label: 'Work In Progress', count: taskCounts.in_progress, icon: '🔄', color: 'blue' },
              { key: 'completed', label: 'Completed', count: taskCounts.completed, icon: '✅', color: 'green' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? `border-b-2 border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } transition-all duration-200`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === tab.key
                    ? `bg-${tab.color}-100 text-${tab.color}-700`
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Task Content */}
        <div className="p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === 'active' && '⚡'}
                {activeTab === 'in_progress' && '🔄'}
                {activeTab === 'completed' && '✅'}
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No {activeTab.replace('_', ' ')} tasks
              </h3>
              <p className="text-gray-500">
                {activeTab === 'active' && 'No new tasks assigned yet. Check back later!'}
                {activeTab === 'in_progress' && 'No tasks currently in progress.'}
                {activeTab === 'completed' && 'No completed tasks yet. Start working on your active tasks!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onAction={handleTaskAction}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
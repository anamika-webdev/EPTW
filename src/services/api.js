const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    if (options.body && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    } else if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials
    });
  }

  getUsers(userType) {
    const query = userType ? `?user_type=${userType}` : '';
    return this.request(`/users${query}`);
  }

  getUser(id) {
    return this.request(`/users/${id}`);
  }

  createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: data
    });
  }

  updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  bulkDeleteUsers(userIds) {
    return this.request('/users/bulk-delete', {
      method: 'POST',
      body: { userIds }
    });
  }

  searchUsers(query) {
    return this.request(`/users/search/${encodeURIComponent(query)}`);
  }

  getWorkers() {
    return this.request('/workers');
  }

  getSites() {
    return this.request('/sites');
  }

  getSite(id) {
    return this.request(`/sites/${id}`);
  }

  createSite(data) {
    return this.request('/sites', {
      method: 'POST',
      body: data
    });
  }

  updateSite(id, data) {
    return this.request(`/sites/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  deleteSite(id) {
    return this.request(`/sites/${id}`, {
      method: 'DELETE'
    });
  }

  bulkDeleteSites(siteIds) {
    return this.request('/sites/bulk-delete', {
      method: 'POST',
      body: { siteIds }
    });
  }

  searchSites(query) {
    return this.request(`/sites/search/${encodeURIComponent(query)}`);
  }

  getTasks(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  createTask(data) {
    return this.request('/tasks', {
      method: 'POST',
      body: data
    });
  }

  updateTask(id, data) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  updateTaskStatus(taskId, formData) {
    return this.request(`/tasks/${taskId}/status`, {
      method: 'PUT',
      body: formData
    });
  }

  deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }

  getActiveTasksCount(workerId) {
    return this.request(`/workers/${workerId}/active-tasks-count`);
  }

  getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async handleApiCall(apiFunction, errorMessage = 'Operation failed') {
    try {
      return await apiFunction();
    } catch (error) {
      console.error(errorMessage, error);
      throw new Error(error.message || errorMessage);
    }
  }

  async batchRequest(requests) {
    try {
      const results = await Promise.all(requests.map(request => 
        this.request(request.endpoint, request.options)
      ));
      return results;
    } catch (error) {
      console.error('Batch request failed:', error);
      throw error;
    }
  }

  uploadFile(file, endpoint = '/upload') {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request(endpoint, {
      method: 'POST',
      body: formData
    });
  }

  exportUsers(format = 'json') {
    return this.request(`/users/export?format=${format}`, {
      method: 'GET'
    });
  }

  exportSites(format = 'json') {
    return this.request(`/sites/export?format=${format}`, {
      method: 'GET'
    });
  }

  exportTasks(params = {}, format = 'json') {
    const query = new URLSearchParams({ ...params, format }).toString();
    return this.request(`/tasks/export?${query}`, {
      method: 'GET'
    });
  }

  advancedSearch(type, filters) {
    return this.request(`/${type}/advanced-search`, {
      method: 'POST',
      body: filters
    });
  }

  getPaginated(endpoint, page = 1, limit = 10, params = {}) {
    const query = new URLSearchParams({
      page,
      limit,
      ...params
    }).toString();
    
    return this.request(`${endpoint}?${query}`);
  }

  clearCache() {
    return Promise.resolve();
  }

  healthCheck() {
    return this.request('/health');
  }

  getAnalytics(type, timeRange = '7d') {
    return this.request(`/analytics/${type}?range=${timeRange}`);
  }

  getUserActivity(userId, timeRange = '7d') {
    return this.request(`/users/${userId}/activity?range=${timeRange}`);
  }

  getSiteUtilization(siteId, timeRange = '30d') {
    return this.request(`/sites/${siteId}/utilization?range=${timeRange}`);
  }

  getTaskMetrics(timeRange = '30d') {
    return this.request(`/tasks/metrics?range=${timeRange}`);
  }

  getNotifications(userId) {
    return this.request(`/users/${userId}/notifications`);
  }

  markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  getUserSettings(userId) {
    return this.request(`/users/${userId}/settings`);
  }

  updateUserSettings(userId, settings) {
    return this.request(`/users/${userId}/settings`, {
      method: 'PUT',
      body: settings
    });
  }

  subscribeToUpdates(callback) {
    console.log('Real-time updates not yet implemented');
  }

  unsubscribeFromUpdates() {
    console.log('Unsubscribing from real-time updates');
  }
}

const api = new ApiService();
export default api;
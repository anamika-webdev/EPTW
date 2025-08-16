import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('supervisors');
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [ptws, setPtws] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingSite, setEditingSite] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddSite, setShowAddSite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadSites(),
        loadStats(),
        loadPtws()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
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
  
  const loadPtws = async () => {
    try {
      const data = await api.getAuthorizedPTWs();
      setPtws(data);
    } catch (error) {
      console.error('Error loading PTW authorizations:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // User CRUD operations
  const handleAddUser = async (userData) => {
    try {
      await api.createUser(userData);
      setShowAddUser(false);
      await loadUsers();
      await loadStats();
      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await api.updateUser(editingUser.id, userData);
      setEditingUser(null);
      await loadUsers();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await api.deleteUser(userId);
        await loadUsers();
        await loadStats();
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. User may have active tasks.');
      }
    }
  };

  // Site CRUD operations
  const handleAddSite = async (siteData) => {
    try {
      await api.createSite(siteData);
      setShowAddSite(false);
      await loadSites();
      await loadStats();
      alert('Site created successfully!');
    } catch (error) {
      console.error('Error creating site:', error);
      alert('Failed to create site');
    }
  };

  const handleUpdateSite = async (siteData) => {
    try {
      await api.updateSite(editingSite.id, siteData);
      setEditingSite(null);
      await loadSites();
      alert('Site updated successfully!');
    } catch (error) {
      console.error('Error updating site:', error);
      alert('Failed to update site');
    }
  };

  const handleDeleteSite = async (siteId, siteName) => {
    if (window.confirm(`Are you sure you want to delete site "${siteName}"? This action cannot be undone.`)) {
      try {
        await api.deleteSite(siteId);
        await loadSites();
        await loadStats();
        alert('Site deleted successfully!');
      } catch (error) {
        console.error('Error deleting site:', error);
        alert('Failed to delete site. Site may have active tasks.');
      }
    }
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
     
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers} color="bg-blue-500" />
          <StatCard title="Total Sites" value={stats.totalSites} color="bg-green-500" />
          <StatCard title="Active Tasks" value={stats.activeTasks} color="bg-yellow-500" />
          <StatCard title="Completed Tasks" value={stats.completedTasks} color="bg-purple-500" />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            {['supervisors', 'workers', 'sites', 'ptw'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } transition-colors duration-200`}
              >
                {tab}
                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {tab === 'sites' 
                    ? sites.length 
                    : tab === 'ptw'
                    ? ptws.length
                    : users.filter(user => user.user_type === tab.slice(0, -1)).length
                  }
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'supervisors' && (
            <UserManagement
              users={users.filter(user => user.user_type === 'supervisor')}
              userType="supervisor"
              onEdit={setEditingUser}
              onDelete={handleDeleteUser}
              onAdd={() => setShowAddUser(true)}
              title="Supervisors"
            />
          )}

          {activeTab === 'workers' && (
            <UserManagement
              users={users.filter(user => user.user_type === 'worker')}
              userType="worker"
              onEdit={setEditingUser}
              onDelete={handleDeleteUser}
              onAdd={() => setShowAddUser(true)}
              title="Workers"
            />
          )}

          {activeTab === 'sites' && (
            <SiteManagement
              sites={sites}
              onEdit={setEditingSite}
              onDelete={handleDeleteSite}
              onAdd={() => setShowAddSite(true)}
            />
          )}
          
          {activeTab === 'ptw' && (
            <PTWManagement ptws={ptws} />
          )}
        </div>
      </div>

      {/* Modals */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onSave={handleUpdateUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {showAddUser && (
        <UserEditModal
          user={null}
          userType={activeTab.slice(0, -1)} // 'supervisors' -> 'supervisor'
          onSave={handleAddUser}
          onClose={() => setShowAddUser(false)}
        />
      )}

      {editingSite && (
        <SiteEditModal
          site={editingSite}
          onSave={handleUpdateSite}
          onClose={() => setEditingSite(null)}
        />
      )}

      {showAddSite && (
        <SiteEditModal
          site={null}
          onSave={handleAddSite}
          onClose={() => setShowAddSite(false)}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatCard = ({ title, value, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center">
      <div className={`${color} rounded-full p-3 mr-4`}>
        <div className="w-6 h-6 text-white">
          {title.includes('Users') && '👥'}
          {title.includes('Sites') && '📍'}
          {title.includes('Active') && '⚡'}
          {title.includes('Completed') && '✅'}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value || 0}</p>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
    </div>
  </div>
);

// User Management Component
const UserManagement = ({ users, userType, onEdit, onDelete, onAdd, title }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold text-gray-800">{title} Management</h3>
      <button
        onClick={onAdd}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
      >
        + Add New {userType.charAt(0).toUpperCase() + userType.slice(1)}
      </button>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Domain</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 text-sm">{user.user_id}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm font-medium">{user.name}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{user.email}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{user.domain}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{user.contact}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{user.city}, {user.state}</td>
              <td className="border border-gray-200 px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(user.id, user.name)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Site Management Component
const SiteManagement = ({ sites, onEdit, onDelete, onAdd }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold text-gray-800">Sites Management</h3>
      <button
        onClick={onAdd}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
      >
        + Add New Site
      </button>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Site ID</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Coordinates</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">City/State</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site.id} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 text-sm font-medium">{site.site_id}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{site.site_name}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{site.location}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{site.latitude}, {site.longitude}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{site.city}, {site.state}</td>
              <td className="border border-gray-200 px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(site)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(site.id, site.site_name)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// New PTW Management Component
const PTWManagement = ({ ptws }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold text-gray-800">PTW Authorizations</h3>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Permit No.</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Site</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Work Description</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Worker</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Authorized By</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
          </tr>
        </thead>
        <tbody>
          {ptws.map((ptw) => (
            <tr key={ptw.task_id} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 text-sm font-medium">{ptw.permit_number}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{ptw.site_name}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{ptw.work_description}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{ptw.worker_name}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{ptw.supervisor_name}</td>
              <td className="border border-gray-200 px-4 py-3 text-sm">{new Date(ptw.authorization_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {ptws.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-4">📭</div>
        <p>No PTW authorizations found.</p>
      </div>
    )}
  </div>
);

// Enhanced User Edit Modal
const UserEditModal = ({ user, userType, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    user_id: user?.user_id || '',
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    contact: user?.contact || '',
    domain: user?.domain || '',
    location: user?.location || '',
    city: user?.city || '',
    state: user?.state || '',
    user_type: user?.user_type || userType || 'worker'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!user && !formData.user_id.trim()) newErrors.user_id = 'User ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!user && !formData.password.trim()) newErrors.password = 'Password is required for new users';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Remove password from update if it's empty
      const submitData = { ...formData };
      if (user && !submitData.password) {
        delete submitData.password;
      }
      
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving user:', error);
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
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-96 overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">
          {user ? `Edit ${user.user_type}` : `Add New ${formData.user_type}`}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
              <input
                type="text"
                name="user_id"
                placeholder="e.g., SUP001, WRK001"
                value={formData.user_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  errors.user_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!!user}
                required
              />
              {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Type *</label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                disabled={!!user}
                required
              >
                <option value="supervisor">Supervisor</option>
                <option value="worker">Worker</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                placeholder="email@company.com"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {!user && '*'}
              </label>
              <input
                type="password"
                name="password"
                placeholder={user ? "Leave blank to keep current password" : "Enter password"}
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required={!user}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <input
                type="text"
                name="contact"
                placeholder="Phone Number"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input
                type="text"
                name="domain"
                placeholder="e.g., Network, Maintenance"
                value={formData.domain}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                placeholder="Office Location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Saving...' : (user ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Site Edit Modal (same as before but with enhanced styling)
const SiteEditModal = ({ site, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    site_id: site?.site_id || '',
    site_name: site?.site_name || '',
    location: site?.location || '',
    latitude: site?.latitude || '',
    longitude: site?.longitude || '',
    city: site?.city || '',
    state: site?.state || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!site && !formData.site_id.trim()) newErrors.site_id = 'Site ID is required';
    if (!formData.site_name.trim()) newErrors.site_name = 'Site name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving site:', error);
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
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-96 overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">
          {site ? 'Edit Site' : 'Add New Site'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site ID *</label>
              <input
                type="text"
                name="site_id"
                placeholder="e.g., SITE001"
                value={formData.site_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  errors.site_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!!site}
                required
              />
              {errors.site_id && <p className="text-red-500 text-xs mt-1">{errors.site_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name *</label>
              <input
                type="text"
                name="site_name"
                placeholder="e.g., Tower A1"
                value={formData.site_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  errors.site_name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.site_name && <p className="text-red-500 text-xs mt-1">{errors.site_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Sector 1, Noida"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  name="latitude"
                  step="any"
                  placeholder="28.5355"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  step="any"
                  placeholder="77.3910"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Saving...' : (site ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
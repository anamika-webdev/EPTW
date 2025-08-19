// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// User Types
export const USER_TYPES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  WORKER: 'worker'
};

// Task Status
export const TASK_STATUS = {
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused', // Added new status
  COMPLETED: 'completed',
  PTW_INITIATED: 'ptw_initiated', 
  PTW_SUBMITTED: 'ptw_submitted', 
  PTW_AUTHORIZED: 'ptw_authorized',
  PTW_CANCELLED: 'ptw_cancelled'
};

// Task Status Labels
export const TASK_STATUS_LABELS = {
  [TASK_STATUS.ACTIVE]: 'Active',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.PAUSED]: 'Paused', // Added new label
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.PTW_INITIATED]: 'PTW Initiated',
  [TASK_STATUS.PTW_SUBMITTED]: 'PTW Submitted',
  [TASK_STATUS.PTW_AUTHORIZED]: 'PTW Authorized',
  [TASK_STATUS.PTW_CANCELLED]: 'PTW Cancelled'
};

// Task Status Colors
export const TASK_STATUS_COLORS = {
  [TASK_STATUS.ACTIVE]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-500'
  },
  [TASK_STATUS.IN_PROGRESS]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-500'
  },
  [TASK_STATUS.PAUSED]: { // Added new color set for Paused
    bg: 'bg-gray-200',
    text: 'text-gray-800',
    border: 'border-gray-400'
  },
  [TASK_STATUS.COMPLETED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-500'
  },
  [TASK_STATUS.PTW_INITIATED]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-500'
  },
  [TASK_STATUS.PTW_SUBMITTED]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-500'
  },
  [TASK_STATUS.PTW_AUTHORIZED]: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-500'
  },
  [TASK_STATUS.PTW_CANCELLED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-500'
  }
};

// Task Actions
export const TASK_ACTIONS = {
  START: 'start',
  PAUSE: 'pause',
  COMPLETE: 'complete'
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif']
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
};

// Routes
export const ROUTES = {
  LOGIN: '/',
  ADMIN: '/admin',
  SUPERVISOR: '/supervisor',
  WORKER: '/worker'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_DATE: 'Please enter a valid date.',
  DATE_IN_PAST: 'Date cannot be in the past.',
  TASK_UPDATE_FAILED: 'Failed to update task. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TASK_ASSIGNED: 'Task assigned successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  USER_UPDATED: 'User updated successfully!',
  SITE_CREATED: 'Site created successfully!',
  SITE_UPDATED: 'Site updated successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully!'
};

// Application Metadata
export const APP_CONFIG = {
  NAME: 'Zuree Telecom-EPTW',
  VERSION: '1.0.0',
  DESCRIPTION: 'Enterprise Task Management System',
  COMPANY: 'Zuree Telecom',
  SUPPORT_EMAIL: 'support@zuree.com'
};

// Theme Configuration
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#3b82f6',
  SECONDARY_COLOR: '#64748b',
  SUCCESS_COLOR: '#10b981',
  WARNING_COLOR: '#f59e0b',
  ERROR_COLOR: '#ef4444',
  INFO_COLOR: '#3b82f6'
};

// Dashboard Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  TASKS: 30000, // 30 seconds
  NOTIFICATIONS: 15000, // 15 seconds
  STATS: 60000 // 1 minute
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[\d\s\-\(\)]{10,}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  DESCRIPTION_MAX_LENGTH: 500
};

// Map Configuration (if using maps)
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 10,
  DEFAULT_CENTER: {
    lat: 28.6139,
    lng: 77.2090 // Delhi, India
  },
  MARKER_COLORS: {
    ACTIVE: '#f59e0b',
    COMPLETED: '#10b981',
    PENDING: '#ef4444'
  }
};

// Export default configuration object
export default {
  API_CONFIG,
  USER_TYPES,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_ACTIONS,
  FILE_CONFIG,
  DATE_FORMATS,
  PAGINATION,
  ROUTES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APP_CONFIG,
  THEME_CONFIG,
  REFRESH_INTERVALS,
  VALIDATION_RULES,
  MAP_CONFIG
};
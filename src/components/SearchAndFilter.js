import React, { useState, useEffect } from 'react';

const SearchAndFilter = ({ 
  onSearch, 
  onFilter, 
  onBulkAction, 
  selectedItems = [], 
  filterOptions = {},
  searchPlaceholder = "Search...",
  showBulkActions = true,
  bulkActions = ['delete']
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, onSearch]);

  useEffect(() => {
    if (onFilter) {
      onFilter(filters);
    }
  }, [filters, onFilter]);

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) {
      alert('Please select items first');
      return;
    }

    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) {
        onBulkAction(action, selectedItems);
      }
    } else {
      onBulkAction(action, selectedItems);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Filter Toggle */}
          {Object.keys(filterOptions).length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <svg className="h-5 w-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </button>
          )}

          {/* Clear Filters */}
          {(searchQuery || Object.keys(filters).some(key => filters[key])) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors duration-200"
            >
              Clear
            </button>
          )}

          {/* Bulk Actions */}
          {showBulkActions && selectedItems.length > 0 && (
            <div className="flex gap-2">
              <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                {selectedItems.length} selected
              </span>
              {bulkActions.map(action => (
                <button
                  key={action}
                  onClick={() => handleBulkAction(action)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    action === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && Object.keys(filterOptions).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(filterOptions).map(([filterKey, options]) => (
              <div key={filterKey}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {filterKey.replace('_', ' ')}
                </label>
                {options.type === 'select' ? (
                  <select
                    value={filters[filterKey] || ''}
                    onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All</option>
                    {options.values.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : options.type === 'date' ? (
                  <input
                    type="date"
                    value={filters[filterKey] || ''}
                    onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={`Filter by ${filterKey.replace('_', ' ')}`}
                    value={filters[filterKey] || ''}
                    onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Table Component with Selection
const EnhancedTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onSelect,
  selectedItems = [],
  showActions = true,
  showSelection = true
}) => {
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setSelectAll(selectedItems.length === data.length && data.length > 0);
  }, [selectedItems, data]);

  const handleSelectAll = () => {
    if (selectAll) {
      onSelect([]);
    } else {
      onSelect(data.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      onSelect(selectedItems.filter(id => id !== itemId));
    } else {
      onSelect([...selectedItems, itemId]);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gray-50">
            {showSelection && (
              <th className="border border-gray-200 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
            )}
            {columns.map((column) => (
              <th 
                key={column.key} 
                className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700"
              >
                {column.label}
              </th>
            ))}
            {showActions && (
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {showSelection && (
                <td className="border border-gray-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className="border border-gray-200 px-4 py-3 text-sm">
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </td>
              ))}
              {showActions && (
                <td className="border border-gray-200 px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item.id, item.name || item.site_name)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📭</div>
          <p>No data found</p>
        </div>
      )}
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmButton: 'bg-red-600 hover:bg-red-700',
          iconBg: 'bg-red-100'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-blue-600 hover:bg-blue-700',
          iconBg: 'bg-blue-100'
        };
      default:
        return {
          icon: '⚠️',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700',
          iconBg: 'bg-yellow-100'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className={`${styles.iconBg} rounded-full p-2 mr-3`}>
            <span className="text-2xl">{styles.icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${styles.confirmButton} text-white rounded-lg font-medium transition-colors duration-200`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export { SearchAndFilter, EnhancedTable, ConfirmationDialog };
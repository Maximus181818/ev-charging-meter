import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, Settings, Car, Plus, Edit2, Trash2, Save, X, Users, FileDown, Filter, ChevronUp, ChevronDown, Calendar } from 'lucide-react';

// Separate component for adding new users to prevent re-render issues
const AddUserComponent = ({ users, onAddUser }) => {
  const [newUserName, setNewUserName] = useState('');
  
  const handleAddUser = () => {
    if (newUserName.trim() && !users.includes(newUserName.trim())) {
      onAddUser(newUserName.trim());
      setNewUserName('');
    }
  };

  return (
    <div className="border-t pt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Add New User</label>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Enter user name"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddUser();
            }
          }}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleAddUser}
          disabled={!newUserName.trim() || users.includes(newUserName.trim())}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
        </button>
      </div>
      {newUserName.trim() && users.includes(newUserName.trim()) && (
        <p className="text-red-500 text-sm mt-1">User already exists</p>
      )}
    </div>
  );
};

const EVChargingMeter = () => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState(['Gal', 'Guy', 'Other']);
  
  // Initialize charging logs from localStorage or default data
  const getInitialChargingLogs = () => {
    // Default data since localStorage is not available
    return [
      { id: 1, user: 'Gal', date: '2025-06-25', duration: 2.5, timestamp: Date.now() },
      { id: 2, user: 'Guy', date: '2025-06-24', duration: 1.5, timestamp: Date.now() },
      { id: 3, user: 'Other', date: '2025-06-23', duration: 3.0, timestamp: Date.now() },
      { id: 4, user: 'Gal', date: '2025-06-20', duration: 2.0, timestamp: Date.now() },
      { id: 5, user: 'Guy', date: '2025-05-28', duration: 1.8, timestamp: Date.now() },
      { id: 6, user: 'Other', date: '2025-05-25', duration: 2.2, timestamp: Date.now() }
    ];
  };

  const [chargingLogs, setChargingLogs] = useState(getInitialChargingLogs);
  
  const [newLog, setNewLog] = useState({
    user: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    durationDisplay: '',
    isDropdownSelected: false,
    isManualInput: false
  });
  
  const [reportFilters, setReportFilters] = useState({
    user: 'all',
    startDate: '',
    endDate: '',
    month: ''
  });
  
  const [editingUser, setEditingUser] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showConfirmDeleteUser, setShowConfirmDeleteUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState('');
  
  // Sorting state for reports table
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Generate time options (30 min to 24 hours, 30 min increments)
  const generateTimeOptions = () => {
    const options = [];
    for (let hours = 0.5; hours <= 24; hours += 0.5) {
      const hoursInt = Math.floor(hours);
      const minutes = (hours % 1) * 60;
      let label;
      
      if (hours < 1) {
        label = `${minutes} min`;
      } else if (minutes === 0) {
        label = `${hoursInt} hour${hoursInt > 1 ? 's' : ''}`;
      } else {
        label = `${hoursInt} hour${hoursInt > 1 ? 's' : ''} ${minutes} min`;
      }
      
      options.push({ value: hours, label });
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Generate consistent color for user based on their name
  const getUserColor = (userName) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    // Create a simple hash from the username to ensure consistency
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use absolute value and modulo to get a valid index
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Generate border style for user frames
  const getUserBorderStyle = (userName) => {
    const colorMap = {
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#10b981', 
      'bg-purple-500': '#8b5cf6',
      'bg-red-500': '#ef4444',
      'bg-yellow-500': '#eab308',
      'bg-indigo-500': '#6366f1',
      'bg-pink-500': '#ec4899',
      'bg-teal-500': '#14b8a6',
      'bg-orange-500': '#f97316',
      'bg-cyan-500': '#06b6d4'
    };
    
    const userColorClass = getUserColor(userName);
    const hexColor = colorMap[userColorClass] || '#6b7280';
    
    return {
      borderColor: hexColor,
      borderWidth: '4px',
      borderStyle: 'solid'
    };
  };

  // Generate gradient class for user cards
  const getUserGradient = (userName) => {
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600', 
      'from-purple-400 to-purple-600',
      'from-red-400 to-red-600',
      'from-yellow-400 to-yellow-600',
      'from-indigo-400 to-indigo-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600',
      'from-orange-400 to-orange-600',
      'from-cyan-400 to-cyan-600'
    ];
    
    // Create a simple hash from the username to ensure consistency
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use absolute value and modulo to get a valid index
    const gradientIndex = Math.abs(hash) % gradients.length;
    return gradients[gradientIndex];
  };

  // Calculate user statistics
  const getUserStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyLogs = chargingLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });

    const totalTime = monthlyLogs.reduce((sum, log) => sum + log.duration, 0);
    
    const userStats = users.map(user => {
      const userLogs = monthlyLogs.filter(log => log.user === user);
      const userTime = userLogs.reduce((sum, log) => sum + log.duration, 0);
      const percentage = totalTime > 0 ? ((userTime / totalTime) * 100) : 0;
      
      return {
        name: user,
        totalTime: userTime,
        percentage: percentage,
        sessions: userLogs.length
      };
    });

    return { userStats, totalTime };
  };

  // Filter reports based on selected criteria
  const getFilteredReports = () => {
    let filtered = [...chargingLogs];

    // Filter by user
    if (reportFilters.user !== 'all') {
      filtered = filtered.filter(log => log.user === reportFilters.user);
    }

    // Filter by month OR date range
    if (reportFilters.month) {
      const [year, month] = reportFilters.month.split('-');
      filtered = filtered.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getFullYear() === parseInt(year) && logDate.getMonth() === parseInt(month) - 1;
      });
    } else if (reportFilters.startDate && reportFilters.endDate) {
      filtered = filtered.filter(log => {
        return log.date >= reportFilters.startDate && log.date <= reportFilters.endDate;
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Table sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort filtered logs based on sort configuration
  const getSortedLogs = (logs) => {
    if (!sortConfig.key) return logs;

    return [...logs].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortConfig.key === 'duration') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortConfig.key === 'user') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const { userStats, totalTime } = getUserStats();

  // Handle new log submission
  const handleSubmitLog = () => {
    if (selectedUser && newLog.date && newLog.duration) {
      const log = {
        id: Date.now(),
        user: selectedUser,
        date: newLog.date,
        duration: parseFloat(newLog.duration),
        timestamp: Date.now()
      };
      setChargingLogs([...chargingLogs, log]);
      setNewLog({ 
        user: '', 
        date: new Date().toISOString().split('T')[0], 
        duration: '', 
        durationDisplay: '', 
        isDropdownSelected: false, 
        isManualInput: false 
      });
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Return to main screen after 2.5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setCurrentView('main');
      }, 2500);
    }
  };

  // Handle admin access with password
  const handleAdminAccess = () => {
    if (adminPassword === 'DBreset18') {
      setCurrentView('admin');
      setShowPasswordPrompt(false);
      setAdminPassword('');
    } else {
      alert('Incorrect password. Access denied.');
      setAdminPassword('');
    }
  };

  // Handle database restart (admin function)
  const handleRestartDatabase = () => {
    setChargingLogs([]);
    setShowConfirmRestart(false);
    // Show a brief confirmation message
    alert('Database restarted successfully! All charging logs have been permanently deleted.');
  };

  // User management functions
  const addUser = (userName) => {
    setUsers([...users, userName]);
  };

  const deleteUser = (userToDelete) => {
    if (users.length > 1) {
      setUserToDelete(userToDelete);
      setShowConfirmDeleteUser(true);
    }
  };

  const confirmDeleteUser = () => {
    setUsers(users.filter(user => user !== userToDelete));
    setShowConfirmDeleteUser(false);
    setUserToDelete('');
  };

  const updateUser = (oldName, newName) => {
    if (newName.trim() && newName.trim() !== oldName && !users.includes(newName.trim())) {
      setUsers(users.map(user => user === oldName ? newName.trim() : user));
      setChargingLogs(chargingLogs.map(log => 
        log.user === oldName ? { ...log, user: newName.trim() } : log
      ));
      setEditingUser(null);
    }
  };

  // Main Screen
  const MainScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="bg-black w-16 h-16 rounded-full flex flex-col items-center justify-center mx-auto mb-4 relative">
              <span className="text-white text-lg font-bold leading-none">ITI</span>
              {/* Lightning/EV Charging Icon positioned below */}
              <svg 
                className="text-white mt-0.5" 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">EV Charging Meter</h1>
          </div>

          <div className="space-y-4">
            {userStats.map((user) => (
              <div
                key={user.name}
                onClick={() => {
                  setSelectedUser(user.name);
                  setNewLog({ ...newLog, user: user.name });
                  setCurrentView('log');
                }}
                className={`bg-gradient-to-r ${getUserGradient(user.name)} text-white p-4 rounded-xl cursor-pointer transform transition-all hover:scale-105 active:scale-95`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-white text-opacity-80 text-sm">{user.sessions} sessions this month</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{user.totalTime.toFixed(1)}h</p>
                    <p className="text-white text-opacity-80 text-sm">{user.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setCurrentView('reports')}
              className="w-full bg-black text-white py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors hover:bg-gray-800 mb-3"
            >
              <BarChart3 size={20} />
              <span>View Reports</span>
            </button>
            
            <button
              onClick={() => setCurrentView('settings')}
              className="w-full bg-black text-white py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors hover:bg-gray-800 mb-3"
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>

            {/* Created by text with small admin button */}
            <div className="flex items-center justify-center space-x-2 mt-3">
              <button
                onClick={() => setShowPasswordPrompt(true)}
                className="bg-red-600 text-white px-2 py-1 rounded text-xs opacity-20 hover:opacity-100 transition-opacity"
                title="Admin Panel"
              >
                A
              </button>
              <p className="text-center text-black text-sm">Created by Guy</p>
            </div>

            {/* Password Prompt Modal */}
            {showPasswordPrompt && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Access Required</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter the admin password to access the control panel:
                    </p>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAdminAccess();
                        } else if (e.key === 'Escape') {
                          setShowPasswordPrompt(false);
                          setAdminPassword('');
                        }
                      }}
                      placeholder="Enter password"
                      className="w-full p-3 border border-gray-300 rounded-lg text-center font-mono text-sm mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      autoFocus
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowPasswordPrompt(false);
                          setAdminPassword('');
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAdminAccess}
                        disabled={!adminPassword.trim()}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Access
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Log Screen with colored frame
  const LogScreen = () => {
    const borderStyle = selectedUser ? getUserBorderStyle(selectedUser) : { borderColor: '#6b7280', borderWidth: '4px', borderStyle: 'solid' };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6" style={borderStyle}>
            <div className="flex items-center mb-6">
              <button
                onClick={() => setCurrentView('main')}
                className="mr-4 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Log Charging Session</h2>
                <p className="text-xl font-bold text-blue-600">{selectedUser}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  onKeyDown={(e) => {
                    // Allow tab, enter, escape, and arrow keys for navigation
                    if (!['Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onInput={(e) => {
                    // Prevent any manual input/typing
                    e.preventDefault();
                  }}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  style={{
                    fontSize: '16px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <div className="space-y-3">
                  <select
                    value={newLog.duration}
                    onChange={(e) => {
                      const selectedOption = timeOptions.find(option => option.value == e.target.value);
                      if (selectedOption) {
                        setNewLog({ 
                          ...newLog, 
                          duration: e.target.value,
                          durationDisplay: selectedOption.label,
                          isDropdownSelected: true,
                          isManualInput: false
                        });
                      } else {
                        setNewLog({ 
                          ...newLog, 
                          duration: '',
                          durationDisplay: '',
                          isDropdownSelected: false,
                          isManualInput: false
                        });
                      }
                    }}
                    disabled={newLog.isManualInput}
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      newLog.isManualInput 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    <option value="">Select duration</option>
                    {timeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  
                  <div className="text-center text-gray-500 text-sm">or</div>
                  
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Enter custom hours (e.g., 2.5)"
                    value={newLog.isDropdownSelected ? '' : newLog.duration}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Limit to one decimal place and numbers only
                      if (value.includes('.')) {
                        const parts = value.split('.');
                        if (parts[1] && parts[1].length > 1) {
                          value = parts[0] + '.' + parts[1].substring(0, 1);
                        }
                      }
                      setNewLog({ 
                        ...newLog, 
                        duration: value,
                        durationDisplay: '',
                        isDropdownSelected: false,
                        isManualInput: value.length > 0
                      });
                    }}
                    disabled={newLog.isDropdownSelected}
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      newLog.isDropdownSelected 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : ''
                    }`}
                  />
                  
                  {newLog.durationDisplay && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                      Selected: {newLog.durationDisplay}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmitLog}
                disabled={!newLog.date || !newLog.duration}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 transition-colors hover:bg-blue-700 disabled:hover:bg-gray-300"
              >
                Submit Log
              </button>

              {/* Success Message */}
              {showSuccessMessage && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Submitted Successfully!</span>
                  </div>
                  <p className="text-sm mt-1">Returning to main screen...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Reports Screen with sorting functionality
  const ReportsScreen = () => {
    // Get current month for default filtering
    const currentDate = new Date();
    
    // Apply default current month filter if no filters are set
    const getDefaultFilteredReports = () => {
      // If no filters are applied, default to current month
      if (reportFilters.user === 'all' && !reportFilters.month && !reportFilters.startDate && !reportFilters.endDate) {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        return chargingLogs.filter(log => {
          const logDate = new Date(log.date);
          return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      
      // Otherwise use the regular filtered results
      return getFilteredReports();
    };

    const filteredLogs = getDefaultFilteredReports();
    const sortedLogs = getSortedLogs(filteredLogs);
    const filteredTotal = filteredLogs.reduce((sum, log) => sum + log.duration, 0);

    // Calculate user summaries for filtered data
    const getUserSummaries = () => {
      const userSummaries = users.map(user => {
        const userLogs = filteredLogs.filter(log => log.user === user);
        const userTime = userLogs.reduce((sum, log) => sum + log.duration, 0);
        const percentage = filteredTotal > 0 ? ((userTime / filteredTotal) * 100) : 0;
        
        return {
          name: user,
          totalTime: userTime,
          percentage: percentage,
          sessions: userLogs.length
        };
      });
      
      return userSummaries;
    };

    const userSummaries = getUserSummaries();

    // Check if we're showing current month (default view)
    const isShowingCurrentMonth = reportFilters.user === 'all' && !reportFilters.month && !reportFilters.startDate && !reportFilters.endDate;

    // Render sort icon
    const renderSortIcon = (column) => {
      if (sortConfig.key !== column) {
        return <ChevronUp className="w-4 h-4 text-gray-400" />;
      }
      return sortConfig.direction === 'asc' ? 
        <ChevronUp className="w-4 h-4 text-blue-600" /> : 
        <ChevronDown className="w-4 h-4 text-blue-600" />;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentView('main')}
                  className="mr-4 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Charging Reports</h2>
                </div>
              </div>
              <button
                onClick={() => {
                  // Create CSV content with proper headers
                  const csvContent = [
                    ['Username', 'Date', 'Duration (hours)'],
                    ...sortedLogs.map(log => [log.user, log.date, log.duration.toString()])
                  ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

                  // Create and download the file
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  
                  // Generate filename based on current filters
                  const currentDate = new Date().toISOString().split('T')[0];
                  let filename;
                  if (isShowingCurrentMonth) {
                    const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '-');
                    filename = `ev-charging-report-${monthYear}.csv`;
                  } else if (reportFilters.month) {
                    const [year, month] = reportFilters.month.split('-');
                    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' });
                    filename = `ev-charging-report-${monthName}-${year}.csv`;
                  } else {
                    filename = `ev-charging-report-${currentDate}.csv`;
                  }
                  
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                }}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <FileDown size={16} />
                <span>Export</span>
              </button>
            </div>

            {/* Period Indicator */}
            <div className={`p-3 rounded-lg mb-4 ${isShowingCurrentMonth ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${isShowingCurrentMonth ? 'text-blue-800' : 'text-gray-800'}`}>
                    {isShowingCurrentMonth ? 'Current Month Report' : 'Filtered Historical Data'}
                  </h3>
                  <p className={`text-sm ${isShowingCurrentMonth ? 'text-blue-600' : 'text-gray-600'}`}>
                    {isShowingCurrentMonth 
                      ? `Showing ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} data`
                      : 'Showing data based on your selected filters'
                    }
                  </p>
                </div>
                {!isShowingCurrentMonth && (
                  <button
                    onClick={() => setReportFilters({ user: 'all', startDate: '', endDate: '', month: '' })}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                  >
                    Back to Current Month
                  </button>
                )}
              </div>
            </div>

            {/* User Summary Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Individual User Boxes */}
              {userSummaries.map((user) => (
                <div key={user.name} className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="font-bold text-sm">{user.name[0]}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-blue-100 text-sm">Total Time</p>
                    <p className="font-bold text-xl">{user.totalTime.toFixed(1)}h</p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100 text-sm">{user.percentage.toFixed(1)}%</span>
                      <span className="text-blue-100 text-sm">{user.sessions} sessions</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Total Summary Box */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">Total</h3>
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="font-bold text-sm">∑</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-green-100 text-sm">All Users</p>
                  <p className="font-bold text-xl">{filteredTotal.toFixed(1)}h</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-100 text-sm">100%</span>
                    <span className="text-green-100 text-sm">{filteredLogs.length} sessions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center">
                  <Filter size={16} className="mr-2" />
                  Historical Data Filters
                </h3>
                <button
                  onClick={() => setReportFilters({ user: 'all', startDate: '', endDate: '', month: '' })}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear Filters (Current Month)
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <select
                    value={reportFilters.user}
                    onChange={(e) => setReportFilters({ ...reportFilters, user: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Users</option>
                    {users.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={reportFilters.month}
                    onChange={(e) => setReportFilters({ ...reportFilters, month: e.target.value, startDate: '', endDate: '' })}
                    disabled={reportFilters.startDate || reportFilters.endDate}
                    className={`w-full p-2 border border-gray-300 rounded-lg text-sm ${
                      reportFilters.startDate || reportFilters.endDate 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    <option value="">Select Month</option>
                    {(() => {
                      const options = [];
                      const currentYear = new Date().getFullYear();
                      const startYear = Math.max(2025, currentYear);
                      const endYear = 2030; // Show up to 2030 only
                      
                      const months = [
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ];
                      
                      for (let year = startYear; year <= endYear; year++) {
                        const startMonth = (year === 2025) ? 5 : 0; // Start from June (index 5) for 2025
                        for (let month = startMonth; month < 12; month++) {
                          const value = `${year}-${String(month + 1).padStart(2, '0')}`;
                          const label = `${months[month]} ${year}`;
                          options.push(
                            <option key={value} value={value}>{label}</option>
                          );
                        }
                      }
                      
                      return options;
                    })()}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value, month: '' })}
                    disabled={reportFilters.month}
                    className={`w-full p-2 border border-gray-300 rounded-lg text-sm ${
                      reportFilters.month 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value, month: '' })}
                    disabled={reportFilters.month}
                    className={`w-full p-2 border border-gray-300 rounded-lg text-sm ${
                      reportFilters.month 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Sortable Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-96 border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b-2 border-gray-200">
                    <th 
                      className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('user')}
                    >
                      <div className="flex items-center justify-between">
                        <span>User</span>
                        {renderSortIcon('user')}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center justify-between">
                        <span>Date</span>
                        {renderSortIcon('date')}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('duration')}
                    >
                      <div className="flex items-center justify-between">
                        <span>Duration</span>
                        {renderSortIcon('duration')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.length > 0 ? sortedLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 flex items-center">
                        <span className={`inline-block w-8 h-8 rounded-full ${getUserColor(log.user)} text-white text-xs flex items-center justify-center mr-3`}>
                          {log.user[0]}
                        </span>
                        {log.user}
                      </td>
                      <td className="py-3 px-4">{log.date}</td>
                      <td className="py-3 px-4">{log.duration} hours</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-gray-500">
                        {isShowingCurrentMonth 
                          ? `No charging sessions recorded for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} yet.`
                          : 'No charging logs found for the selected filters.'
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Settings Screen
  const SettingsScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setCurrentView('main')}
              className="mr-4 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users size={20} className="mr-2" />
                Manage Users
              </h3>

              <div className="space-y-3 mb-4">
                {users.map((user) => (
                  <div key={user} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    {editingUser === user ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          defaultValue={user}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateUser(user, e.target.value);
                            } else if (e.key === 'Escape') {
                              setEditingUser(null);
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.parentElement.querySelector('input');
                            updateUser(user, input.value);
                          }}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-gray-800">{user}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteUser(user)}
                            disabled={users.length <= 1}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <AddUserComponent users={users} onAddUser={addUser} />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Information</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Total Users:</strong> {users.length}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Total Charging Sessions:</strong> {chargingLogs.length}
                </p>
              </div>
            </div>

            {/* User Delete Confirmation Modal */}
            {showConfirmDeleteUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Are you sure you want to delete user <strong>"{userToDelete}"</strong>? 
                      This action cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowConfirmDeleteUser(false);
                          setUserToDelete('');
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        No
                      </button>
                      <button
                        onClick={confirmDeleteUser}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Secret Admin Screen
  const AdminScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-red-200">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setCurrentView('main')}
              className="mr-4 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-red-800">🔒 Admin Panel</h2>
              <p className="text-sm text-red-600">Restricted Access</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Database Management */}
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Database Management
              </h3>
              
              <div className="mb-4">
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Current Database Status:</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    • Total Charging Sessions: <span className="font-semibold text-red-600">{chargingLogs.length}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    • Total Users: <span className="font-semibold text-blue-600">{users.length}</span> (will be preserved)
                  </p>
                  <p className="text-sm text-gray-600">
                    • Total Hours Logged: <span className="font-semibold text-green-600">
                      {chargingLogs.reduce((sum, log) => sum + log.duration, 0).toFixed(1)}h
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This action will permanently delete ALL charging logs. Users will remain unchanged.
                </p>
              </div>

              <button
                onClick={() => setShowConfirmRestart(true)}
                disabled={chargingLogs.length === 0}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
              >
                {chargingLogs.length === 0 ? 'Database Already Empty' : '🗑️ Restart Database'}
              </button>
            </div>

            {/* System Information */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">System Information</h3>
              <div className="space-y-2 text-sm">
                <p className="text-blue-700">
                  <strong>App Version:</strong> 1.0.0
                </p>
                <p className="text-blue-700">
                  <strong>Last Reset:</strong> {chargingLogs.length === 0 ? 'Recently' : 'Never'}
                </p>
                <p className="text-blue-700">
                  <strong>Session Storage:</strong> Browser Memory
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Modal */}
          {showConfirmRestart && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Database Restart</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete all <strong>{chargingLogs.length}</strong> charging logs? 
                    This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowConfirmRestart(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRestartDatabase}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Yes, Delete All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      {currentView === 'main' && <MainScreen />}
      {currentView === 'log' && <LogScreen />}
      {currentView === 'reports' && <ReportsScreen />}
      {currentView === 'settings' && <SettingsScreen />}
      {currentView === 'admin' && <AdminScreen />}
    </div>
  );
};

export default EVChargingMeter;
// Activity Logger Utility
class ActivityLogger {
  static log(action, target, type = 'create') {
    // Get current user from localStorage (you can replace this with your auth store)
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'System', role: 'system' };
    
    const logEntry = {
      id: Date.now(),
      action,
      user: user?.name || 'System',
      userRole: user?.role || 'system',
      target,
      timestamp: new Date().toLocaleString(),
      type, // create, update, delete, view
    };
    
    // Save to localStorage for demo
    const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    existingLogs.unshift(logEntry);
    localStorage.setItem('activityLogs', JSON.stringify(existingLogs.slice(0, 100))); // Keep last 100 logs
    
    console.log('Activity Logged:', logEntry);
    return logEntry;
  }
  
  static getLogs() {
    return JSON.parse(localStorage.getItem('activityLogs') || '[]');
  }
  
  static clearLogs() {
    localStorage.removeItem('activityLogs');
  }
}

export default ActivityLogger;
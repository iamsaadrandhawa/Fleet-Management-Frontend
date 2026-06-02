// src/services/frontendAuditService.js
import api from './api';

class FrontendAuditService {
    /**
     * Send log to backend
     * @param {Object} logData - Log data to send
     */
    static async log(logData) {
        try {
            // Get current user from localStorage
            let user = {};
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    user = JSON.parse(userStr);
                }
            } catch (e) {
                console.error('Failed to get user from localStorage:', e);
            }
            
            const enrichedData = {
                userId: logData.userId || user.id,
                userEmail: logData.userEmail || user.email,
                userRole: logData.userRole || user.role,
                action: logData.action,
                module: logData.module,
                targetId: logData.targetId,
                targetModel: logData.targetModel,
                targetName: logData.targetName,
                changes: logData.changes || {},
                status: logData.status || 'SUCCESS',
                description: logData.description,
                errorMessage: logData.errorMessage,
                metadata: logData.metadata || {},
                requestInfo: {
                    url: window.location.pathname,
                    userAgent: navigator.userAgent,
                    method: 'FRONTEND'
                }
            };
            
            // Send to backend audit log endpoint
            const response = await api.post('/api/audit-logs', enrichedData);
            return response.data;
        } catch (error) {
            console.error('Failed to send audit log:', error);
            // Don't throw - logging shouldn't break the app
            return null;
        }
    }
    
    // Convenience methods for frontend
    static async logCreate(module, targetId, targetName, metadata = {}) {
        return this.log({
            action: 'CREATE',
            module,
            targetId,
            targetModel: this.getModelName(module),
            targetName,
            metadata,
            description: `Created new ${module.toLowerCase()}: ${targetName}`
        });
    }
    
    static async logUpdate(module, targetId, targetName, changes, metadata = {}) {
        return this.log({
            action: 'UPDATE',
            module,
            targetId,
            targetModel: this.getModelName(module),
            targetName,
            changes,
            metadata,
            description: `Updated ${module.toLowerCase()}: ${targetName}`
        });
    }
    
    static async logDelete(module, targetId, targetName, metadata = {}) {
        return this.log({
            action: 'DELETE',
            module,
            targetId,
            targetModel: this.getModelName(module),
            targetName,
            metadata,
            description: `Deleted ${module.toLowerCase()}: ${targetName}`
        });
    }
    
    static async logView(module, targetId, targetName) {
        return this.log({
            action: 'READ',
            module,
            targetId,
            targetModel: this.getModelName(module),
            targetName,
            description: `Viewed ${module.toLowerCase()}: ${targetName}`
        });
    }
    
    static async logLogin(status = 'SUCCESS', errorMessage = null) {
        return this.log({
            action: 'LOGIN',
            module: 'AUTH',
            status,
            errorMessage,
            description: status === 'SUCCESS' ? 'User logged in' : 'Failed login attempt'
        });
    }
    
    static async logLogout() {
        return this.log({
            action: 'LOGOUT',
            module: 'AUTH',
            description: 'User logged out'
        });
    }
    
    static async logExport(module, format = 'CSV', count = 0) {
        return this.log({
            action: 'EXPORT',
            module,
            metadata: { format, count },
            description: `Exported ${module.toLowerCase()} data to ${format} (${count} records)`
        });
    }
    
    static async logUpload(module, fileName, metadata = {}) {
        return this.log({
            action: 'UPLOAD',
            module,
            metadata: { fileName, ...metadata },
            description: `Uploaded ${fileName} to ${module.toLowerCase()}`
        });
    }
    
    static getModelName(module) {
        const map = {
            'USER': 'User',
            'DRIVER': 'Driver',
            'VEHICLE': 'Vehicle',
            'MAINTENANCE': 'Maintenance',
            'ROLE': 'Role',
            'AUTH': 'Auth',
            'SYSTEM': 'System'
        };
        return map[module] || module;
    }
}

export default FrontendAuditService;
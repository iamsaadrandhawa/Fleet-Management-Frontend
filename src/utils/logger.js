// utils/Logger.js
import useLogStore from '../stores/logStore';
import useAuthStore from '../stores/authStore';

// Track recent logs to prevent duplicates
const recentLogs = new Map();

// Clean up old entries every 10 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentLogs.entries()) {
    if (now - timestamp > 2000) { // Remove after 2 seconds
      recentLogs.delete(key);
    }
  }
}, 10000);

class Logger {
  static log(action, entityType, entityId, details = {}) {
    // Create a unique key for this log
    const key = `${action}_${entityType}_${entityId}`;
    const lastTime = recentLogs.get(key);
    const now = Date.now();
    
    // Prevent duplicate logs within 1 second
    if (lastTime && (now - lastTime) < 1000) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[LOG] Duplicate prevented:', { action, entityType, entityId });
      }
      return null;
    }
    
    // Store this log time
    recentLogs.set(key, now);
    
    const { user } = useAuthStore.getState();
    
    const logEntry = {
      action, // 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', etc.
      entityType, // 'DRIVER', 'VEHICLE', 'USER', 'ROLE', 'DESIGNATION', 'LOCATION', 'MAKE', 'FUEL_TYPE', 'TRANSMISSION', etc.
      entityId,
      details,
      userId: user?.id || null,
      userName: user?.name || 'System',
      userEmail: user?.email || 'system@fleet.com',
      userRole: user?.role || 'system',
    };
    
    // Add to store
    useLogStore.getState().addLog(logEntry);
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[LOG]', {
        action,
        entityType,
        entityId,
        user: user?.name || 'System',
        details
      });
    }
    
    return logEntry;
  }
  
  // ==================== AUTH RELATED LOGS ====================
  static login(user) {
    this.log('LOGIN', 'AUTH', user.id, { email: user.email, name: user.name });
  }
  
  static logout(user) {
    this.log('LOGOUT', 'AUTH', user?.id, { email: user?.email, name: user?.name });
  }
  
  // ==================== DRIVER RELATED LOGS ====================
  static createDriver(driver) {
    this.log('CREATE', 'DRIVER', driver.id, { 
      name: driver.fullName, 
      employeeId: driver.employeeId,
      phone: driver.phoneNumber 
    });
  }
  
  static updateDriver(driver) {
    this.log('UPDATE', 'DRIVER', driver.id, { name: driver.fullName });
  }
  
  static deleteDriver(driverId, driverName) {
    this.log('DELETE', 'DRIVER', driverId, { name: driverName });
  }
  
  static viewDriver(driverId, driverName) {
    this.log('VIEW', 'DRIVER', driverId, { name: driverName });
  }
  
  // ==================== VEHICLE RELATED LOGS ====================
  static createVehicle(vehicle) {
    this.log('CREATE', 'VEHICLE', vehicle.id, { 
      make: vehicle.make, 
      model: vehicle.model, 
      registrationNumber: vehicle.registrationNumber,
      year: vehicle.year
    });
  }
  
  static updateVehicle(vehicle) {
    this.log('UPDATE', 'VEHICLE', vehicle.id, { 
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model
    });
  }
  
  static deleteVehicle(vehicleId, registrationNumber) {
    this.log('DELETE', 'VEHICLE', vehicleId, { registrationNumber });
  }
  
  static viewVehicle(vehicleId, registrationNumber) {
    this.log('VIEW', 'VEHICLE', vehicleId, { registrationNumber });
  }
  
  // ==================== USER RELATED LOGS ====================
  static createUser(user) {
    this.log('CREATE', 'USER', user.id, { 
      name: user.name, 
      email: user.email, 
      role: user.role 
    });
  }
  
  static updateUser(user) {
    this.log('UPDATE', 'USER', user.id, { 
      name: user.name, 
      role: user.role 
    });
  }
  
  static deleteUser(userId, userName) {
    this.log('DELETE', 'USER', userId, { name: userName });
  }
  
  // ==================== ROLE RELATED LOGS ====================
  static addRole(role) {
    this.log('CREATE', 'ROLE', role.id || role._id, { 
      name: role.name, 
      code: role.code,
      description: role.description,
      permissions: role.permissions
    });
  }
  
  static updateRole(role) {
    this.log('UPDATE', 'ROLE', role.id || role._id, { 
      name: role.name, 
      code: role.code,
      description: role.description,
      permissions: role.permissions
    });
  }
  
  static deleteRole(roleId, roleName) {
    this.log('DELETE', 'ROLE', roleId, { name: roleName });
  }
  
  static viewRole(roleId, roleName) {
    this.log('VIEW', 'ROLE', roleId, { name: roleName });
  }
  
  // ==================== LEDGER RELATED LOGS - DESIGNATIONS ====================
  static addDesignation(designation) {
    this.log('CREATE', 'DESIGNATION', designation.id || designation._id, { 
      name: designation.name, 
      code: designation.code,
      description: designation.description
    });
  }
  
  static updateDesignation(designation) {
    this.log('UPDATE', 'DESIGNATION', designation.id || designation._id, { 
      name: designation.name, 
      code: designation.code 
    });
  }
  
  static deleteDesignation(designationId, designationName) {
    this.log('DELETE', 'DESIGNATION', designationId, { name: designationName });
  }
  
  // ==================== LEDGER RELATED LOGS - LOCATIONS ====================
  static addLocation(location) {
    this.log('CREATE', 'LOCATION', location.id || location._id, { 
      name: location.name, 
      code: location.code,
      address: location.address,
      city: location.city
    });
  }
  
  static updateLocation(location) {
    this.log('UPDATE', 'LOCATION', location.id || location._id, { 
      name: location.name, 
      code: location.code 
    });
  }
  
  static deleteLocation(locationId, locationName) {
    this.log('DELETE', 'LOCATION', locationId, { name: locationName });
  }
  
  // ==================== LEDGER RELATED LOGS - MAKES ====================
  static addMake(make) {
    this.log('CREATE', 'MAKE', make.id || make._id, { 
      name: make.name, 
      code: make.code,
      country: make.country
    });
  }
  
  static updateMake(make) {
    this.log('UPDATE', 'MAKE', make.id || make._id, { name: make.name });
  }
  
  static deleteMake(makeId, makeName) {
    this.log('DELETE', 'MAKE', makeId, { name: makeName });
  }
  
  // ==================== LEDGER RELATED LOGS - FUEL TYPES ====================
  static addFuelType(fuelType) {
    this.log('CREATE', 'FUEL_TYPE', fuelType.id || fuelType._id, { 
      name: fuelType.name, 
      code: fuelType.code 
    });
  }
  
  static updateFuelType(fuelType) {
    this.log('UPDATE', 'FUEL_TYPE', fuelType.id || fuelType._id, { name: fuelType.name });
  }
  
  static deleteFuelType(fuelTypeId, fuelTypeName) {
    this.log('DELETE', 'FUEL_TYPE', fuelTypeId, { name: fuelTypeName });
  }
  
  // ==================== LEDGER RELATED LOGS - TRANSMISSIONS ====================
  static addTransmission(transmission) {
    this.log('CREATE', 'TRANSMISSION', transmission.id || transmission._id, { 
      name: transmission.name, 
      code: transmission.code 
    });
  }
  
  static updateTransmission(transmission) {
    this.log('UPDATE', 'TRANSMISSION', transmission.id || transmission._id, { name: transmission.name });
  }
  
  static deleteTransmission(transmissionId, transmissionName) {
    this.log('DELETE', 'TRANSMISSION', transmissionId, { name: transmissionName });
  }
  
  // ==================== LEDGER RELATED LOGS - VEHICLE CATEGORIES ====================
  static addVehicleCategory(category) {
    this.log('CREATE', 'VEHICLE_CATEGORY', category.id || category._id, { 
      name: category.name, 
      code: category.code,
      description: category.description
    });
  }
  
  static updateVehicleCategory(category) {
    this.log('UPDATE', 'VEHICLE_CATEGORY', category.id || category._id, { name: category.name });
  }
  
  static deleteVehicleCategory(categoryId, categoryName) {
    this.log('DELETE', 'VEHICLE_CATEGORY', categoryId, { name: categoryName });
  }
}

export default Logger;
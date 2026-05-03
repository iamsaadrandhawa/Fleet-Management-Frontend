import useLogStore from '../stores/logStore';
import useAuthStore from '../stores/authStore';

class Logger {
  static log(action, entityType, entityId, details = {}) {
    const { user } = useAuthStore.getState();
    
    const logEntry = {
      action, // 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', etc. etc
      entityType, // 'DRIVER', 'VEHICLE', 'USER', 'DESIGNATION', 'LOCATION', 'MAKE', 'FUEL_TYPE', 'TRANSMISSION', etc.
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
  
  // Auth related logs
  static login(user) {
    this.log('LOGIN', 'AUTH', user.id, { email: user.email, name: user.name });
  }
  
  static logout(user) {
    this.log('LOGOUT', 'AUTH', user?.id, { email: user?.email, name: user?.name });
  }
  
  // Driver related logs
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
  
  // Vehicle related logs
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
  
  // User related logs
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
  
  // Ledger related logs - Designations
  static addDesignation(designation) {
    this.log('CREATE', 'DESIGNATION', designation.id, { 
      name: designation.name, 
      code: designation.code,
      description: designation.description
    });
  }
  
  static updateDesignation(designation) {
    this.log('UPDATE', 'DESIGNATION', designation.id, { 
      name: designation.name, 
      code: designation.code 
    });
  }
  
  static deleteDesignation(designationId, designationName) {
    this.log('DELETE', 'DESIGNATION', designationId, { name: designationName });
  }
  
  // Ledger related logs - Locations
  static addLocation(location) {
    this.log('CREATE', 'LOCATION', location.id, { 
      name: location.name, 
      code: location.code 
    });
  }
  
  static updateLocation(location) {
    this.log('UPDATE', 'LOCATION', location.id, { 
      name: location.name, 
      code: location.code 
    });
  }
  
  static deleteLocation(locationId, locationName) {
    this.log('DELETE', 'LOCATION', locationId, { name: locationName });
  }
  
  // Ledger related logs - Makes
  static addMake(make) {
    this.log('CREATE', 'MAKE', make.id, { name: make.name, code: make.code });
  }
  
  static updateMake(make) {
    this.log('UPDATE', 'MAKE', make.id, { name: make.name });
  }
  
  static deleteMake(makeId, makeName) {
    this.log('DELETE', 'MAKE', makeId, { name: makeName });
  }
  
  // Ledger related logs - Fuel Types
  static addFuelType(fuelType) {
    this.log('CREATE', 'FUEL_TYPE', fuelType.id, { name: fuelType.name, code: fuelType.code });
  }
  
  static updateFuelType(fuelType) {
    this.log('UPDATE', 'FUEL_TYPE', fuelType.id, { name: fuelType.name });
  }
  
  static deleteFuelType(fuelTypeId, fuelTypeName) {
    this.log('DELETE', 'FUEL_TYPE', fuelTypeId, { name: fuelTypeName });
  }
  
  // Ledger related logs - Transmissions
  static addTransmission(transmission) {
    this.log('CREATE', 'TRANSMISSION', transmission.id, { name: transmission.name, code: transmission.code });
  }
  
  static updateTransmission(transmission) {
    this.log('UPDATE', 'TRANSMISSION', transmission.id, { name: transmission.name });
  }
  
  static deleteTransmission(transmissionId, transmissionName) {
    this.log('DELETE', 'TRANSMISSION', transmissionId, { name: transmissionName });
  }
  
  // Ledger related logs - Vehicle Categories
  static addVehicleCategory(category) {
    this.log('CREATE', 'VEHICLE_CATEGORY', category.id, { name: category.name, code: category.code });
  }
  
  static updateVehicleCategory(category) {
    this.log('UPDATE', 'VEHICLE_CATEGORY', category.id, { name: category.name });
  }
  
  static deleteVehicleCategory(categoryId, categoryName) {
    this.log('DELETE', 'VEHICLE_CATEGORY', categoryId, { name: categoryName });
  }
}

export default Logger;

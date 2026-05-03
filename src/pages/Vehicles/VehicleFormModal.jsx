import { X } from 'lucide-react';
import { useState } from 'react';

export default function VehicleFormModal({ 
  isEditing, 
  vehicle, 
  onSubmit, 
  onClose,
  makes,
  fuelTypes,
  transmissions,
  vehicleCategories,
  drivers
}) {
  const [formData, setFormData] = useState({
    vehicleId: vehicle?.vehicleId || '',
    registrationNumber: vehicle?.registrationNumber || '',
    model: vehicle?.model || '',
    make: vehicle?.make || '',
    year: vehicle?.year || '',
    color: vehicle?.color || '',
    fuelType: vehicle?.fuelType || '',
    transmission: vehicle?.transmission || '',
    seatingCapacity: vehicle?.seatingCapacity || '',
    chassisNumber: vehicle?.chassisNumber || '',
    engineNumber: vehicle?.engineNumber || '',
    registrationDate: vehicle?.registrationDate || '',
    insuranceExpiry: vehicle?.insuranceExpiry || '',
    fitnessExpiry: vehicle?.fitnessExpiry || '',
    pollutionExpiry: vehicle?.pollutionExpiry || '',
    assignedDriver: vehicle?.assignedDriver || '',
    purchaseDate: vehicle?.purchaseDate || '',
    purchasePrice: vehicle?.purchasePrice || '',
    status: vehicle?.status || 'Active',
    vehicleCategory: vehicle?.vehicleCategory || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.color) newErrors.color = 'Color is required';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';
    if (!formData.chassisNumber) newErrors.chassisNumber = 'Chassis number is required';
    if (!formData.engineNumber) newErrors.engineNumber = 'Engine number is required';
    if (!formData.vehicleCategory) newErrors.vehicleCategory = 'Vehicle category is required';
    
    const currentYear = new Date().getFullYear();
    if (formData.year && (formData.year < 1990 || formData.year > currentYear + 1)) {
      newErrors.year = `Year must be between 1990 and ${currentYear + 1}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const activeMakes = makes?.filter(m => m.status === 'Active') || [];
  const activeFuelTypes = fuelTypes?.filter(f => f.status === 'Active') || [];
  const activeTransmissions = transmissions?.filter(t => t.status === 'Active') || [];
  const activeVehicleCategories = vehicleCategories?.filter(c => c.status === 'Active') || [];
  const activeDrivers = drivers?.filter(d => d.status === 'Active') || [];
  const statuses = ['Active', 'Maintenance', 'Repair', 'Inactive'];

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
                <input
                  type="text"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="VH-001"
                  disabled={isEditing}
                />
              </div>

              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.registrationNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ABC-123"
                />
                {errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber}</p>}
              </div>

              {/* Make */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.make ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Make</option>
                  {activeMakes.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
                {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Camry"
                />
                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2023"
                />
                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.color ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="White"
                />
                {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.fuelType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Fuel Type</option>
                  {activeFuelTypes.map(fuel => (
                    <option key={fuel.id} value={fuel.name}>{fuel.name}</option>
                  ))}
                </select>
                {errors.fuelType && <p className="text-red-500 text-xs mt-1">{errors.fuelType}</p>}
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Transmission</option>
                  {activeTransmissions.map(trans => (
                    <option key={trans.id} value={trans.name}>{trans.name}</option>
                  ))}
                </select>
              </div>

              {/* Seating Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  name="seatingCapacity"
                  value={formData.seatingCapacity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="4"
                />
              </div>

              {/* Vehicle Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Category *</label>
                <select
                  name="vehicleCategory"
                  value={formData.vehicleCategory}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.vehicleCategory ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {activeVehicleCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {errors.vehicleCategory && <p className="text-red-500 text-xs mt-1">{errors.vehicleCategory}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Chassis Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number *</label>
                <input
                  type="text"
                  name="chassisNumber"
                  value={formData.chassisNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.chassisNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="CH-123456789"
                />
                {errors.chassisNumber && <p className="text-red-500 text-xs mt-1">{errors.chassisNumber}</p>}
              </div>

              {/* Engine Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Engine Number *</label>
                <input
                  type="text"
                  name="engineNumber"
                  value={formData.engineNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.engineNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="EN-123456789"
                />
                {errors.engineNumber && <p className="text-red-500 text-xs mt-1">{errors.engineNumber}</p>}
              </div>

              {/* Registration Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                <input
                  type="date"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Insurance Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry</label>
                <input
                  type="date"
                  name="insuranceExpiry"
                  value={formData.insuranceExpiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Fitness Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Expiry</label>
                <input
                  type="date"
                  name="fitnessExpiry"
                  value={formData.fitnessExpiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Pollution Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pollution Expiry</label>
                <input
                  type="date"
                  name="pollutionExpiry"
                  value={formData.pollutionExpiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Assigned Driver */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Driver</label>
                <select
                  name="assignedDriver"
                  value={formData.assignedDriver}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Driver</option>
                  {activeDrivers.map(driver => (
                    <option key={driver.id} value={driver.fullName}>
                      {driver.fullName} ({driver.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                <input
                  type="text"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="$ 25,000"
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              {isEditing ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, X, FileText, Car, Gauge } from 'lucide-react';
import useVehicleStore from '../../stores/vehicleStore';
import useLedgerStore from '../../stores/ledgerStore';
import useDriverStore from '../../stores/driverStore';
import logger from '../../utils/logger';

export default function AddVehicle() {
  const [formData, setFormData] = useState({
    vehicleId: '',
    registrationNumber: '',
    model: '',
    make: '',
    year: '',
    color: '',
    fuelType: '',
    transmission: '',
    seatingCapacity: '',
    chassisNumber: '',
    engineNumber: '',
    meterReading: '',
    registrationDate: '',
    insuranceExpiry: '',
    fitnessExpiry: '',
    pollutionExpiry: '',
    assignedDriver: '',
    purchaseDate: '',
    purchasePrice: '',
    status: 'active',
    vehicleCategory: '',
  });

  const [vehicleImages, setVehicleImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get data from stores
  const { addVehicle } = useVehicleStore();
  const { 
    makes, 
    fuelTypes, 
    transmissionTypes: transmissions,
    vehicleCategories,
    fetchMakes, 
    fetchFuelTypes, 
    fetchTransmissions,
    fetchVehicleCategories 
  } = useLedgerStore();
  const { drivers, fetchDrivers } = useDriverStore();

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchMakes(),
        fetchFuelTypes(),
        fetchTransmissions(),
        fetchVehicleCategories(),
        fetchDrivers()
      ]);
    };
    loadData();
  }, []);

  // Debug: Log drivers when loaded
  useEffect(() => {
    console.log('All drivers:', drivers);
    console.log('Unassigned drivers:', activeDrivers);
  }, [drivers]);

  // Get active options from stores with useMemo
  const activeMakes = useMemo(() => 
    makes?.filter(m => m.status === 'active' || m.status === 'Active') || [], 
    [makes]
  );
  
  const activeFuelTypes = useMemo(() => 
    fuelTypes?.filter(f => f.status === 'active' || f.status === 'Active') || [], 
    [fuelTypes]
  );
  
  const activeTransmissions = useMemo(() => 
    transmissions?.filter(t => t.status === 'active' || t.status === 'Active') || [], 
    [transmissions]
  );
  
  const activeVehicleCategories = useMemo(() => 
    vehicleCategories?.filter(c => c.status === 'active' || c.status === 'Active') || [], 
    [vehicleCategories]
  );
  
  // FIXED: Only show drivers that are:
  // 1. Available (status = 'available')
  // 2. NOT assigned to any vehicle (allocatedVehicle is null)
  const activeDrivers = useMemo(() => {
    if (!drivers) return [];
    
    return drivers.filter(driver => {
      const status = driver.status?.toLowerCase();
      const isAvailable = status === 'available' || status === 'active' || status === 'off duty';
      const isNotAssigned = !driver.allocatedVehicle; // Check if driver has no vehicle assigned
      
      return isAvailable && isNotAssigned;
    });
  }, [drivers]);

  const statuses = useMemo(() => ['active', 'inactive', 'in maintenance', 'out of service'], []);

  // Generate vehicle ID
  const generateVehicleId = useCallback(() => {
    const randomNum = Math.floor(Math.random() * 1000);
    return `VH-${String(randomNum).padStart(3, '0')}`;
  }, []);

  // Handle text input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Handle vehicle images upload
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validImages = [];
    const invalidImages = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        invalidImages.push(`${file.name} (exceeds 5MB)`);
      } else if (!file.type.startsWith('image/')) {
        invalidImages.push(`${file.name} (not an image)`);
      } else {
        const imageId = Date.now() + Math.random();
        validImages.push({
          id: imageId,
          file,
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(2),
        });
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, { id: imageId, url: reader.result }]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (invalidImages.length > 0) {
      setErrors(prev => ({ ...prev, images: `Invalid files: ${invalidImages.join(', ')}` }));
    }

    setVehicleImages(prev => [...prev, ...validImages]);
  }, []);

  // Remove vehicle image
  const removeImage = useCallback((id) => {
    setVehicleImages(prev => prev.filter(img => img.id !== id));
    setImagePreviews(prev => prev.filter(preview => preview.id !== id));
  }, []);

  // Handle document upload
  const handleDocumentUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (exceeds 5MB)`);
      } else {
        validFiles.push({
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(2),
          uploadDate: new Date().toLocaleString()
        });
      }
    });

    if (invalidFiles.length > 0) {
      setErrors(prev => ({ ...prev, documents: `Invalid files: ${invalidFiles.join(', ')}` }));
    }

    setDocuments(prev => [...prev, ...validFiles]);
  }, []);

  // Remove document
  const removeDocument = useCallback((id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';
    if (!formData.meterReading) newErrors.meterReading = 'Meter reading is required';
    if (!formData.chassisNumber) newErrors.chassisNumber = 'Chassis number is required';
    if (!formData.engineNumber) newErrors.engineNumber = 'Engine number is required';
    if (!formData.vehicleCategory) newErrors.vehicleCategory = 'Vehicle category is required';
    
    const currentYear = new Date().getFullYear();
    if (formData.year && (formData.year < 1990 || formData.year > currentYear + 1)) {
      newErrors.year = `Year must be between 1990 and ${currentYear + 1}`;
    }
    
    if (formData.meterReading && (formData.meterReading < 0 || isNaN(formData.meterReading))) {
      newErrors.meterReading = 'Meter reading must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const vehicleId = formData.vehicleId || generateVehicleId();
    
    const vehicleData = {
      ...formData,
      vehicleId,
      vehicleNumber: vehicleId,
      company: formData.make,
      meterReading: parseFloat(formData.meterReading) || 0,
      images: vehicleImages.map(img => img.name),
      documents: documents.map(doc => doc.name),
      createdAt: new Date().toISOString()
    };
    
    const result = await addVehicle(vehicleData);
    
    if (result.success) {
      logger.createVehicle({
        id: result.vehicle?.id || Date.now(),
        make: vehicleData.make,
        model: vehicleData.model,
        registrationNumber: vehicleData.registrationNumber,
        year: vehicleData.year,
        vehicleCategory: vehicleData.vehicleCategory,
        meterReading: vehicleData.meterReading
      });
      
      alert('Vehicle added successfully!');
      
      setFormData({
        vehicleId: '',
        registrationNumber: '',
        model: '',
        make: '',
        year: '',
        color: '',
        fuelType: '',
        transmission: '',
        seatingCapacity: '',
        chassisNumber: '',
        engineNumber: '',
        meterReading: '',
        registrationDate: '',
        insuranceExpiry: '',
        fitnessExpiry: '',
        pollutionExpiry: '',
        assignedDriver: '',
        purchaseDate: '',
        purchasePrice: '',
        status: 'active',
        vehicleCategory: '',
      });
      setVehicleImages([]);
      setImagePreviews([]);
      setDocuments([]);
    } else {
      alert('Error adding vehicle: ' + (result.error || 'Unknown error'));
    }
    
    setIsSubmitting(false);
  }, [formData, validateForm, addVehicle, generateVehicleId, vehicleImages, documents]);

  // Helper function to get driver full name
  const getDriverFullName = (driver) => {
    const firstName = driver.firstName || '';
    const lastName = driver.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Unknown Driver';
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Vehicle Images Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
            <Upload size={20} className="text-blue-600" />
            Vehicle Images
          </h2>
          
          <div className="mb-4">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-2">
              <Upload size={16} />
              Upload Vehicle Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Max size per image: 5MB. Allowed: JPG, PNG, JPEG</p>
            {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((preview, idx) => (
                <div key={preview.id} className="relative group">
                  <img
                    src={preview.url}
                    alt={`Vehicle ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(preview.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Basic Information Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
            <Car size={20} className="text-blue-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="VH-001 (Auto-generated if empty)"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, vehicleId: generateVehicleId() }))}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number <span className="text-red-500">*</span></label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make <span className="text-red-500">*</span></label>
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
                  <option key={m._id || m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
              {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model <span className="text-red-500">*</span></label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="White"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type <span className="text-red-500">*</span></label>
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
                  <option key={fuel._id || fuel.id} value={fuel.name}>{fuel.name}</option>
                ))}
              </select>
              {errors.fuelType && <p className="text-red-500 text-xs mt-1">{errors.fuelType}</p>}
            </div>

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
                  <option key={trans._id || trans.id} value={trans.name}>{trans.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seating Capacity</label>
              <input
                type="number"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="4"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Category <span className="text-red-500">*</span></label>
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
                  <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {errors.vehicleCategory && <p className="text-red-500 text-xs mt-1">{errors.vehicleCategory}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meter Reading (km/miles) <span className="text-red-500">*</span></label>
              <div className="relative">
                <Gauge size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="meterReading"
                  value={formData.meterReading}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.meterReading ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
              {errors.meterReading && <p className="text-red-500 text-xs mt-1">{errors.meterReading}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Registration & Documents Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Registration & Documents</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number <span className="text-red-500">*</span></label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Engine Number <span className="text-red-500">*</span></label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry Date</label>
              <input
                type="date"
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Certificate Expiry</label>
              <input
                type="date"
                name="fitnessExpiry"
                value={formData.fitnessExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pollution Certificate Expiry</label>
              <input
                type="date"
                name="pollutionExpiry"
                value={formData.pollutionExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Assignment & Purchase Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Assignment & Purchase</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assigned Driver - ONLY SHOW UNASSIGNED DRIVERS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Driver
              </label>
              <select
                name="assignedDriver"
                value={formData.assignedDriver}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Driver</option>
                {activeDrivers.map(driver => {
                  const driverName = getDriverFullName(driver);
                  return (
                    <option key={driver._id || driver.id} value={driver._id || driver.id}>
                      {driverName} {driver.employeeId ? `(${driver.employeeId})` : ''}
                    </option>
                  );
                })}
              </select>
              {activeDrivers.length === 0 && (
                <div className="mt-2">
                  <p className="text-yellow-500 text-xs">
                    No drivers available. All drivers are either:
                  </p>
                  <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
                    <li>Already assigned to a vehicle</li>
                    <li>Not available (on trip/off duty/suspended)</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/drivers/add'}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    + Add New Driver
                  </button>
                </div>
              )}
              {activeDrivers.length > 0 && (
                <p className="text-xs text-green-500 mt-1">
                  Showing {activeDrivers.length} driver(s) without any vehicle assigned
                </p>
              )}
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="25000"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Vehicle Documents
          </h2>
          
          <div className="mb-4">
            <label className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-2">
              <FileText size={16} />
              Upload Documents (Registration, Insurance, etc.)
              <input
                type="file"
                multiple
                onChange={handleDocumentUpload}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Max size per file: 5MB. Allowed: PDF, JPG, PNG, DOC</p>
            {errors.documents && <p className="text-red-500 text-xs mt-1">{errors.documents}</p>}
          </div>

          {documents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Uploaded Documents:</h3>
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.size} KB • {doc.uploadDate}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-600 hover:text-red-700 transition p-1 hover:bg-red-50 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding Vehicle...' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
}
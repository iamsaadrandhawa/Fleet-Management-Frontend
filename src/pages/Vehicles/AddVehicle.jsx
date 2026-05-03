import { useState, useEffect } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
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
    registrationDate: '',
    insuranceExpiry: '',
    fitnessExpiry: '',
    pollutionExpiry: '',
    assignedDriver: '',
    purchaseDate: '',
    purchasePrice: '',
    status: 'Active',
    vehicleCategory: '',
  });

  const [vehicleImages, setVehicleImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});

  // Get data from stores
  const { addVehicle, isLoading } = useVehicleStore();
  const { 
    makes, 
    fuelTypes, 
    transmissionTypes, 
    vehicleCategories,
    fetchMakes, 
    fetchFuelTypes, 
    fetchTransmissionTypes,
    fetchVehicleCategories 
  } = useLedgerStore();
  const { drivers, fetchDrivers } = useDriverStore();

  // Fetch data on component mount
  useEffect(() => {
    if (fetchMakes) fetchMakes();
    if (fetchFuelTypes) fetchFuelTypes();
    if (fetchTransmissionTypes) fetchTransmissionTypes();
    if (fetchVehicleCategories) fetchVehicleCategories();
    if (fetchDrivers) fetchDrivers();
  }, []);

  // Get active options from stores
  const activeMakes = makes?.filter(m => m.status === 'Active') || [];
  const activeFuelTypes = fuelTypes?.filter(f => f.status === 'Active') || [];
  const activeTransmissions = transmissionTypes?.filter(t => t.status === 'Active') || [];
  const activeStatuses = ['Active', 'Inactive'];
  const activeVehicleCategories = vehicleCategories?.filter(c => c.status === 'Active') || [];
  const activeDrivers = drivers?.filter(d => d.status === 'Active') || [];



  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle vehicle images upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = [];
    const invalidImages = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        invalidImages.push(`${file.name} (exceeds 5MB)`);
      } else if (!file.type.startsWith('image/')) {
        invalidImages.push(`${file.name} (not an image)`);
      } else {
        validImages.push({
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(2),
        });
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, { id: Date.now() + Math.random(), url: reader.result }]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (invalidImages.length > 0) {
      setErrors({ ...errors, images: `Invalid files: ${invalidImages.join(', ')}` });
    }

    setVehicleImages([...vehicleImages, ...validImages]);
  };

  // Remove vehicle image
  const removeImage = (id) => {
    setVehicleImages(vehicleImages.filter(img => img.id !== id));
    setImagePreviews(imagePreviews.filter(preview => preview.id !== id));
  };

  // Handle document upload
  const handleDocumentUpload = (e) => {
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
      setErrors({ ...errors, documents: `Invalid files: ${invalidFiles.join(', ')}` });
    }

    setDocuments([...documents, ...validFiles]);
  };

  // Remove document
  const removeDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  // Validate form
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

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (validateForm()) {
    // Generate vehicle ID if empty
    if (!formData.vehicleId) {
      const generateVehicleId = () => {
        const randomNum = Math.floor(Math.random() * 1000);
        return `VH-${String(randomNum).padStart(3, '0')}`;
      };
      formData.vehicleId = generateVehicleId();
    }

    const vehicleData = {
      ...formData,
      images: vehicleImages.map(img => img.name),
      documents: documents.map(doc => doc.name),
      createdAt: new Date().toISOString()
    };
    
    const result = await addVehicle(vehicleData);
    
    if (result.success) {
      // Log the activity with logger
      logger.createVehicle({
        id: result.vehicle?.id || Date.now(),
        make: vehicleData.make,
        model: vehicleData.model,
        registrationNumber: vehicleData.registrationNumber,
        year: vehicleData.year,
        vehicleCategory: vehicleData.vehicleCategory
      });
      
      alert('Vehicle added successfully!');
      
      // Reset form
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
        registrationDate: '',
        insuranceExpiry: '',
        fitnessExpiry: '',
        pollutionExpiry: '',
        assignedDriver: '',
        purchaseDate: '',
        purchasePrice: '',
        status: 'Active',
        vehicleCategory: '',
      });
      setVehicleImages([]);
      setImagePreviews([]);
      setDocuments([]);
    } else {
      alert('Error adding vehicle: ' + (result.error || 'Unknown error'));
    }
  }
};

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Vehicle Images Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Vehicle Images</h2>
          
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

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((preview, idx) => (
                <div key={preview.id} className="relative">
                  <img
                    src={preview.url}
                    alt={`Vehicle ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(vehicleImages[idx]?.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="VH-001"
                />
               
              </div>
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number <span className="text-red-500">*</span>
              </label>
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

            {/* Make - from Ledger Store */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make <span className="text-red-500">*</span>
              </label>
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
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
              {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color <span className="text-red-500">*</span>
              </label>
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

            {/* Fuel Type - from Ledger Store */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Type <span className="text-red-500">*</span>
              </label>
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
                  <option key={fuel.id} value={fuel.name}>
                    {fuel.name}
                  </option>
                ))}
              </select>
              {errors.fuelType && <p className="text-red-500 text-xs mt-1">{errors.fuelType}</p>}
            </div>

            {/* Transmission - from Ledger Store */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transmission
              </label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Transmission</option>
                {activeTransmissions.map(trans => (
                  <option key={trans.id} value={trans.name}>
                    {trans.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seating Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="4"
              />
            </div>

            {/* Vehicle Category - from Ledger Store */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Category <span className="text-red-500">*</span>
              </label>
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
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.vehicleCategory && <p className="text-red-500 text-xs mt-1">{errors.vehicleCategory}</p>}
            </div>

          {/* Status - Simple Active/Inactive */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Status
  </label>
  <select
    name="status"
    value={formData.status}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
  >
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
  </select>
</div>
          </div>
        </div>

        {/* Registration & Documents Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Registration & Documents</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chassis Number <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine Number <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Date
              </label>
              <input
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Expiry Date
              </label>
              <input
                type="date"
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fitness Certificate Expiry
              </label>
              <input
                type="date"
                name="fitnessExpiry"
                value={formData.fitnessExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pollution Certificate Expiry
              </label>
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
                {activeDrivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.fullName} ({driver.employeeId})
                  </option>
                ))}
              </select>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price
              </label>
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

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Vehicle Documents</h2>
          
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

          {/* Document List */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Uploaded Documents:</h3>
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                    className="text-red-600 hover:text-red-700"
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
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Adding Vehicle...' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
}
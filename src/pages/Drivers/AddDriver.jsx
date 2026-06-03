import { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, X, FileText, Image as ImageIcon, User, Car } from 'lucide-react';
import useDriverStore from '../../stores/driverStore';
import useLedgerStore from '../../stores/ledgerStore';
import useVehicleStore from '../../stores/vehicleStore';
import Logger from '../../utils/logger';

export default function AddDriver() {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    cnic: '',
    phoneNumber: '',
    department: '',
    designation: '',
    location: '',
    allocatedVehicle: '',
    dateOfAllotment: '',
    licenseNumber: '',
    licenseExpiry: '',
    joiningDate: '',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get data from stores
  const { addDriver } = useDriverStore();
  const { 
    designations, 
    fetchDesignations, 
    locations, 
    fetchLocations,
    isLoading: ledgerLoading 
  } = useLedgerStore();
  const { 
    vehicles, 
    fetchVehicles,
    isLoading: vehiclesLoading 
  } = useVehicleStore();

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchDesignations(),
        fetchLocations(),
        fetchVehicles()
      ]);
    };
    loadData();
  }, []);

  // Get active options from stores
  const activeDesignations = useMemo(() => 
    designations?.filter(d => d.status === 'Active' || d.status === 'active') || [], 
    [designations]
  );
  
  const activeLocations = useMemo(() => 
    locations?.filter(l => l.status === 'Active' || l.status === 'active') || [], 
    [locations]
  );
  
  // Get available vehicles (active and not assigned)
  const availableVehicles = useMemo(() => 
    vehicles?.filter(v => v.status === 'active') || [], 
    [vehicles]
  );

  // Format vehicle display
  const formatVehicleDisplay = useCallback((vehicle) => {
    const make = vehicle.make?.name || vehicle.make || '';
    const model = vehicle.model || '';
    const registration = vehicle.registrationNumber || vehicle.vehicleNumber || '';
    return `${make} ${model} (${registration})`;
  }, []);

  // Generate employee ID
  const generateEmployeeId = useCallback(() => {
    const randomNum = Math.floor(Math.random() * 1000);
    return `EMP-${String(randomNum).padStart(3, '0')}`;
  }, []);

  // Handle text input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Handle profile picture upload
  const handleProfilePicture = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profile: 'Profile picture must be less than 2MB' }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profile: 'Please upload an image file' }));
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

  // Remove profile picture
  const removeProfilePicture = useCallback(() => {
    setProfilePicture(null);
    setProfilePreview(null);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.cnic) newErrors.cnic = 'CNIC is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License expiry date is required';
    
    // CNIC validation (XXXXX-XXXXXXX-X)
    const cnicPattern = /^\d{5}-\d{7}-\d$/;
    if (formData.cnic && !cnicPattern.test(formData.cnic)) {
      newErrors.cnic = 'CNIC must be in format: 12345-1234567-1';
    }
    
    // Phone validation
    const phonePattern = /^[0-9+\-\s()]{10,15}$/;
    if (formData.phoneNumber && !phonePattern.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    // Date validation
    if (formData.licenseExpiry && new Date(formData.licenseExpiry) < new Date()) {
      newErrors.licenseExpiry = 'License expiry date must be in the future';
    }
    
    // If allocated vehicle is selected, date of allotment is required
    if (formData.allocatedVehicle && !formData.dateOfAllotment) {
      newErrors.dateOfAllotment = 'Date of allotment is required when allocating a vehicle';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log("Validation failed:", errors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Generate employee ID if empty
    const employeeId = formData.employeeId || generateEmployeeId();
    
    // Create FormData for file uploads
    const submitData = new FormData();
    
    // Get the actual names from IDs for designation and location
    const selectedDesignation = activeDesignations.find(d => d._id === formData.designation || d.id === formData.designation);
    const selectedLocation = activeLocations.find(l => l._id === formData.location || l.id === formData.location);
    
    // Add all text fields - send NAME values for designation and location
    submitData.append('employeeId', employeeId);
    submitData.append('firstName', formData.firstName);
    submitData.append('lastName', formData.lastName);
    submitData.append('cnic', formData.cnic);
    submitData.append('phoneNumber', formData.phoneNumber);
    submitData.append('department', formData.department);
    submitData.append('designation', selectedDesignation?.name || formData.designation);
    submitData.append('location', selectedLocation?.name || formData.location);
    submitData.append('licenseNumber', formData.licenseNumber);
    submitData.append('licenseExpiry', formData.licenseExpiry);
    
    // Add joiningDate (if not provided, backend will use default)
    if (formData.joiningDate) {
      submitData.append('joiningDate', formData.joiningDate);
    }
    
    // Add allocatedVehicle (ObjectId) and dateOfAllotment
    if (formData.allocatedVehicle) {
      submitData.append('allocatedVehicle', formData.allocatedVehicle);
    }
    if (formData.dateOfAllotment) {
      submitData.append('dateOfAllotment', formData.dateOfAllotment);
    }
    
    // Add profile picture
    if (profilePicture) {
      submitData.append('profilePicture', profilePicture);
    }
    
    // Add documents
    documents.forEach((doc) => {
      submitData.append('documents', doc.file);
    });
    
    // Log all data being sent
    console.log('=== Submitting Driver Data ===');
    for (let pair of submitData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    const result = await addDriver(submitData);
    
    if (result.success) {
      Logger.createDriver({
        id: result.driver?._id,
        name: `${formData.firstName} ${formData.lastName}`,
        employeeId: employeeId,
        phoneNumber: formData.phoneNumber
      });
      
      alert('Driver added successfully!');
      
      // Reset form
      setFormData({
        employeeId: '',
        firstName: '',
        lastName: '',
        cnic: '',
        phoneNumber: '',
        department: '',
        designation: '',
        location: '',
        allocatedVehicle: '',
        dateOfAllotment: '',
        licenseNumber: '',
        licenseExpiry: '',
        joiningDate: '',
      });
      setProfilePicture(null);
      setProfilePreview(null);
      setDocuments([]);
    } else {
      alert('Error adding driver: ' + (result.error || 'Unknown error'));
    }
    
    setIsSubmitting(false);
  }, [formData, validateForm, addDriver, generateEmployeeId, profilePicture, documents, activeDesignations, activeLocations]);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Picture Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
            <Upload size={20} className="text-blue-600" />
            Profile Picture
          </h2>
          
          <div className="flex items-center space-x-6">
            {profilePreview ? (
              <div className="relative">
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                />
                <button
                  type="button"
                  onClick={removeProfilePicture}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                <ImageIcon size={32} className="text-gray-400" />
              </div>
            )}
            
            <div>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-2">
                <Upload size={16} />
                Upload Profile Picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicture}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Max size: 2MB. Allowed: JPG, PNG</p>
              {errors.profile && <p className="text-red-500 text-xs mt-1">{errors.profile}</p>}
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-b border-gray-200">
    <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
      <User size={18} className="text-blue-600" />
      Basic Information
    </h2>
  </div>
  
  <div className="p-4 sm:p-6">
    <div className="space-y-4">
      {/* Employee ID - Full width with generate button below on mobile */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Employee ID
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            placeholder="EMP-001 (Auto-generated if empty)"
          />
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, employeeId: generateEmployeeId() }))}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm w-full sm:w-auto"
          >
            Generate
          </button>
        </div>
      </div>

      {/* First Name & Last Name - Stack on mobile, side by side on tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John"
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Doe"
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* CNIC & Phone Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNIC <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${
              errors.cnic ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="12345-1234567-1"
          />
          {errors.cnic && <p className="text-red-500 text-xs mt-1">{errors.cnic}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${
              errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+92 300 1234567"
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
        </div>
      </div>

      {/* Department & Designation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${
              errors.department ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Transport / Logistics"
          />
          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designation <span className="text-red-500">*</span>
          </label>
          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${
              errors.designation ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Designation</option>
            {activeDesignations.map(des => (
              <option key={des._id || des.id} value={des._id || des.id}>
                {des.name}
              </option>
            ))}
          </select>
          {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
        </div>
      </div>

      {/* Location & Joining Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Location</option>
            {activeLocations.map(loc => (
              <option key={loc._id || loc.id} value={loc._id || loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Joining Date
          </label>
          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for current date</p>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* License Information Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">License Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="DL-12345"
              />
              {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
            </div>

            {/* License Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Expiry <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.licenseExpiry ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.licenseExpiry && <p className="text-red-500 text-xs mt-1">{errors.licenseExpiry}</p>}
            </div>
          </div>
        </div>

        {/* Vehicle Allocation Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
            <Car size={20} className="text-blue-600" />
            Vehicle Allocation (Optional)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Allocated Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocated Vehicle
              </label>
              <select
                name="allocatedVehicle"
                value={formData.allocatedVehicle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Vehicle (Optional)</option>
                {availableVehicles.map(vehicle => (
                  <option key={vehicle._id || vehicle.id} value={vehicle._id || vehicle.id}>
                    {formatVehicleDisplay(vehicle)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">You can allocate a vehicle later</p>
            </div>

            {/* Date of Allotment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Allotment
              </label>
              <input
                type="date"
                name="dateOfAllotment"
                value={formData.dateOfAllotment}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.dateOfAllotment ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.allocatedVehicle}
              />
              <p className="text-xs text-gray-500 mt-1">Required if vehicle is allocated</p>
              {errors.dateOfAllotment && <p className="text-red-500 text-xs mt-1">{errors.dateOfAllotment}</p>}
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Documents
          </h2>
          
          <div className="mb-4">
            <label className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-2">
              <FileText size={16} />
              Upload Documents (License, CNIC Copy, etc.)
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
                      <p className="text-xs text-gray-500">{doc.size} KB</p>
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
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? 'Adding Driver...' : 'Add Driver'}
          </button>
        </div>
      </form>
    </div>
  );
}
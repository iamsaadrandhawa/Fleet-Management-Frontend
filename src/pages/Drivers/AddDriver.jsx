import { useState, useEffect } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import useDriverStore from '../../stores/driverStore';
import useLedgerStore from '../../stores/ledgerStore';
import useVehicleStore from '../../stores/vehicleStore';

export default function AddDriver() {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    cnic: '',
    phoneNumber: '',
    designation: '',
    location: '',
    allocatedVehicle: '',
    dateOfAllotment: '',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});

  // Get data from stores
  const { addDriver, isLoading } = useDriverStore();
  const { designations, fetchDesignations, locations, fetchLocations } = useLedgerStore();
  const { vehicles, fetchVehicles } = useVehicleStore();

  // Fetch data on component mount
  useEffect(() => {
    // Fetch all required data
    if (fetchDesignations) fetchDesignations();
    if (fetchLocations) fetchLocations();
    if (fetchVehicles) fetchVehicles();
  }, []);

  // Get active options from stores
  const activeDesignations = designations?.filter(d => d.status === 'Active') || [];
  const activeLocations = locations?.filter(l => l.status === 'Active') || [];
  const activeVehicles = vehicles?.filter(v => v.status === 'Active') || [];

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle profile picture upload
  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, profile: 'Profile picture must be less than 2MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, profile: 'Please upload an image file' });
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

  // Remove profile picture
  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePreview(null);
  };

  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.cnic) newErrors.cnic = 'CNIC is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.location) newErrors.location = 'Location is required';
    
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
     
      const driverData = {
        ...formData,
        profilePicture: profilePicture ? profilePicture.name : null,
        documents: documents.map(doc => doc.name),
        fullName: `${formData.firstName} ${formData.lastName}`,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      const result = await addDriver(driverData);
      
      if (result.success) {
        alert('Driver added successfully!');
        // Reset form
        setFormData({
          employeeId: '',
          firstName: '',
          lastName: '',
          cnic: '',
          phoneNumber: '',
          designation: '',
          location: '',
          allocatedVehicle: '',
          dateOfAllotment: '',
        });
        setProfilePicture(null);
        setProfilePreview(null);
        setDocuments([]);
      } else {
        alert('Error adding driver: ' + (result.error || 'Unknown error'));
      }
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Picture Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Profile Picture</h2>
          
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
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.employeeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="EMP-001"
                />
               
              </div>
              {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>

            {/* CNIC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.cnic ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12345-1234567-1"
              />
              {errors.cnic && <p className="text-red-500 text-xs mt-1">{errors.cnic}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+92 300 1234567"
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>

            {/* Designation - from Ledger Store */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.designation ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Designation</option>
                {activeDesignations.map(des => (
                  <option key={des.id} value={des.name}>
                    {des.name}
                  </option>
                ))}
              </select>
              {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
            </div>

            {/* Location - from Ledger Store */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Location</option>
                {activeLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            {/* Allocated Vehicle - from Vehicle Store */}
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
                <option value="">Select Vehicle</option>
                {activeVehicles.map(vehicle => (
                  <option key={vehicle.id} value={`${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})`}>
                    {vehicle.make} {vehicle.model} - {vehicle.registrationNumber}
                  </option>
                ))}
              </select>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Date when vehicle was allocated</p>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Documents</h2>
          
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
            {isLoading ? 'Adding Driver...' : 'Add Driver'}
          </button>
        </div>
      </form>
    </div>
  );
}
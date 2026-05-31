import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DriverFormModal({
  isEditing,
  driver,
  onSubmit,
  onClose,
  designations,
  locations,
  vehicles,
}) {
  const [formData, setFormData] = useState({
    employeeId:       driver?.employeeId || '',
    firstName:        driver?.firstName || '',
    lastName:         driver?.lastName || '',
    cnic:             driver?.cnic || '',
    phoneNumber:      driver?.phoneNumber || '',
    department:       driver?.department || '',
    designation:      driver?.designation || '',
    location:         driver?.location || '',
    allocatedVehicle: driver?.allocatedVehicle?._id || driver?.allocatedVehicle || '',
    dateOfAllotment:  driver?.dateOfAllotment ? driver.dateOfAllotment.split('T')[0] : '',
    licenseNumber:    driver?.licenseNumber || '',
    licenseExpiry:    driver?.licenseExpiry  ? driver.licenseExpiry.split('T')[0]  : '',
    joiningDate:      driver?.joiningDate    ? driver.joiningDate.split('T')[0]    : '',
    status:           driver?.status || 'available',
  });

  const [errors, setErrors]                 = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(driver?.profilePicture || null);
  const [documents, setDocuments]           = useState([]);

  // Debug: Log vehicles prop
  useEffect(() => {
    console.log('Vehicles received in modal:', vehicles);
    console.log('Currently assigned vehicle ID:', driver?.allocatedVehicle?._id || driver?.allocatedVehicle);
  }, [vehicles, driver]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    
    // If allocatedVehicle is cleared, also clear dateOfAllotment
    if (name === 'allocatedVehicle' && !value) {
      setFormData((prev) => ({ ...prev, dateOfAllotment: '' }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profilePicture: 'File size must be less than 2MB' }));
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, profilePicture: 'Only JPG, PNG images are allowed' }));
      return;
    }
    setProfilePicture(file);
    setProfilePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, profilePicture: '' }));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const valid = [];
    const errs  = [];
    const allowed = [
      'application/pdf','image/jpeg','image/png','image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024)    errs.push(`${file.name} exceeds 5MB`);
      else if (!allowed.includes(file.type)) errs.push(`${file.name} has unsupported format`);
      else                                   valid.push(file);
    });
    if (errs.length) setErrors((prev) => ({ ...prev, documents: errs.join(', ') }));
    else {
      setDocuments((prev) => [...prev, ...valid]);
      setErrors((prev) => ({ ...prev, documents: '' }));
    }
  };

  const removeDocument = (index) =>
    setDocuments((prev) => prev.filter((_, i) => i !== index));

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName)    newErrors.firstName    = 'First name is required';
    if (!formData.lastName)     newErrors.lastName     = 'Last name is required';
    if (!formData.cnic)         newErrors.cnic         = 'CNIC is required';
    if (!formData.phoneNumber)  newErrors.phoneNumber  = 'Phone number is required';
    if (!formData.department)   newErrors.department   = 'Department is required';
    if (!formData.designation)  newErrors.designation  = 'Designation is required';
    if (!formData.location)     newErrors.location     = 'Location is required';
    if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License expiry date is required';

    if (formData.cnic && !/^\d{5}-\d{7}-\d$/.test(formData.cnic))
      newErrors.cnic = 'CNIC must be in format: 12345-1234567-1';
    if (formData.phoneNumber && !/^[0-9+\-\s()]{10,15}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = 'Please enter a valid phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined)
        submitData.append(key, value);
    });
    if (profilePicture) submitData.append('profilePicture', profilePicture);
    documents.forEach((doc) => submitData.append('documents', doc));
    onSubmit(submitData);
  };

  // Get active designations and locations (status 'active')
  const activeDesignations = designations?.filter(
    (d) => d.status?.toLowerCase() === 'active'
  ) || [];
  
  const activeLocations = locations?.filter(
    (l) => l.status?.toLowerCase() === 'active'
  ) || [];
  
  // Get available vehicles - FIXED: Only show unassigned vehicles + current assigned vehicle
  const getAvailableVehicles = () => {
    if (!vehicles) return [];
    
    const currentVehicleId = driver?.allocatedVehicle?._id || driver?.allocatedVehicle;
    
    return vehicles.filter((v) => {
      const status = v.status?.toLowerCase();
      const isActive = status === 'active' || status === 'available';
      const vehicleId = v._id || v.id;
      
      // If editing and this is the currently assigned vehicle, include it
      if (isEditing && currentVehicleId === vehicleId) {
        return true;
      }
      
      // Otherwise, only show vehicles that are NOT assigned to anyone
      const isNotAssigned = !v.assignedTo;
      
      return isActive && isNotAssigned;
    });
  };

  const availableVehicles = getAvailableVehicles();

  // Format vehicle display
  const formatVehicleDisplay = (vehicle) => {
    const make = vehicle.make?.name || vehicle.make || '';
    const model = vehicle.model || '';
    const registration = vehicle.registrationNumber || vehicle.vehicleNumber || '';
    
    if (make && model) {
      return `${make} ${model}${registration ? ` (${registration})` : ''}`;
    }
    if (registration) {
      return registration;
    }
    return vehicle.name || vehicle.vehicleId || 'Unknown Vehicle';
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Driver' : 'Add New Driver'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">

            {/* Profile Picture */}
            <section className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Profile Picture</h3>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profilePreview
                    ? <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                    : <span className="text-3xl text-gray-300">📷</span>}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Profile Picture</label>
                  <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleProfilePictureChange}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
                  <p className="text-xs text-gray-400 mt-1">Max size: 2MB. Allowed: JPG, PNG</p>
                  {errors.profilePicture && <p className="text-red-500 text-xs mt-1">{errors.profilePicture}</p>}
                </div>
              </div>
            </section>

            {/* Basic Information */}
            <section className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                  <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange}
                    disabled={isEditing} placeholder="EMP-001"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNIC *</label>
                  <input type="text" name="cnic" value={formData.cnic} onChange={handleChange} placeholder="12345-1234567-1"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 font-mono ${errors.cnic ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {errors.cnic && <p className="text-red-500 text-xs mt-1">{errors.cnic}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+92 300 1234567"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 ${errors.phoneNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Transport / Logistics"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 ${errors.department ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                  <select name="designation" value={formData.designation} onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 bg-white ${errors.designation ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                    <option value="">Select Designation</option>
                    {activeDesignations.map((des) => (
                      <option key={des._id || des.id} value={des.name}>{des.name}</option>
                    ))}
                  </select>
                  {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <select name="location" value={formData.location} onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 bg-white ${errors.location ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                    <option value="">Select Location</option>
                    {activeLocations.map((loc) => (
                      <option key={loc._id || loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>

                {/* Allocated Vehicle - WITH NULL OPTION */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Vehicle</label>
                  <select name="allocatedVehicle" value={formData.allocatedVehicle} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white">
                    <option value="">-- None (Remove Vehicle) --</option>
                    {availableVehicles.map((v) => (
                      <option key={v._id || v.id} value={v._id || v.id}>
                        {formatVehicleDisplay(v)}
                        {isEditing && (driver?.allocatedVehicle?._id === (v._id || v.id)) && " (Currently Assigned)"}
                      </option>
                    ))}
                  </select>
                  {availableVehicles.length === 0 && vehicles && vehicles.length > 0 && (
                    <p className="text-xs text-yellow-500 mt-1">No available vehicles. All vehicles are already assigned to other drivers.</p>
                  )}
                  {(!vehicles || vehicles.length === 0) && (
                    <p className="text-xs text-yellow-500 mt-1">No vehicles found in system.</p>
                  )}
                  {isEditing && formData.allocatedVehicle && (
                    <p className="text-xs text-blue-500 mt-1">
                      Select "-- None (Remove Vehicle) --" to unassign the current vehicle
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Allotment</label>
                  <input type="date" name="dateOfAllotment" value={formData.dateOfAllotment} onChange={handleChange}
                    disabled={!formData.allocatedVehicle}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400" />
                  <p className="text-xs text-gray-400 mt-1">Date when vehicle was allocated (required if vehicle is assigned)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </section>

            {/* License Information */}
            <section className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">License Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                  <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="DL-12345"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 font-mono ${errors.licenseNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry *</label>
                  <input type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 ${errors.licenseExpiry ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {errors.licenseExpiry && <p className="text-red-500 text-xs mt-1">{errors.licenseExpiry}</p>}
                </div>
              </div>
            </section>

            {/* Documents */}
            <section className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Documents</h3>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleDocumentUpload}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
              <p className="text-xs text-gray-400 mt-1">
                Upload Documents (License, CNIC Copy, etc.) · Max 5MB · PDF, JPG, PNG, DOC
              </p>
              {errors.documents && <p className="text-red-500 text-xs mt-1">{errors.documents}</p>}
              {documents.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {documents.map((doc, i) => (
                    <li key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                      <button type="button" onClick={() => removeDocument(i)}
                        className="ml-3 text-red-400 hover:text-red-600 transition flex-shrink-0">
                        <X size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Status */}
            <section>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Status</h3>
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white">
                  <option value="available">Available</option>
                  <option value="on trip">On Trip</option>
                  <option value="off duty">Off Duty</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium">
              {isEditing ? 'Update Driver' : 'Add Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { User, X, FileText, Phone, MapPin, Briefcase, Calendar, Car, IdCard, Award, Building2 } from 'lucide-react';

export default function DriverDetailsModal({ driver, onClose, onEdit, getStatusBadge, getStatusText }) {
  // Add a safety check at the very beginning
  console.log("DriverDetailsModal received driver:", driver);
  
  if (!driver) {
    console.log("No driver data provided");
    return null;
  }

  // Safe data extraction with fallbacks
  const firstName = driver.firstName || '';
  const lastName = driver.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'N/A';
  const employeeId = driver.employeeId || 'N/A';
  const cnic = driver.cnic || 'N/A';
  const phoneNumber = driver.phoneNumber || 'N/A';
  const department = driver.department || 'N/A';
  const licenseNumber = driver.licenseNumber || 'N/A';
  const status = driver.status || 'available';
  
  // Handle designation (could be object or string)
  let designationName = 'N/A';
  if (driver.designation) {
    if (typeof driver.designation === 'object' && driver.designation.name) {
      designationName = driver.designation.name;
    } else if (typeof driver.designation === 'string') {
      designationName = driver.designation;
    }
  }
  
  // Handle location (could be object or string)
  let locationName = 'N/A';
  if (driver.location) {
    if (typeof driver.location === 'object' && driver.location.name) {
      locationName = driver.location.name;
    } else if (typeof driver.location === 'string') {
      locationName = driver.location;
    }
  }
  
  // Handle allocated vehicle
  let vehicleDisplay = 'Not Assigned';
  if (driver.allocatedVehicle) {
    const vehicle = driver.allocatedVehicle;
    const make = vehicle.make?.name || vehicle.make || '';
    const model = vehicle.model || '';
    const registration = vehicle.registrationNumber || vehicle.vehicleNumber || '';
    vehicleDisplay = [make, model, registration].filter(Boolean).join(' ') || 'Not Assigned';
  }
  
  // Format date function
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };
  
  // Get status badge function
  const getBadgeClass = (statusValue) => {
    if (getStatusBadge && typeof getStatusBadge === 'function') {
      return getStatusBadge(statusValue);
    }
    // Default badges
    switch(statusValue) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on trip': return 'bg-blue-100 text-blue-800';
      case 'off duty': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusTextValue = (statusValue) => {
    if (getStatusText && typeof getStatusText === 'function') {
      return getStatusText(statusValue);
    }
    // Default status text
    switch(statusValue) {
      case 'available': return 'Available';
      case 'on trip': return 'On Trip';
      case 'off duty': return 'Off Duty';
      case 'suspended': return 'Suspended';
      default: return statusValue;
    }
  };

  // Enhanced row component with icon
  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 w-8">
        <Icon size={16} className="text-gray-400 mt-0.5" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-900 font-medium mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );

  // Section component
  const Section = ({ title, icon: Icon, children }) => (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
        <Icon size={18} className="text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Driver Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">View complete driver information</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-center gap-5 pb-6 mb-4 border-b border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
              {driver.profilePicture ? (
                <img src={driver.profilePicture} alt={fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={36} className="text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
              <p className="text-sm text-gray-500 font-mono mt-0.5">{employeeId}</p>
              <div className="flex gap-2 mt-2">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${getBadgeClass(status)}`}>
                  {getStatusTextValue(status)}
                </span>
                {department !== 'N/A' && department !== '' && (
                  <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    {department}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Personal Information Section */}
          <Section title="Personal Information" icon={User}>
            <DetailRow icon={IdCard} label="CNIC" value={cnic} />
            <DetailRow icon={Phone} label="Phone Number" value={phoneNumber} />
            <DetailRow icon={Calendar} label="Joining Date" value={formatDate(driver.joiningDate)} />
          </Section>

          {/* Employment Information Section */}
          <Section title="Employment Information" icon={Briefcase}>
            <DetailRow icon={Award} label="Designation" value={designationName} />
            <DetailRow icon={MapPin} label="Location" value={locationName} />
            <DetailRow icon={Building2} label="Department" value={department} />
          </Section>

          {/* License Information Section */}
          <Section title="License Information" icon={FileText}>
            <DetailRow icon={IdCard} label="License Number" value={licenseNumber} />
            <DetailRow icon={Calendar} label="License Expiry" value={formatDate(driver.licenseExpiry)} />
          </Section>

          {/* Vehicle Information Section */}
          <Section title="Vehicle Information" icon={Car}>
            <DetailRow icon={Car} label="Allocated Vehicle" value={vehicleDisplay} />
            {driver.dateOfAllotment && (
              <DetailRow icon={Calendar} label="Date of Allotment" value={formatDate(driver.dateOfAllotment)} />
            )}
          </Section>
          
          {/* Documents Section */}
          {driver.documents && driver.documents.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={18} className="text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Documents</h3>
              </div>
              <div className="space-y-2">
                {driver.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <FileText size={16} className="text-blue-600 group-hover:text-blue-700" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                      {doc.name || `Document ${idx + 1}`}
                    </span>
                    <span className="text-xs text-gray-400">🔗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Audit Information (Optional) */}
          {(driver.createdBy || driver.updatedBy) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                {driver.createdBy && (
                  <p>Created by: {typeof driver.createdBy === 'object' ? driver.createdBy.name : driver.createdBy} on {formatDate(driver.createdAt)}</p>
                )}
                {driver.updatedBy && driver.updatedBy !== driver.createdBy && (
                  <p>Last updated: {typeof driver.updatedBy === 'object' ? driver.updatedBy.name : driver.updatedBy} on {formatDate(driver.updatedAt)}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onEdit(driver); }}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium shadow-sm"
          >
            Edit Driver
          </button>
        </div>
      </div>
    </div>
  );
}
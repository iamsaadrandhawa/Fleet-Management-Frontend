// VehicleFormModal.jsx - Fixed input handling
import { X } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';

export default function VehicleFormModal({
  isEditing,
  vehicle,
  onSubmit,
  onClose,
  makes,
  fuelTypes,
  transmissions,
  vehicleCategories,
  drivers,
  roles,
  designations,
  locations,
}) {
  // Initialize form data - use useMemo to prevent unnecessary re-renders
  const initialFormData = useMemo(() => ({
    vehicleId: vehicle?.vehicleId || vehicle?._id || '',
    registrationNumber: vehicle?.registrationNumber || '',
    model: vehicle?.model || '',
    make: vehicle?.make || vehicle?.company || '',
    year: vehicle?.year || '',
    color: vehicle?.color || '',
    fuelType: vehicle?.fuelType || '',
    transmission: vehicle?.transmission || '',
    seatingCapacity: vehicle?.seatingCapacity || '',
    chassisNumber: vehicle?.chassisNumber || '',
    engineNumber: vehicle?.engineNumber || '',
    registrationDate: vehicle?.registrationDate
      ? vehicle.registrationDate.slice(0, 10)
      : '',
    insuranceExpiry: vehicle?.insuranceExpiry
      ? vehicle.insuranceExpiry.slice(0, 10)
      : '',
    fitnessExpiry: vehicle?.fitnessExpiry
      ? vehicle.fitnessExpiry.slice(0, 10)
      : '',
    pollutionExpiry: vehicle?.pollutionExpiry
      ? vehicle.pollutionExpiry.slice(0, 10)
      : '',
    assignedDriver: vehicle?.assignedDriver || vehicle?.assignedTo?._id || '',
    purchaseDate: vehicle?.purchaseDate
      ? vehicle.purchaseDate.slice(0, 10)
      : '',
    purchasePrice: vehicle?.purchasePrice || '',
    status: vehicle?.status || 'active',
    vehicleCategory: vehicle?.vehicleCategory || '',
  }), [vehicle]);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Handle input changes - use callback to prevent recreation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Get active items - memoized to prevent recalculation on every render
  const getActiveItems = useCallback((items) => {
    if (!Array.isArray(items) || items.length === 0) return [];
    const hasStatusField = items.some(item => item.status !== undefined && item.status !== null);
    if (!hasStatusField) return items;
    return items.filter(item => {
      if (item.status === undefined || item.status === null) return true;
      const s = String(item.status).toLowerCase().trim();
      return s === 'active' || s === '1' || s === 'true';
    });
  }, []);

  // Pre-computed active lists with useMemo
  const activeMakes = useMemo(() => getActiveItems(makes), [makes, getActiveItems]);
  const activeFuelTypes = useMemo(() => getActiveItems(fuelTypes), [fuelTypes, getActiveItems]);
  const activeTransmissions = useMemo(() => getActiveItems(transmissions), [transmissions, getActiveItems]);
  const activeVehicleCategories = useMemo(() => getActiveItems(vehicleCategories), [vehicleCategories, getActiveItems]);
  const activeDrivers = useMemo(() => getActiveItems(drivers), [drivers, getActiveItems]);

  const statuses = useMemo(() => ['active', 'inactive', 'in maintenance', 'out of service'], []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';
    if (!formData.vehicleCategory) newErrors.vehicleCategory = 'Vehicle category is required';
    if (!formData.chassisNumber) newErrors.chassisNumber = 'Chassis number is required';
    if (!formData.engineNumber) newErrors.engineNumber = 'Engine number is required';

    const currentYear = new Date().getFullYear();
    if (formData.year && (Number(formData.year) < 1990 || Number(formData.year) > currentYear + 1)) {
      newErrors.year = `Year must be between 1990 and ${currentYear + 1}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle submit
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [validateForm, onSubmit, formData]);

  // Reusable field component as a separate component to prevent re-renders
  const Field = useCallback(({ label, required, error, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  ), []);

  const inputClass = useCallback((error) => 
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 ${
      error ? 'border-red-400' : 'border-gray-300'
    }`,
  []);

  const emptyHint = useCallback((list, label) => 
    list.length === 0 ? (
      <p className="text-amber-500 text-xs mt-1">
        No {label} available. Add them in the Ledger section.
      </p>
    ) : null,
  []);

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-8">
            {/* ── Section 1: Basic Information ── */}
            <section>
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle ID */}
                <Field label="Vehicle ID">
                  <input
                    type="text"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    disabled={isEditing}
                    placeholder="VH-001"
                    className={`${inputClass(false)} ${
                      isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                </Field>

                {/* Registration Number */}
                <Field label="Registration Number" required error={errors.registrationNumber}>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="ABC-123"
                    className={inputClass(errors.registrationNumber)}
                  />
                </Field>

                {/* Make */}
                <Field label="Make" required error={errors.make}>
                  <select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className={inputClass(errors.make)}
                  >
                    <option value="">Select Make</option>
                    {activeMakes.map((m) => (
                      <option key={m._id || m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  {emptyHint(activeMakes, 'makes')}
                </Field>

                {/* Model */}
                <Field label="Model" required error={errors.model}>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. Camry"
                    className={inputClass(errors.model)}
                  />
                </Field>

                {/* Year */}
                <Field label="Year" required error={errors.year}>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder={String(new Date().getFullYear())}
                    className={inputClass(errors.year)}
                  />
                </Field>

                {/* Color */}
                <Field label="Color">
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="White"
                    className={inputClass(false)}
                  />
                </Field>

                {/* Fuel Type */}
                <Field label="Fuel Type" required error={errors.fuelType}>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className={inputClass(errors.fuelType)}
                  >
                    <option value="">Select Fuel Type</option>
                    {activeFuelTypes.map((f) => (
                      <option key={f._id || f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  {emptyHint(activeFuelTypes, 'fuel types')}
                </Field>

                {/* Transmission */}
                <Field label="Transmission">
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className={inputClass(false)}
                  >
                    <option value="">Select Transmission</option>
                    {activeTransmissions.map((t) => (
                      <option key={t._id || t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {emptyHint(activeTransmissions, 'transmissions')}
                </Field>

                {/* Seating Capacity */}
                <Field label="Seating Capacity">
                  <input
                    type="number"
                    name="seatingCapacity"
                    value={formData.seatingCapacity}
                    onChange={handleChange}
                    placeholder="4"
                    min="1"
                    className={inputClass(false)}
                  />
                </Field>

                {/* Vehicle Category */}
                <Field label="Vehicle Category" required error={errors.vehicleCategory}>
                  <select
                    name="vehicleCategory"
                    value={formData.vehicleCategory}
                    onChange={handleChange}
                    className={inputClass(errors.vehicleCategory)}
                  >
                    <option value="">Select Category</option>
                    {activeVehicleCategories.map((c) => (
                      <option key={c._id || c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {emptyHint(activeVehicleCategories, 'vehicle categories')}
                </Field>

                {/* Status */}
                <Field label="Status">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClass(false)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Assigned Driver */}
                <Field label="Assigned Driver">
                  <select
                    name="assignedDriver"
                    value={formData.assignedDriver}
                    onChange={handleChange}
                    className={inputClass(false)}
                  >
                    <option value="">Select Driver</option>
                    {activeDrivers.map((d) => (
                      <option key={d._id || d.id} value={d._id || d.id}>
                        {d.name || d.fullName}
                        {d.employeeId ? ` (${d.employeeId})` : ''}
                      </option>
                    ))}
                  </select>
                  {emptyHint(activeDrivers, 'drivers')}
                </Field>
              </div>
            </section>

            {/* ── Section 2: Identification Numbers ── */}
            <section>
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Vehicle Identification Numbers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chassis Number */}
                <Field label="Chassis Number" required error={errors.chassisNumber}>
                  <input
                    type="text"
                    name="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={handleChange}
                    placeholder="CH-123456789"
                    className={inputClass(errors.chassisNumber)}
                  />
                </Field>

                {/* Engine Number */}
                <Field label="Engine Number" required error={errors.engineNumber}>
                  <input
                    type="text"
                    name="engineNumber"
                    value={formData.engineNumber}
                    onChange={handleChange}
                    placeholder="EN-123456789"
                    className={inputClass(errors.engineNumber)}
                  />
                </Field>
              </div>
            </section>

            {/* ── Section 3: Important Dates ── */}
            <section>
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Important Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Registration Date">
                  <input
                    type="date"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleChange}
                    className={inputClass(false)}
                  />
                </Field>

                <Field label="Insurance Expiry">
                  <input
                    type="date"
                    name="insuranceExpiry"
                    value={formData.insuranceExpiry}
                    onChange={handleChange}
                    className={inputClass(false)}
                  />
                </Field>

                <Field label="Fitness Expiry">
                  <input
                    type="date"
                    name="fitnessExpiry"
                    value={formData.fitnessExpiry}
                    onChange={handleChange}
                    className={inputClass(false)}
                  />
                </Field>

                <Field label="Pollution Expiry">
                  <input
                    type="date"
                    name="pollutionExpiry"
                    value={formData.pollutionExpiry}
                    onChange={handleChange}
                    className={inputClass(false)}
                  />
                </Field>

                <Field label="Purchase Date">
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className={inputClass(false)}
                  />
                </Field>

                <Field label="Purchase Price">
                  <input
                    type="text"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    placeholder="25000"
                    className={inputClass(false)}
                  />
                </Field>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
            >
              {isEditing ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
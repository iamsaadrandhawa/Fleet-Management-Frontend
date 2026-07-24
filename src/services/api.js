// services/api.js
import { supabase } from './supabaseClient';

// ------------------------------------------------------------------
// Small helper so every function has the same success/error shape
// your old axios interceptor gave you: resolve with data, throw
// a { message } object on failure.
// ------------------------------------------------------------------
function unwrap({ data, error }) {
  if (error) throw { message: error.message, details: error };
  return data;
}

// ==================== AUTH ====================
export const authAPI = {
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw { message: error.message };

    // pull profile + role in the same shape your old /auth/login gave you
    const profile = await authAPI.getProfile();
    return { session: data.session, user: data.user, profile };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw { message: error.message };
    return { success: true };
  },

  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*, role:roles(*)')   // populates the role object, like your old populate() call
      .eq('id', user.id)
      .single();

    return unwrap({ data, error });
  },

  changePassword: async ({ newPassword }) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    return unwrap({ data, error });
  },

  // Handy for your Zustand auth store to subscribe to session changes
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),
};

// ==================== DRIVERS ====================
export const driverAPI = {
  getAll: async (params = {}) => {
    let query = supabase.from('drivers').select('*').order('created_at', { ascending: false });
    if (params.status) query = query.eq('status', params.status);
    if (params.search) query = query.ilike('name', `%${params.search}%`);
    return unwrap(await query);
  },

  getById: async (id) => unwrap(await supabase.from('drivers').select('*').eq('id', id).single()),

  create: async (data) => unwrap(await supabase.from('drivers').insert(data).select().single()),

  update: async (id, data) =>
    unwrap(await supabase.from('drivers').update(data).eq('id', id).select().single()),

  delete: async (id) => unwrap(await supabase.from('drivers').delete().eq('id', id)),

  updateStatus: async (id, status) =>
    unwrap(await supabase.from('drivers').update({ status }).eq('id', id).select().single()),

  getByStatus: async (status) => unwrap(await supabase.from('drivers').select('*').eq('status', status)),
};

// ==================== VEHICLES ====================
export const vehicleAPI = {
  getAll: async () => unwrap(await supabase.from('vehicles').select('*').order('created_at', { ascending: false })),

  getById: async (id) => unwrap(await supabase.from('vehicles').select('*').eq('id', id).single()),

  create: async (data) => unwrap(await supabase.from('vehicles').insert(data).select().single()),

  update: async (id, data) =>
    unwrap(await supabase.from('vehicles').update(data).eq('id', id).select().single()),

  delete: async (id) => unwrap(await supabase.from('vehicles').delete().eq('id', id)),

  assignToDriver: async (id, { driverId }) =>
    unwrap(
      await supabase
        .from('vehicles')
        .update({ assigned_driver_id: driverId, status: 'assigned' })
        .eq('id', id)
        .select()
        .single()
    ),

  unassignFromDriver: async (id) =>
    unwrap(
      await supabase
        .from('vehicles')
        .update({ assigned_driver_id: null, status: 'available' })
        .eq('id', id)
        .select()
        .single()
    ),

  getByStatus: async (status) => unwrap(await supabase.from('vehicles').select('*').eq('status', status)),

  getAvailable: async () => unwrap(await supabase.from('vehicles').select('*').eq('status', 'available')),
};

// ==================== USERS ====================
export const userAPI = {
  getAll: async (params = {}) => {
    let query = supabase.from('profiles').select('*, role:roles(*)').order('created_at', { ascending: false });
    if (params.status) query = query.eq('status', params.status);
    return unwrap(await query);
  },

  getById: async (id) =>
    unwrap(await supabase.from('profiles').select('*, role:roles(*)').eq('id', id).single()),

  // Creating a user = Supabase Auth admin call. This needs the SERVICE ROLE key,
  // so it must run in an Edge Function / server context — not directly from the browser.
  // See the "create-user" edge function note at the bottom of this file.
  create: async (data) => {
    const { data: result, error } = await supabase.functions.invoke('create-user', { body: data });
    if (error) throw { message: error.message };
    return result;
  },

  update: async (id, data) =>
    unwrap(await supabase.from('profiles').update(data).eq('id', id).select().single()),

  delete: async (id) =>
    // soft delete: deactivate
    unwrap(await supabase.from('profiles').update({ status: 'inactive' }).eq('id', id).select().single()),

  hardDelete: async (id) => {
    const { data, error } = await supabase.functions.invoke('delete-user', { body: { id } });
    if (error) throw { message: error.message };
    return data;
  },

  getByEmail: async (email) => unwrap(await supabase.from('profiles').select('*').eq('email', email).single()),

  getByRole: async (roleId) => unwrap(await supabase.from('profiles').select('*').eq('role_id', roleId)),

  getStats: async () => {
    const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: active } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    return { total, active, inactive: total - active };
  },

  bulkUpdateStatus: async ({ ids, status }) =>
    unwrap(await supabase.from('profiles').update({ status }).in('id', ids).select()),
};

// ==================== LEDGERS ====================
function makeLedgerAPI(table) {
  return {
    getAll: async () => unwrap(await supabase.from(table).select('*').order('name')),
    add: async (data) => unwrap(await supabase.from(table).insert(data).select().single()),
    update: async (id, data) => unwrap(await supabase.from(table).update(data).eq('id', id).select().single()),
    delete: async (id) => unwrap(await supabase.from(table).delete().eq('id', id)),
  };
}

const rolesLedger = makeLedgerAPI('roles');
const designationsLedger = makeLedgerAPI('designations');
const locationsLedger = makeLedgerAPI('locations');
const makesLedger = makeLedgerAPI('makes');
const categoriesLedger = makeLedgerAPI('vehicle_categories');
const fuelTypesLedger = makeLedgerAPI('fuel_types');
const transmissionsLedger = makeLedgerAPI('transmissions');

export const ledgerAPI = {
  getAll: async () => {
    const [roles, designations, locations, makes, vehicleCategories, fuelTypes, transmissions] = await Promise.all([
      rolesLedger.getAll(),
      designationsLedger.getAll(),
      locationsLedger.getAll(),
      makesLedger.getAll(),
      categoriesLedger.getAll(),
      fuelTypesLedger.getAll(),
      transmissionsLedger.getAll(),
    ]);
    return { roles, designations, locations, makes, vehicleCategories, fuelTypes, transmissions };
  },

  getByType: async (type) => {
    const map = {
      roles: rolesLedger,
      designations: designationsLedger,
      locations: locationsLedger,
      makes: makesLedger,
      'vehicle-categories': categoriesLedger,
      'fuel-types': fuelTypesLedger,
      transmissions: transmissionsLedger,
    };
    if (!map[type]) throw { message: `Unknown ledger type: ${type}` };
    return map[type].getAll();
  },

  // ROLES
  getRoles: rolesLedger.getAll,
  addRole: rolesLedger.add,
  updateRole: rolesLedger.update,
  deleteRole: rolesLedger.delete,

  // DESIGNATIONS
  getDesignations: designationsLedger.getAll,
  addDesignation: designationsLedger.add,
  updateDesignation: designationsLedger.update,
  deleteDesignation: designationsLedger.delete,

  // LOCATIONS
  getLocations: locationsLedger.getAll,
  addLocation: locationsLedger.add,
  updateLocation: locationsLedger.update,
  deleteLocation: locationsLedger.delete,

  // MAKES
  getMakes: makesLedger.getAll,
  addMake: makesLedger.add,
  updateMake: makesLedger.update,
  deleteMake: makesLedger.delete,

  // VEHICLE CATEGORIES
  getVehicleCategories: categoriesLedger.getAll,
  addVehicleCategory: categoriesLedger.add,
  updateVehicleCategory: categoriesLedger.update,
  deleteVehicleCategory: categoriesLedger.delete,

  // FUEL TYPES
  getFuelTypes: fuelTypesLedger.getAll,
  addFuelType: fuelTypesLedger.add,
  updateFuelType: fuelTypesLedger.update,
  deleteFuelType: fuelTypesLedger.delete,

  // TRANSMISSIONS
  getTransmissions: transmissionsLedger.getAll,
  addTransmission: transmissionsLedger.add,
  updateTransmission: transmissionsLedger.update,
  deleteTransmission: transmissionsLedger.delete,
};

// ==================== AUDIT / ACTIVITY LOGS ====================
export const logAPI = {
  getAll: async () => unwrap(await supabase.from('audit_logs').select('*').order('created_at', { ascending: false })),

  getRecent: async (limit = 20) =>
    unwrap(await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit)),

  getByUser: async (userId) =>
    unwrap(await supabase.from('audit_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false })),

  getByAction: async (action) =>
    unwrap(await supabase.from('audit_logs').select('*').eq('action', action).order('created_at', { ascending: false })),

  getByEntity: async (entityType) =>
    unwrap(await supabase.from('audit_logs').select('*').eq('entity_type', entityType).order('created_at', { ascending: false })),

  delete: async (id) => unwrap(await supabase.from('audit_logs').delete().eq('id', id)),

  clearAll: async () => unwrap(await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')),

  // New helper — call this from wherever you currently fire audit events
  log: async ({ action, entityType, entityId, details }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const profile = user ? await authAPI.getProfile() : null;
    return unwrap(
      await supabase.from('audit_logs').insert({
        user_id: user?.id ?? null,
        user_role: profile?.role?.name ?? null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      })
    );
  },
};

export default supabase;

/*
  ------------------------------------------------------------------
  NOTES
  ------------------------------------------------------------------
  1. userAPI.create / userAPI.hardDelete call Supabase Edge Functions
     ("create-user", "delete-user") because creating/deleting auth
     users requires the SERVICE ROLE key, which must never be exposed
     in frontend code. I can scaffold those two edge functions next
     if you want — they're short (~20 lines each).

  2. Your Zustand stores that import from authAPI / driverAPI / etc.
     do NOT need to change — same function names, same call signatures,
     same return shapes (data or thrown { message }).

  3. Remove the localStorage/sessionStorage token logic from your auth
     store — Supabase Auth manages the session/token for you, and
     supabase-js automatically attaches it to every request.
*/
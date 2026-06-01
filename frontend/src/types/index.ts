export type UserRole = 'SUPER_ADMIN' | 'FLEET_MANAGER' | 'MECHANIC' | 'DRIVER' | 'FINANCE';

export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SOLD';

export type MaintenanceType = 'OIL_CHANGE' | 'SERVICE' | 'TIRE_CHANGE' | 'BRAKE_CHECK' | 'BATTERY_CHECK' | 'GENERAL_CHECK' | 'OTHER';

export type MaintenanceStatus = 'UPCOMING' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';

export type DocumentType = 'STNK' | 'TAX' | 'INSURANCE' | 'KIR' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicleType: string;
  fuelType: string;
  transmission: string;
  chassisNumber: string;
  engineNumber: string;
  currentOdometer: number;
  status: VehicleStatus;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  odometerLogs?: OdometerLog[];
  documents?: VehicleDocument[];
  assignments?: DriverAssignment[];
}

export interface OdometerLog {
  id: string;
  vehicleId: string;
  userId: string;
  odometer: number;
  date: string;
  notes?: string;
  createdAt: string;
  user?: Partial<User>;
}

export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  title: string;
  description?: string;
  maintenanceType: MaintenanceType;
  intervalKm?: number;
  intervalMonth?: number;
  lastServiceDate?: string;
  lastServiceOdometer?: number;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
  vehicle?: Partial<Vehicle>;
}

export interface MaintenanceHistory {
  id: string;
  vehicleId: string;
  scheduleId?: string;
  performedBy?: string;
  maintenanceType: MaintenanceType;
  title: string;
  description?: string;
  serviceDate: string;
  odometerAtService: number;
  workshopName: string;
  cost: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Partial<Vehicle>;
  mechanic?: Partial<User>;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  documentType: DocumentType;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  provider?: string;
  cost?: number;
  documentUrl?: string;
  notes?: string;
  status?: string; // ACTIVE, EXPIRES_SOON, EXPIRED (dynamically computed)
  createdAt: string;
  updatedAt: string;
  vehicle?: Partial<Vehicle>;
}

export interface DriverAssignment {
  id: string;
  vehicleId: string;
  driverId: string;
  startDate: string;
  endDate?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Partial<Vehicle>;
  driver?: Partial<User>;
}

export interface DamageReport {
  id: string;
  vehicleId: string;
  reportedBy: string;
  assignedMechanic?: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'REPORTED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  reportDate: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Partial<Vehicle>;
  reporter?: Partial<User>;
  mechanic?: Partial<User>;
}

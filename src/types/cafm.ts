export type RequestPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type RequestStatus = 'Open' | 'Overdue' | 'In progress' | 'Resolved' | 'Under review' | 'Assigned';
export type RequestCategory = 'HVAC / AC' | 'Electrical' | 'Plumbing' | 'Carpentry' | 'Cleaning' | 'Security';

export interface RepairLog {
  id: string;
  date: string;
  title: string;
  cost: number;
  technician: string;
  invoiceId?: string;
}

export interface SubAsset {
  id: string;
  name: string;
  category: 'HVAC' | 'Plumbing' | 'Electrical' | 'Appliance' | 'Carpentry';
  brandModel: string;
  purchaseCost: number;
  installDate: string;
  lifetimeRepairCost: number;
  lastServiceDate: string;
  warrantyStatus: 'Under Warranty' | 'Expired' | 'AMC Active';
  healthScore: number; // 0 - 100
  repairLogs: RepairLog[];
}

export interface ApartmentAsset {
  id: string;
  unitNumber: string; // e.g. "Unit 204"
  property: string; // e.g. "Palm Residency"
  buildingBlock: string; // e.g. "Block A"
  floor: string; // e.g. "Floor 2"
  type: '1BHK' | '2BHK' | '3BHK' | 'Penthouse' | 'Commercial';
  tenantName: string;
  tenantPhone: string;
  monthlyRent: number; // e.g. 45000
  totalRentCollected: number; // e.g. 540000
  totalMaintenanceSpent: number; // e.g. 52400
  subAssets: SubAsset[];
  status: 'Occupied' | 'Vacant' | 'Under Maintenance';
  handoverDate: string;
}

export type ServiceRequest = ServiceCase;

export interface ServiceCase {
  id: string; // e.g. "IC260039"
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  category: RequestCategory;
  location?: string;
  apartmentId?: string;
  subAssetId?: string;
  subAssetName?: string;
  reportedBy?: string;
  createdAt: string;
  estimatedCost?: number;
  actualCost?: number;
  photos: string[];
  assignedTechnician?: string;
  building?: string;
  floor?: string;
  room?: string;
  requesterName?: string;
  requesterEmail?: string;
  slaHours?: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  type: 'Reactive' | 'Corrective' | 'Predictive';
  apartment: string;
  assetName: string;
  status: 'Open' | 'In Progress' | 'Completed';
  priority: RequestPriority;
  cost: number;
  assignedTo: string;
  dueDate: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface MaterialConsumption {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface TechnicianJob {
  id: string; // e.g. "WO-2026-0103" or "IC260031"
  title: string;
  description: string;
  type: 'Reactive' | 'Corrective' | 'Predictive';
  priority: RequestPriority;
  status: 'Assigned' | 'In Progress' | 'On Hold' | 'Pending Verification' | 'Completed';
  category: RequestCategory;
  location: string;
  building: string;
  floor: string;
  room: string;
  assetId?: string;
  assetName: string;
  assignedTechnician: string;
  dueDate: string;
  slaHours: number;
  checklist: ChecklistItem[];
  beforePhotos: string[];
  afterPhotos: string[];
  workNotes: string;
  materialsUsed: MaterialConsumption[];
  timeSpentMinutes: number;
  isClockRunning?: boolean;
  reworkNote?: string;
  supervisorVerifier?: string;
}

export interface SparePartRequest {
  id: string;
  partName: string;
  quantity: number;
  reason: string;
  workOrderId: string;
  requestedBy: string;
  status: 'Pending Approval' | 'Approved' | 'Issued';
  createdAt: string;
}

export interface SafetyHazardReport {
  id: string;
  location: string;
  hazardType: 'Electrical' | 'Gas Leak' | 'Structural' | 'Flooding' | 'Chemical' | 'Other';
  description: string;
  severity: 'Critical' | 'High' | 'Medium';
  reportedBy: string;
  createdAt: string;
  status: 'Escalated to Supervisor' | 'Under Investigation' | 'Resolved';
}

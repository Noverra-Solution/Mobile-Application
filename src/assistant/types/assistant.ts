/**
 * Noverra Assistant - Offline Company Knowledge Types
 */

export type UserRole =
  | 'Real Estate Asset Owner'
  | 'Portfolio Manager'
  | 'Facility Supervisor'
  | 'Technician'
  | 'Tenant';

export interface CompanyContact {
  id: string; // e.g. "EMP-101"
  name: string;
  jobTitle: string;
  department: string;
  phone: string;
  email: string;
  assignedBuilding: string;
  availability: 'Available' | 'On-Duty' | 'Off-Shift' | 'On Call' | '24/7 Active';
  accessVisibility: string[]; // Authorized roles
  isSupervisor?: boolean;
  specialty?: string;
  avatarColor?: string;
}

export interface BuildingSpace {
  id: string; // e.g. "SPC-6232"
  site: string;
  building: string;
  floor: string;
  room: string;
  spaceIdentifier: string;
  category: string;
  contactPerson?: string;
  description?: string;
}

export interface KnowledgeAsset {
  id: string; // e.g. "AST-SUB-101-AC1"
  name: string;
  location: string;
  category: 'HVAC' | 'Plumbing' | 'Electrical' | 'Appliance' | 'Carpentry' | string;
  assignedProvider: string;
  healthScore: number;
  warrantyStatus: string;
  lastServiceDate: string;
  brandModel?: string;
}

export interface KnowledgeDocument {
  id: string; // e.g. "SOP-HVAC-2026-v2"
  category:
    | 'Company Policies'
    | 'Maintenance Procedures'
    | 'Emergency Instructions'
    | 'Service Categories'
    | 'Helpdesk Information'
    | 'FAQs';
  title: string;
  keywords: string[];
  content: string;
  steps?: string[];
  emergencyLevel?: 'Standard' | 'Urgent' | 'Emergency';
  refDoc: string;
}

export interface KnowledgeWorkOrder {
  id: string; // e.g. "WO-2026-0101"
  title: string;
  type: 'Reactive' | 'Corrective' | 'Predictive';
  status: 'Open' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedTo: string;
  dueDate: string;
  apartmentOrSpace: string;
  userPermissionRoles: string[];
  requesterEmail?: string;
  cost?: number;
}

export interface DisambiguationOption {
  id: string;
  label: string;
  query: string;
  category: string;
}

export interface SearchQueryResult {
  intent:
    | 'contact'
    | 'space'
    | 'asset'
    | 'doc'
    | 'work_order'
    | 'emergency'
    | 'disambiguation'
    | 'no_match';
  summaryText: string;
  contacts: CompanyContact[];
  spaces: BuildingSpace[];
  assets: KnowledgeAsset[];
  docs: KnowledgeDocument[];
  workOrders: KnowledgeWorkOrder[];
  disambiguationOptions?: DisambiguationOption[];
  citationRef: string;
  isOffline: boolean;
  lastSyncTime: string;
  matchCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isOffline: boolean;
  lastSyncTime?: string;
  queryResult?: SearchQueryResult;
  citationRef?: string;
  suggestedFollowUps?: string[];
}

export interface SyncMetadata {
  lastSyncTimestamp: string;
  recordCount: number;
  schemaVersion: number;
  organizationId: string;
  syncStatus: 'Synced' | 'Offline Cache' | 'Pending Sync';
}

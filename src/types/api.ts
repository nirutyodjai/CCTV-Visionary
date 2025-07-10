// API Types for CCTV Visionary System

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

// Pagination
export interface PaginationRequest {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'designer' | 'viewer' | 'installer';

export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  units: 'metric' | 'imperial';
  autoSave: boolean;
  gridSnap: boolean;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  analysisComplete: boolean;
  errors: boolean;
}

// Project API
export interface CreateProjectRequest {
  name: string;
  description?: string;
  templateId?: string;
  settings?: Partial<any>; // ProjectSettings from main types
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  settings?: Partial<any>; // ProjectSettings from main types
}

export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  owner: string;
  shared: boolean;
  thumbnail?: string;
}

// Device API
export interface CreateDeviceRequest {
  name: string;
  type: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
  floorPlanId: string;
}

export interface UpdateDeviceRequest {
  name?: string;
  position?: { x: number; y: number };
  properties?: Record<string, any>;
  rotation?: number;
}

export interface DeviceTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  manufacturer: string;
  model: string;
  specifications: DeviceSpecifications;
  defaultProperties: Record<string, any>;
  icon: string;
  thumbnail: string;
}

export interface DeviceSpecifications {
  dimensions: { width: number; height: number; depth: number };
  weight: number;
  powerConsumption: number;
  operatingTemperature: { min: number; max: number };
  humidity: { min: number; max: number };
  certifications: string[];
  warranty: string;
}

// Floor Plan API
export interface CreateFloorPlanRequest {
  name: string;
  scale: number;
  bounds: { x: number; y: number; width: number; height: number };
  projectId: string;
  backgroundImage?: File;
}

export interface UpdateFloorPlanRequest {
  name?: string;
  scale?: number;
  bounds?: { x: number; y: number; width: number; height: number };
  backgroundImage?: File;
}

export interface ImportFloorPlanRequest {
  file: File;
  format: 'dwg' | 'dxf' | 'pdf' | 'svg' | 'png' | 'jpg';
  scale?: number;
  projectId: string;
}

// Analysis API
export interface AnalysisRequest {
  type: 'coverage' | 'network' | 'power' | 'cost';
  floorPlanId?: string;
  projectId: string;
  parameters?: AnalysisParameters;
}

export interface AnalysisParameters {
  resolution?: number;
  qualityThreshold?: number;
  redundancyLevel?: number;
  customSettings?: Record<string, any>;
}

export interface AnalysisJob {
  id: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  results?: any;
}

// Report API
export interface GenerateReportRequest {
  projectId: string;
  type: 'summary' | 'detailed' | 'technical' | 'cost';
  format: 'pdf' | 'html' | 'docx';
  sections: ReportSection[];
  customization?: ReportCustomization;
}

export interface ReportSection {
  type: string;
  title: string;
  enabled: boolean;
  parameters?: Record<string, any>;
}

export interface ReportCustomization {
  logo?: string;
  companyName?: string;
  template?: string;
  styling?: Record<string, any>;
}

export interface ReportJob {
  id: string;
  status: 'generating' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
}

// File Upload API
export interface FileUploadRequest {
  file: File;
  type: 'background' | 'import' | 'template' | 'asset';
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

// Search API
export interface SearchRequest {
  query: string;
  type?: 'project' | 'device' | 'template' | 'all';
  filters?: SearchFilters;
  pagination?: PaginationRequest;
}

export interface SearchFilters {
  category?: string;
  manufacturer?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  tags?: string[];
  properties?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail?: string;
  relevance: number;
  metadata: Record<string, any>;
}

// Collaboration API
export interface ShareProjectRequest {
  projectId: string;
  userEmail: string;
  role: 'viewer' | 'editor' | 'admin';
  message?: string;
}

export interface ProjectShare {
  id: string;
  projectId: string;
  userId: string;
  userEmail: string;
  role: string;
  createdAt: string;
  acceptedAt?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface CommentRequest {
  floorPlanId: string;
  position: { x: number; y: number };
  content: string;
  type: 'general' | 'issue' | 'suggestion';
  attachments?: string[];
}

export interface Comment {
  id: string;
  floorPlanId: string;
  position: { x: number; y: number };
  content: string;
  type: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  resolved: boolean;
  replies: CommentReply[];
  attachments: string[];
}

export interface CommentReply {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

// Webhook API
export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  projectId?: string;
  userId: string;
}

// System API
export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  version: string;
  uptime: number;
  services: ServiceStatus[];
  metrics: SystemMetrics;
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  responseTime?: number;
  error?: string;
}

export interface SystemMetrics {
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  activeUsers: number;
  storageUsed: number;
  storageTotal: number;
}

// AI API
export interface AISuggestionRequest {
  projectId: string;
  floorPlanId: string;
  type: 'placement' | 'optimization' | 'coverage' | 'network';
  context?: Record<string, any>;
}

export interface AISuggestion {
  id: string;
  type: string;
  confidence: number;
  title: string;
  description: string;
  action: any; // RecommendedAction from main types
  reasoning: string;
  alternatives?: AISuggestion[];
}

export interface AIAnalysisRequest {
  projectId: string;
  type: 'risk' | 'optimization' | 'compliance' | 'cost';
  parameters?: Record<string, any>;
}

export interface AIAnalysisResponse {
  insights: AIInsight[];
  recommendations: any[]; // Recommendation from main types
  riskAssessment?: RiskAssessment;
  score?: number;
}

export interface AIInsight {
  category: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string;
  confidence: number;
}

export interface RiskAssessment {
  overall: number;
  categories: Record<string, number>;
  factors: RiskFactor[];
}

export interface RiskFactor {
  factor: string;
  impact: number;
  probability: number;
  mitigation: string;
}

export type UserRole = "CITIZEN" | "VOLUNTEER" | "SECURITY_STAFF" | "ADMIN";

export type Language = "en" | "hi" | "mr";

export type IncidentCategory =
  | "THEFT"
  | "CHAIN_SNATCHING"
  | "SUSPICIOUS_ACTIVITY"
  | "CROWD_ISSUE"
  | "MISSING_PERSON"
  | "PERSONAL_SAFETY"
  | "EMERGENCY"
  | "MEDICAL"
  | "FIRE"
  | "OTHER";

export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus =
  | "REPORTED"
  | "VERIFIED"
  | "ASSIGNED"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type EscalationLevel = "NORMAL" | "WARNING" | "ESCALATED";

export type MissingPersonType = "CHILD" | "ELDERLY" | "ADULT";

export type MissingPersonStatus =
  | "REPORTED"
  | "VERIFIED"
  | "SEARCH_DISPATCHED"
  | "SIGHTING_LOGGED"
  | "FOUND_SAFE"
  | "CLOSED";

export type SightingStatus = "PENDING" | "VERIFIED" | "FALSE_ALARM";

export type CrowdRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TeamType =
  | "SECURITY"
  | "CROWD_CONTROL"
  | "SEARCH_RESCUE"
  | "MEDICAL"
  | "HELP_DESK";

export type TeamStatus = "AVAILABLE" | "DISPATCHED" | "ON_SCENE" | "OFF_DUTY";

export type SafeJourneyStatus =
  | "ACTIVE"
  | "DEVIATION_DETECTED"
  | "PANIC_TRIGGERED"
  | "COMPLETED"
  | "CANCELLED";

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
}

export interface AITriageResult {
  category: IncidentCategory;
  priority: IncidentPriority;
  suggestedTeamType: TeamType;
  extractedEntities: {
    location?: string;
    suspect?: string;
    items?: string;
    time?: string;
  };
  summary: string;
  isUrgent: boolean;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number;
  masterIncidentId?: string;
  masterIncidentNumber?: string;
  reason?: string;
}

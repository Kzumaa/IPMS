import { AppType, ApplicationStatus, PartyType, AttachmentType } from "./enums";

export interface Application {
  id: number;
  created_by: number;
  filing_number: string | null;
  app_type: AppType;
  title: string;
  // Note: abstract, description, claims are stored as file attachments
  // Use attachments with doc_type: ABSTRACT, DESCRIPTION, CLAIMS
  status: ApplicationStatus;
  filing_date?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  registration_number?: string | null;
  priority_date?: string | null;
  priority_number: string | null;
  priority_country: string | null;
  is_pct: boolean;
  pct_number: string | null;
  pct_filing_date: string | null;
  pct_publication_date: string | null;
  national_phase_entry_date: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  parties?: ApplicationParty[];
  attachments?: ApplicationAttachment[];
  protection_titles?: ProtectionTitle[];
  protection_title?: GrantedProtectionTitle | null;
  fee_quotes?: FeeQuote[];
  metrics?: ApplicationMetric;
  applicant?: User;
  priority_claims?: PriorityClaim[];
  sntc_info?: SntcInfo | null;
  requests?: ApplicationRequestSummary[];
}

// Protection title for GRANTED applications
export interface GrantedProtectionTitle {
  id: number;
  registration_number: string;
  issue_date: string | null;
  expiry_date: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

// Summary of license request for licensed titles
export interface LicenseSummary {
  license_type: string;
  valid_from: string;
  valid_to: string;
  scope_territory: string;
  licensor: {
    id: number;
    name: string;
    email: string;
  } | null;
}

// Summary of application request
export interface ApplicationRequestSummary {
  id: number;
  type: string;
  status: string;
  license?: LicenseSummary | null;
}

export interface ApplicationParty {
  id: number;
  application_id: number;
  party_type: PartyType;
  name: string;
  address: string;
  nationality: string | null;
  country_code: string | null;
  email: string | null;
  phone: string | null;
  id_number: string | null;
  id_type: string | null;
  is_primary: boolean;
  share_percentage: number | null;
  user_id: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface ApplicationAttachment {
  id: number;
  application_id: number;
  attachment_type: AttachmentType;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  description: string | null;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProtectionTitle {
  id: number;
  application_id: number;
  title_type: "IPC" | "LOCARNO" | "NICE";
  class_code: string;
  class_name: string | null;
  subclass_code: string | null;
  subclass_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeeQuoteLine {
  id: number;
  fee_quote_id: number;
  fee_code: string;
  label: string;
  units: number;
  unit_price: number;
  amount: number;
  source: "AUTO" | "MANUAL";
}

export interface FeeQuote {
  id: number;
  application_id: number;
  version: number;
  currency: string;
  total_amount: number;
  status: "DRAFT" | "FINAL" | "PAID" | "PENDING";
  generated_at: string;
  law_version: string;
  lines: FeeQuoteLine[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationMetric {
  application_id: number;
  description_pages?: number | null;
  abstract_pages?: number | null;
  claims_independent?: number | null;
  claims_total?: number | null;
  drawings_images?: number | null;
  ipc_groups?: number | null;
  id_variants?: number | null;
  id_images_per_variant?: number | null;
  has_priority?: boolean;
  priority_count?: number | null;
  is_user_classified?: boolean;
}

// Priority Claim Types
export type PriorityKind = "VN_FIRST" | "PARIS" | "OTHER";

export interface PriorityClaim {
  id?: number;
  application_id?: number;
  kind?: PriorityKind | null;
  number: string;
  filing_date: string;
  country_code: string;
  agreement_name?: string | null;
}

// SNTC Info (State Budget Science & Technology Task)
export interface SntcInfo {
  application_id?: number;
  agency_name: string | null;
  project_name: string | null;
  project_code: string | null;
}

export interface User {
  id: number;
  name?: string;
  full_name?: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
}

// User search result from API
export interface UserSearchResult {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  country: string | null;
}

// Form Types
export interface CreateApplicationDTO {
  app_type: AppType;
  title: string;
  // Note: abstract, description, claims are uploaded as attachments
  // Use uploadAttachment() with doc_type: ABSTRACT, DESCRIPTION, CLAIMS
  is_pct?: boolean;
  pct_number?: string;
  pct_filing_date?: string;
  pct_publication_date?: string;
  priority_date?: string;
  priority_number?: string;
  priority_country?: string;
  applicant_is_inventor?: boolean;
}

export interface UpdateApplicationDTO extends Partial<CreateApplicationDTO> {
  id: number;
}

export interface CreatePartyDTO {
  party_type: PartyType;
  name: string;
  address: string;
  nationality?: string;
  country_code?: string;
  email?: string;
  phone?: string;
  id_number?: string | null;
  id_type?: string | null;
  is_primary?: boolean;
  share_percentage?: number | null;
  user_id?: number | null;
}

export interface CreateProtectionTitleDTO {
  title_type: "IPC" | "LOCARNO" | "NICE";
  class_code: string;
  class_name?: string;
  subclass_code?: string;
  subclass_name?: string;
}

export interface UploadAttachmentDTO {
  attachment_type: AttachmentType;
  file: File;
  description?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Filter Types
export interface ApplicationFilters {
  status?: ApplicationStatus;
  app_type?: AppType;
  search?: string;
  page?: number;
  per_page?: number;
}

// Application Version Types
export interface ApplicationVersion {
  id: number;
  application_id: number;
  version_number: number;
  amendment_request_id: number | null;
  snapshot_data: ApplicationSnapshot;
  change_summary: string | null;
  field_changes: Record<string, FieldChange> | null;
  created_by: number;
  created_at: string;
  created_by_user?: User;
}

export interface ApplicationSnapshot {
  title: string;
  app_type: AppType;
  status: ApplicationStatus;
  is_pct: boolean;
  pct_number: string | null;
  pct_filing_date: string | null;
  pct_publication_date: string | null;
  national_phase_entry_date: string | null;
  parties: ApplicationParty[];
  priority_claims: PriorityClaim[];
  ipc_classes: IpcClass[];
  locarno_classes: LocarnoClass[];
  metrics: ApplicationMetric | null;
  attachments: AttachmentSnapshot[];
}

export interface IpcClass {
  id: number;
  application_id: number;
  section: string;
  class_code: string;
  subclass: string | null;
  group: string | null;
  subgroup: string | null;
  label: string | null;
  assigned_by_type: "USER" | "STAFF" | null;
  assigned_by_id: number | null;
  assigned_at: string | null;
}

export interface LocarnoClass {
  id: number;
  application_id: number;
  class_code: string;
  subclass: string | null;
  label: string | null;
  assigned_by_type: "USER" | "STAFF" | null;
  assigned_by_id: number | null;
  assigned_at: string | null;
}

export interface AttachmentSnapshot {
  id: number;
  doc_type: AttachmentType;
  original_filename: string;
  page_count: number | null;
}

export interface VersionComparison {
  version_a: number;
  version_b: number;
  changes: VersionChanges;
}

export interface VersionChanges {
  title?: { old: string; new: string };
  parties?: { added: ApplicationParty[]; removed: ApplicationParty[] };
  priority_claims?: { added: PriorityClaim[]; removed: PriorityClaim[] };
  ipc_classes?: { added: IpcClass[]; removed: IpcClass[] };
  locarno_classes?: { added: LocarnoClass[]; removed: LocarnoClass[] };
  metrics?: { old: ApplicationMetric | null; new: ApplicationMetric | null };
  attachments?: { added: AttachmentSnapshot[]; removed: AttachmentSnapshot[] };
}

// Split Application Types
export interface SplitApplicationDTO {
  title?: string;
  claims_to_split?: number[];
}

// Amendment Editing Types (Edit-mode amendment)
export interface AmendmentData {
  application_id: number;
  current_version: number;
  data: ApplicationSnapshot;
  readonly_fields: string[];
  editable_fields: string[];
}

export interface ProposedAmendmentData {
  title?: string;
  applicant_is_inventor?: boolean;
  publication_early_requested?: boolean;
  pub_delay_months?: number;
  parties?: SnapshotParty[];
  attachments?: AttachmentSnapshot[];
  priority_claims?: SnapshotPriorityClaim[];
  metrics?: Partial<ApplicationMetric>;
}

export interface SnapshotParty {
  id?: number;
  role: string;
  user_id?: number | null;
  snapshot_name: string;
  snapshot_email: string;
  snapshot_address?: string;
  phone?: string | null;
  id_number?: string | null;
  id_type?: string | null;
  nationality?: string | null;
  nationality_text?: string | null;
  is_primary?: boolean;
}

export interface SnapshotPriorityClaim {
  id?: number;
  country_code: string;
  app_no: string;
  filing_date: string;
}

export interface NewAttachment {
  file: File;
  doc_type: string;
}

export interface CreateEditModeAmendmentDTO {
  proposed_data: ProposedAmendmentData;
  change_summary: string;
  new_attachments?: NewAttachment[];
  removed_attachment_ids?: number[];
}

export interface PendingVersion {
  id: number;
  application_id: number;
  request_id: number;
  version_number: number;
  proposed_data: ProposedAmendmentData;
  changed_fields: string[];
  field_changes: Record<string, FieldChange>;
  changes_count: number;
  created_by: number;
  created_at: string;
  creator?: User;
}

export interface FieldChange {
  old: unknown;
  new: unknown;
}

export interface PartyChanges {
  added: SnapshotParty[];
  removed: SnapshotParty[];
  modified: Array<{ old: SnapshotParty; new: SnapshotParty }>;
}

export interface AttachmentChanges {
  added: AttachmentSnapshot[];
  removed: AttachmentSnapshot[];
  replaced: Array<{ doc_type: string; old_count: number; new_count: number }>;
}

export interface PriorityClaimChanges {
  added: SnapshotPriorityClaim[];
  removed: SnapshotPriorityClaim[];
}

// Timeline Event Types
export type TimelineEventCategory =
  | "system"
  | "examination"
  | "decision"
  | "request";

export type TimelineEventType =
  // Application lifecycle events
  | "APPLICATION_CREATED"
  | "APPLICATION_SUBMITTED"
  // Examination events
  | "FORMALITY_EXAM"
  | "SUBSTANTIVE_EXAM"
  // Decision events
  | "GRANT"
  | "REFUSAL"
  // Request events
  | "REQUEST_AMENDMENT"
  | "REQUEST_ASSIGNMENT"
  | "REQUEST_LICENSE"
  | "REQUEST_SPLIT"
  | "REQUEST_CONVERSION"
  | "REQUEST_APPEAL";

export type TimelineEventColor =
  | "gray"
  | "blue"
  | "green"
  | "red"
  | "amber"
  | "purple"
  | "indigo";

export interface TimelineEventActor {
  id: number;
  name: string;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  category: TimelineEventCategory;
  title: string;
  description: string | null;
  date: string;
  actor: TimelineEventActor | null;
  data: Record<string, unknown> | null;
  icon: string | null;
  color: TimelineEventColor;
}

import type {
  RequestType,
  RequestStatus,
  AmendmentSection,
  TransferType,
  LicenseType,
  ComplaintResolution,
} from './enums';

// User reference
export interface UserRef {
  id: number;
  name: string;
  email: string;
}

// Fee Quote Line
export interface FeeQuoteLine {
  fee_code: string;
  label: string;
  units: number;
  unit_price: number;
  amount: number;
}

// Fee Quote
export interface RequestFeeQuote {
  id: number;
  version: number;
  currency: string;
  total_amount: number;
  status: string;
  lines?: FeeQuoteLine[];
}

// Attachment
export interface RequestAttachment {
  id: number;
  doc_type: string;
  is_current: boolean;
  notes?: string;
  created_at: string;
  file?: {
    id: number;
    filename: string;
    mime: string;
    size_bytes: number;
  };
}

// Amendment Detail
export interface AmendmentDetail {
  section: AmendmentSection;
  section_label: string;
  change_summary: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  pending_version_id?: number;
}

// Assignment Detail
export interface AssignmentDetail {
  transfer_type: TransferType;
  transfer_type_label: string;
  contract_number?: string;
  contract_date?: string;
  assignor?: UserRef;
  assignee?: UserRef;
}

// License Detail
export interface LicenseDetail {
  license_type: LicenseType;
  license_type_label: string;
  scope_territory: string;
  scope_products?: string;
  valid_from: string;
  valid_to: string;
  contract_number?: string;
  licensor?: UserRef;
  licensees?: UserRef[];
}

// Complaint Detail (replaces Appeal per SRS Section 3.2)
export interface ComplaintDetail {
  grounds: string;
  deadline: string;
  complaint_number: number;
  is_within_deadline: boolean;
  previous_status?: string;
  resolved_at?: string;
  resolution?: ComplaintResolution;
  resolution_label?: string;
  remaining_complaints: number;
}

// Renewal Detail
export interface RenewalDetail {
  renewal_years: number;
  current_expiration_date: string;
  new_expiration_date: string;
}

// Termination Detail
export interface TerminationDetail {
  reason?: string;
  effective_date: string;
}

// Withdrawal Detail
export interface WithdrawalDetail {
  reason?: string;
  effective_date: string;
}

// Main Application Request interface
export interface ApplicationRequest {
  id: number;
  application_id: number;
  type: RequestType;
  status: RequestStatus;
  request_date?: string;
  processed_date?: string;
  processing_notes?: string;
  created_at: string;
  updated_at: string;

  // Relations
  creator?: UserRef;
  processor?: UserRef;

  // Type-specific details (only one will be present)
  amendment?: AmendmentDetail;
  assignment?: AssignmentDetail;
  license?: LicenseDetail;
  complaint?: ComplaintDetail;
  renewal?: RenewalDetail;
  termination?: TerminationDetail;
  withdrawal?: WithdrawalDetail;

  // Fee quote
  fee_quote?: RequestFeeQuote;

  // Attachments
  attachments?: RequestAttachment[];

  // Computed
  can_edit: boolean;
  can_submit: boolean;
  is_pending: boolean;
  is_terminal: boolean;
}

// DTOs for creating requests
export interface CreateAmendmentDTO {
  section: AmendmentSection;
  change_summary: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
}

export interface UpdateAmendmentDTO extends CreateAmendmentDTO {}

export interface CreateAssignmentDTO {
  assignor_user_id: number;
  assignee_user_id: number;
  transfer_type: TransferType;
  contract_number?: string;
  contract_date?: string;
}

export interface CreateLicenseDTO {
  licensor_user_id: number;
  licensee_user_ids: number[];
  license_type: LicenseType;
  valid_from: string;
  valid_to: string;
  scope_territory?: string;
  scope_products?: string;
  contract_number?: string;
}

export interface CreateSplitDTO {
  split_description: string;
}

export interface CreateComplaintDTO {
  grounds: string;
}

export interface CreateRenewalDTO {
  renewal_years: number;
}

export interface CreateTerminationDTO {
  reason?: string;
  effective_date?: string;
}

export interface CreateWithdrawalDTO {
  reason?: string;
  effective_date?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// State shape for Redux
export interface RequestState {
  requests: ApplicationRequest[];
  currentRequest: ApplicationRequest | null;
  loading: boolean;
  error: string | null;
}

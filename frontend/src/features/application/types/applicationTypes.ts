import { AppType, ApplicationStatus, PartyType, AttachmentType } from './enums';

export interface Application {
    id: number;
    filing_number: string | null;
    app_type: AppType;
    title: string;
    // Note: abstract, description, claims are stored as file attachments
    // Use attachments with doc_type: ABSTRACT, DESCRIPTION, CLAIMS
    status: ApplicationStatus;
    filing_date: string | null;
    priority_date: string | null;
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
    fee_quotes?: FeeQuote[];
    metrics?: ApplicationMetric;
    applicant?: User;
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
    created_at: string;
    updated_at: string;
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
    title_type: 'IPC' | 'LOCARNO' | 'NICE';
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
    source: 'AUTO' | 'MANUAL';
}

export interface FeeQuote {
    id: number;
    application_id: number;
    version: number;
    currency: string;
    total_amount: number;
    status: 'DRAFT' | 'FINAL' | 'PAID';
    generated_at: string;
    law_version: string;
    lines: FeeQuoteLine[];
    created_at: string;
    updated_at: string;
}

export interface ApplicationMetric {
    application_id: number;
    description_pages?: number | null;
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

export interface User {
    id: number;
    name: string;
    email: string;
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
    id_number?: string;
    id_type?: string;
    is_primary?: boolean;
    share_percentage?: number;
}

export interface CreateProtectionTitleDTO {
    title_type: 'IPC' | 'LOCARNO' | 'NICE';
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

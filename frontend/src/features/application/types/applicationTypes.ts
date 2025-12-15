import { AppType, ApplicationStatus, PartyType, AttachmentType } from './enums';

export interface Application {
    id: number;
    filing_number: string | null;
    app_type: AppType;
    title: string;
    abstract: string | null;
    description: string | null;
    claims: string | null;
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
    applicant?: User;
}

export interface ApplicationParty {
    id: number;
    application_id: number;
    party_type: PartyType;
    name: string;
    name_en: string | null;
    address: string;
    address_en: string | null;
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

export interface FeeQuote {
    id: number;
    application_id: number;
    fee_type: string;
    amount: number;
    currency: string;
    due_date: string | null;
    paid_date: string | null;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED';
    created_at: string;
    updated_at: string;
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
    abstract?: string;
    description?: string;
    claims?: string;
    is_pct?: boolean;
    pct_number?: string;
    pct_filing_date?: string;
    pct_publication_date?: string;
    priority_date?: string;
    priority_number?: string;
    priority_country?: string;
}

export interface UpdateApplicationDTO extends Partial<CreateApplicationDTO> {
    id: number;
}

export interface CreatePartyDTO {
    party_type: PartyType;
    name: string;
    name_en?: string;
    address: string;
    address_en?: string;
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

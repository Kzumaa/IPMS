import { z } from 'zod';
import { AppType, AppTypeValues, PartyType, PartyTypeValues, AttachmentType, AttachmentTypeValues } from '../types/enums';

// Priority Claim validation schema
export const priorityClaimSchema = z.object({
    id: z.number().optional(),
    kind: z.enum(['VN_FIRST', 'PARIS', 'OTHER']).nullable().optional(),
    number: z.string().min(1, 'Số đơn ưu tiên là bắt buộc').max(100),
    filing_date: z.string().min(1, 'Ngày nộp đơn ưu tiên là bắt buộc'),
    country_code: z.string().min(2, 'Mã quốc gia là bắt buộc').max(2),
    agreement_name: z.string().max(255).optional().nullable(),
});

// SNTC Info (State Budget Task) validation schema
export const sntcInfoSchema = z.object({
    agency_name: z.string().max(500).optional().nullable(),
    project_name: z.string().max(1000).optional().nullable(),
    project_code: z.string().max(100).optional().nullable(),
});

// Party validation schema (all fields required except ID number)
export const partySchema = z.object({
    party_type: z.enum(PartyTypeValues as [PartyType, ...PartyType[]]),
    name: z.string().min(1, 'Tên là bắt buộc').max(255, 'Tên không được quá 255 ký tự'),
    address: z.string().min(1, 'Địa chỉ là bắt buộc').max(500, 'Địa chỉ không được quá 500 ký tự'),
    nationality: z.string().min(1, 'Quốc tịch là bắt buộc').max(100),
    country_code: z.string().max(2, 'Mã quốc gia phải có tối đa 2 ký tự').optional().nullable(),
    email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
    phone: z.string().min(1, 'Số điện thoại là bắt buộc').max(20),
    id_number: z.string().max(50).optional().nullable(),
    id_type: z.string().max(50).optional().nullable(),
    is_primary: z.boolean().optional(),
    share_percentage: z.number().min(0).max(100).optional().nullable(),
    user_id: z.number().optional().nullable(), // Link to existing user
});

// Protection title validation schema
export const protectionTitleSchema = z.object({
    title_type: z.enum(['IPC', 'LOCARNO', 'NICE']),
    class_code: z.string().min(1, 'Mã phân loại là bắt buộc'),
    class_name: z.string().optional().nullable(),
    subclass_code: z.string().optional().nullable(),
    subclass_name: z.string().optional().nullable(),
});

// Basic info step schema (abstract, description, claims are now file uploads)
export const basicInfoSchema = z.object({
    app_type: z.enum(AppTypeValues as [AppType, ...AppType[]], {
        message: 'Vui lòng chọn loại đơn',
    }),
    title: z.string()
        .min(1, 'Tên sáng chế/giải pháp là bắt buộc')
        .max(500, 'Tên không được quá 500 ký tự'),

    // PCT fields
    is_pct: z.boolean().optional(),
    pct_number: z.string().max(50).optional().nullable(),
    pct_filing_date: z.string().optional().nullable(),
    pct_publication_date: z.string().optional().nullable(),

    // Legacy priority fields (kept for backward compatibility, may be removed later)
    priority_date: z.string().optional().nullable(),
    priority_number: z.string().max(50).optional().nullable(),
    priority_country: z.string().max(2).optional().nullable(),

    // New priority claim fields
    has_priority_claim: z.boolean().optional(),
    priority_type: z.enum(['VN_FIRST', 'PARIS', 'OTHER']).optional().nullable(),
    priority_claims: z.array(priorityClaimSchema).optional(),

    // Industrial Design specific fields
    is_state_budget_task: z.boolean().optional(),
    managing_agency_name: z.string().max(500).optional().nullable(),
    task_name: z.string().max(1000).optional().nullable(),
    task_code: z.string().max(100).optional().nullable(),
    locarno_classification: z.string().max(50).optional().nullable(),
    field_of_use: z.string().max(500).optional().nullable(),

    // Patent/Utility specific fields
    ipc_classification: z.string().max(50).optional().nullable(),
}).refine(
    (data) => {
        if (data.is_pct) {
            return !!data.pct_number && !!data.pct_filing_date;
        }
        return true;
    },
    {
        message: 'Số PCT và ngày nộp PCT là bắt buộc khi đơn là PCT',
        path: ['pct_number'],
    }
).refine(
    (data) => {
        if (data.is_state_budget_task) {
            return !!data.managing_agency_name && !!data.task_name && !!data.task_code;
        }
        return true;
    },
    {
        message: 'Thông tin nhiệm vụ NSNN là bắt buộc',
        path: ['managing_agency_name'],
    }
);

// Parties step schema (at least one applicant required, max 3 total including primary)
export const partiesSchema = z.object({
    applicants: z.array(partySchema)
        .min(1, 'Phải có ít nhất một người nộp đơn')
        .max(3, 'Tối đa 3 người nộp đơn (1 chính + 2 khác)'),
    inventors: z.array(partySchema)
        .max(3, 'Tối đa 3 tác giả/nhà sáng chế')
        .optional(),
    // Representatives removed per requirement: "author implies applicant"
});

// Protection titles schema
export const protectionTitlesSchema = z.object({
    protection_titles: z.array(protectionTitleSchema).optional(),
});

// Attachment validation
export const attachmentSchema = z.object({
    attachment_type: z.enum(AttachmentTypeValues as [AttachmentType, ...AttachmentType[]]),
    file: z.instanceof(File).refine(
        (file) => file.size <= 10 * 1024 * 1024, // 10MB max
        'File không được quá 10MB'
    ),
    description: z.string().max(500).optional(),
});

// Export types inferred from schemas
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type PartiesFormData = z.infer<typeof partiesSchema>;
export type ProtectionTitlesFormData = z.infer<typeof protectionTitlesSchema>;
export type PartyFormData = z.infer<typeof partySchema>;
export type ProtectionTitleFormData = z.infer<typeof protectionTitleSchema>;
export type AttachmentFormData = z.infer<typeof attachmentSchema>;
export type PriorityClaimFormData = z.infer<typeof priorityClaimSchema>;
export type SntcInfoFormData = z.infer<typeof sntcInfoSchema>;

import { z } from 'zod';
import { AppType, AppTypeValues, PartyType, PartyTypeValues, AttachmentType, AttachmentTypeValues } from '../types/enums';

// Party validation schema
export const partySchema = z.object({
    party_type: z.enum(PartyTypeValues as [PartyType, ...PartyType[]]),
    name: z.string().min(1, 'Tên là bắt buộc').max(255, 'Tên không được quá 255 ký tự'),
    name_en: z.string().max(255).optional().nullable(),
    address: z.string().min(1, 'Địa chỉ là bắt buộc').max(500, 'Địa chỉ không được quá 500 ký tự'),
    address_en: z.string().max(500).optional().nullable(),
    nationality: z.string().max(100).optional().nullable(),
    country_code: z.string().max(2, 'Mã quốc gia phải có tối đa 2 ký tự').optional().nullable(),
    email: z.string().email('Email không hợp lệ').optional().nullable().or(z.literal('')),
    phone: z.string().max(20).optional().nullable(),
    id_number: z.string().max(50).optional().nullable(),
    id_type: z.string().max(50).optional().nullable(),
    is_primary: z.boolean().optional(),
    share_percentage: z.number().min(0).max(100).optional().nullable(),
});

// Protection title validation schema
export const protectionTitleSchema = z.object({
    title_type: z.enum(['IPC', 'LOCARNO', 'NICE']),
    class_code: z.string().min(1, 'Mã phân loại là bắt buộc'),
    class_name: z.string().optional().nullable(),
    subclass_code: z.string().optional().nullable(),
    subclass_name: z.string().optional().nullable(),
});

// Basic info step schema
export const basicInfoSchema = z.object({
    app_type: z.enum(AppTypeValues as [AppType, ...AppType[]], {
        message: 'Vui lòng chọn loại đơn',
    }),
    title: z.string()
        .min(1, 'Tên sáng chế/giải pháp là bắt buộc')
        .max(500, 'Tên không được quá 500 ký tự'),
    abstract: z.string()
        .max(2000, 'Tóm tắt không được quá 2000 ký tự')
        .optional()
        .nullable(),
    is_pct: z.boolean().optional(),
    pct_number: z.string().max(50).optional().nullable(),
    pct_filing_date: z.string().optional().nullable(),
    pct_publication_date: z.string().optional().nullable(),
    priority_date: z.string().optional().nullable(),
    priority_number: z.string().max(50).optional().nullable(),
    priority_country: z.string().max(2).optional().nullable(),
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
);

// Description step schema
export const descriptionSchema = z.object({
    description: z.string()
        .min(1, 'Bản mô tả là bắt buộc')
        .max(100000, 'Bản mô tả quá dài'),
    claims: z.string()
        .min(1, 'Yêu cầu bảo hộ là bắt buộc')
        .max(50000, 'Yêu cầu bảo hộ quá dài'),
});

// Parties step schema (at least one applicant required)
export const partiesSchema = z.object({
    applicants: z.array(partySchema).min(1, 'Phải có ít nhất một người nộp đơn'),
    inventors: z.array(partySchema).optional(),
    representatives: z.array(partySchema).optional(),
});

// Protection titles schema
export const protectionTitlesSchema = z.object({
    protection_titles: z.array(protectionTitleSchema).optional(),
});

// Full application schema for validation before submission
export const fullApplicationSchema = z.object({
    app_type: z.enum(AppTypeValues as [AppType, ...AppType[]]),
    title: z.string().min(1).max(500),
    abstract: z.string().max(2000).optional().nullable(),
    description: z.string().min(1).max(100000),
    claims: z.string().min(1).max(50000),
    is_pct: z.boolean(),
    pct_number: z.string().max(50).optional().nullable(),
    pct_filing_date: z.string().optional().nullable(),
    pct_publication_date: z.string().optional().nullable(),
    priority_date: z.string().optional().nullable(),
    priority_number: z.string().max(50).optional().nullable(),
    priority_country: z.string().max(2).optional().nullable(),
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
export type DescriptionFormData = z.infer<typeof descriptionSchema>;
export type PartiesFormData = z.infer<typeof partiesSchema>;
export type ProtectionTitlesFormData = z.infer<typeof protectionTitlesSchema>;
export type PartyFormData = z.infer<typeof partySchema>;
export type ProtectionTitleFormData = z.infer<typeof protectionTitleSchema>;
export type AttachmentFormData = z.infer<typeof attachmentSchema>;
export type FullApplicationFormData = z.infer<typeof fullApplicationSchema>;

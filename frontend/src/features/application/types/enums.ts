export const AppType = {
    PATENT: 'PATENT',
    UTILITY: 'UTILITY',
    INDUSTRIAL_DESIGN: 'INDUSTRIAL_DESIGN',
} as const;

export type AppType = typeof AppType[keyof typeof AppType];

// Application Status (aligned with backend enum)
export const ApplicationStatus = {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    FORMALITY_EXAM: 'FORMALITY_EXAM',
    PUBLISHED: 'PUBLISHED',
    SUB_EXAM_REQ: 'SUB_EXAM_REQ',
    SUB_EXAM: 'SUB_EXAM',
    GRANTED: 'GRANTED',
    REFUSED: 'REFUSED',
    WITHDRAWN: 'WITHDRAWN',
    WAITING_RESPONSE: 'WAITING_RESPONSE',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

// Party Types
export const PartyType = {
    APPLICANT: 'APPLICANT',
    INVENTOR: 'INVENTOR',
    REPRESENTATIVE: 'REPRESENTATIVE',
    ASSIGNEE: 'ASSIGNEE',
} as const;

export type PartyType = typeof PartyType[keyof typeof PartyType];

// Attachment Types (aligned with backend enum)
export const AttachmentType = {
    FORM: 'FORM',
    DESCRIPTION: 'DESCRIPTION',           // Patent specification/description
    CLAIMS: 'CLAIMS',
    ABSTRACT: 'ABSTRACT',
    DRAWINGS: 'DRAWINGS',
    ID_DESCRIPTION: 'ID_DESCRIPTION',      // Industrial design description
    ID_PHOTOS_SET: 'ID_PHOTOS_SET',        // Industrial design photos
    PRIORITY_DOC: 'PRIORITY_DOC',          // Priority document
    POA: 'POA',                            // Power of Attorney
    PAYMENT_RECEIPT: 'PAYMENT_RECEIPT',
    TRANSLATION: 'TRANSLATION',
    OTHER: 'OTHER',
    OFFICIAL_NOTICE: 'OFFICIAL_NOTICE',
    GAZETTE: 'GAZETTE',
    DECISION: 'DECISION',
    CERTIFICATE: 'CERTIFICATE',
} as const;

export type AttachmentType = typeof AttachmentType[keyof typeof AttachmentType];

// Display mappings
export const AppTypeLabels: Record<AppType, string> = {
    [AppType.PATENT]: 'Sáng chế',
    [AppType.UTILITY]: 'Giải pháp hữu ích',
    [AppType.INDUSTRIAL_DESIGN]: 'Kiểu dáng công nghiệp',
};

export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
    [ApplicationStatus.DRAFT]: 'Bản nháp',
    [ApplicationStatus.SUBMITTED]: 'Đã nộp',
    [ApplicationStatus.FORMALITY_EXAM]: 'Thẩm định hình thức',
    [ApplicationStatus.PUBLISHED]: 'Đã công bố',
    [ApplicationStatus.SUB_EXAM_REQ]: 'Yêu cầu thẩm định nội dung',
    [ApplicationStatus.SUB_EXAM]: 'Thẩm định nội dung',
    [ApplicationStatus.GRANTED]: 'Đã cấp bằng',
    [ApplicationStatus.REFUSED]: 'Từ chối',
    [ApplicationStatus.WITHDRAWN]: 'Đã rút',
    [ApplicationStatus.WAITING_RESPONSE]: 'Chờ phản hồi',
};

export const PartyTypeLabels: Record<PartyType, string> = {
    [PartyType.APPLICANT]: 'Người nộp đơn',
    [PartyType.INVENTOR]: 'Tác giả/Nhà sáng chế',
    [PartyType.REPRESENTATIVE]: 'Đại diện',
    [PartyType.ASSIGNEE]: 'Người được chuyển nhượng',
};

export const AttachmentTypeLabels: Record<AttachmentType, string> = {
    [AttachmentType.FORM]: 'Tờ khai',
    [AttachmentType.DESCRIPTION]: 'Bản mô tả',
    [AttachmentType.CLAIMS]: 'Yêu cầu bảo hộ',
    [AttachmentType.ABSTRACT]: 'Tóm tắt',
    [AttachmentType.DRAWINGS]: 'Bản vẽ',
    [AttachmentType.ID_DESCRIPTION]: 'Mô tả kiểu dáng',
    [AttachmentType.ID_PHOTOS_SET]: 'Bộ ảnh kiểu dáng',
    [AttachmentType.PRIORITY_DOC]: 'Tài liệu ưu tiên',
    [AttachmentType.POA]: 'Giấy ủy quyền',
    [AttachmentType.PAYMENT_RECEIPT]: 'Biên lai thanh toán',
    [AttachmentType.TRANSLATION]: 'Bản dịch',
    [AttachmentType.OTHER]: 'Tài liệu khác',
    [AttachmentType.OFFICIAL_NOTICE]: 'Thông báo chính thức',
    [AttachmentType.GAZETTE]: 'Công báo',
    [AttachmentType.DECISION]: 'Quyết định',
    [AttachmentType.CERTIFICATE]: 'Bằng/Giấy chứng nhận',
};

// Status colors for UI (Tailwind classes)
export const ApplicationStatusColors: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
    [ApplicationStatus.DRAFT]: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    [ApplicationStatus.SUBMITTED]: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    [ApplicationStatus.FORMALITY_EXAM]: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    [ApplicationStatus.PUBLISHED]: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
    [ApplicationStatus.SUB_EXAM_REQ]: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    [ApplicationStatus.SUB_EXAM]: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
    [ApplicationStatus.GRANTED]: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    [ApplicationStatus.REFUSED]: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    [ApplicationStatus.WITHDRAWN]: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' },
    [ApplicationStatus.WAITING_RESPONSE]: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
};

// Helper to get all values for validation
export const AppTypeValues = Object.values(AppType) as AppType[];
export const ApplicationStatusValues = Object.values(ApplicationStatus) as ApplicationStatus[];
export const PartyTypeValues = Object.values(PartyType) as PartyType[];
export const AttachmentTypeValues = Object.values(AttachmentType) as AttachmentType[];

export const AppType = {
    PATENT: 'PATENT',
    UTILITY: 'UTILITY',
    INDUSTRIAL_DESIGN: 'INDUSTRIAL_DESIGN',
} as const;

export type AppType = typeof AppType[keyof typeof AppType];

// Application Status
export const ApplicationStatus = {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    FORMALITY_EXAMINATION: 'FORMALITY_EXAMINATION',
    FORMALITY_REJECTED: 'FORMALITY_REJECTED',
    SUBSTANTIVE_EXAMINATION: 'SUBSTANTIVE_EXAMINATION',
    PUBLISHED: 'PUBLISHED',
    GRANTED: 'GRANTED',
    REJECTED: 'REJECTED',
    WITHDRAWN: 'WITHDRAWN',
    ABANDONED: 'ABANDONED',
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

// Attachment Types
export const AttachmentType = {
    SPECIFICATION: 'SPECIFICATION',
    CLAIMS: 'CLAIMS',
    ABSTRACT: 'ABSTRACT',
    DRAWINGS: 'DRAWINGS',
    POWER_OF_ATTORNEY: 'POWER_OF_ATTORNEY',
    PRIORITY_DOCUMENT: 'PRIORITY_DOCUMENT',
    ASSIGNMENT: 'ASSIGNMENT',
    DECLARATION: 'DECLARATION',
    SEARCH_REPORT: 'SEARCH_REPORT',
    EXAMINATION_REPORT: 'EXAMINATION_REPORT',
    CERTIFICATE: 'CERTIFICATE',
    OTHER: 'OTHER',
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
    [ApplicationStatus.FORMALITY_EXAMINATION]: 'Thẩm định hình thức',
    [ApplicationStatus.FORMALITY_REJECTED]: 'Từ chối hình thức',
    [ApplicationStatus.SUBSTANTIVE_EXAMINATION]: 'Thẩm định nội dung',
    [ApplicationStatus.PUBLISHED]: 'Đã công bố',
    [ApplicationStatus.GRANTED]: 'Đã cấp bằng',
    [ApplicationStatus.REJECTED]: 'Từ chối',
    [ApplicationStatus.WITHDRAWN]: 'Đã rút',
    [ApplicationStatus.ABANDONED]: 'Bỏ đơn',
};

export const PartyTypeLabels: Record<PartyType, string> = {
    [PartyType.APPLICANT]: 'Người nộp đơn',
    [PartyType.INVENTOR]: 'Tác giả/Nhà sáng chế',
    [PartyType.REPRESENTATIVE]: 'Đại diện',
    [PartyType.ASSIGNEE]: 'Người được chuyển nhượng',
};

export const AttachmentTypeLabels: Record<AttachmentType, string> = {
    [AttachmentType.SPECIFICATION]: 'Bản mô tả',
    [AttachmentType.CLAIMS]: 'Yêu cầu bảo hộ',
    [AttachmentType.ABSTRACT]: 'Tóm tắt',
    [AttachmentType.DRAWINGS]: 'Bản vẽ',
    [AttachmentType.POWER_OF_ATTORNEY]: 'Giấy ủy quyền',
    [AttachmentType.PRIORITY_DOCUMENT]: 'Tài liệu ưu tiên',
    [AttachmentType.ASSIGNMENT]: 'Văn bản chuyển nhượng',
    [AttachmentType.DECLARATION]: 'Tờ khai',
    [AttachmentType.SEARCH_REPORT]: 'Báo cáo tra cứu',
    [AttachmentType.EXAMINATION_REPORT]: 'Báo cáo thẩm định',
    [AttachmentType.CERTIFICATE]: 'Bằng/Giấy chứng nhận',
    [AttachmentType.OTHER]: 'Tài liệu khác',
};

// Status colors for UI (Tailwind classes)
export const ApplicationStatusColors: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
    [ApplicationStatus.DRAFT]: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    [ApplicationStatus.SUBMITTED]: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    [ApplicationStatus.FORMALITY_EXAMINATION]: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    [ApplicationStatus.FORMALITY_REJECTED]: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    [ApplicationStatus.SUBSTANTIVE_EXAMINATION]: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
    [ApplicationStatus.PUBLISHED]: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
    [ApplicationStatus.GRANTED]: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    [ApplicationStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    [ApplicationStatus.WITHDRAWN]: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' },
    [ApplicationStatus.ABANDONED]: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' },
};

// Helper to get all values for validation
export const AppTypeValues = Object.values(AppType) as AppType[];
export const ApplicationStatusValues = Object.values(ApplicationStatus) as ApplicationStatus[];
export const PartyTypeValues = Object.values(PartyType) as PartyType[];
export const AttachmentTypeValues = Object.values(AttachmentType) as AttachmentType[];

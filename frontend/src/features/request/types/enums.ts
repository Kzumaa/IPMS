// Request Type Enum
export const RequestType = {
  AMENDMENT: 'AMENDMENT',
  ASSIGNMENT: 'ASSIGNMENT',
  LICENSE: 'LICENSE',
  SPLIT: 'SPLIT',
  CONVERSION: 'CONVERSION',
  APPEAL: 'APPEAL',
} as const;

export type RequestType = (typeof RequestType)[keyof typeof RequestType];

export const RequestTypeValues = Object.values(RequestType);

export const RequestTypeLabels: Record<RequestType, string> = {
  AMENDMENT: 'Sửa đổi đơn',
  ASSIGNMENT: 'Chuyển nhượng',
  LICENSE: 'Li-xăng',
  SPLIT: 'Tách đơn',
  CONVERSION: 'Chuyển đổi',
  APPEAL: 'Khiếu nại',
};

// Request Status Enum
export const RequestStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  EXAMINING: 'EXAMINING',
  APPROVED: 'APPROVED',
  REFUSED: 'REFUSED',
  RECORDED: 'RECORDED',
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const RequestStatusValues = Object.values(RequestStatus);

export const RequestStatusLabels: Record<RequestStatus, string> = {
  DRAFT: 'Bản nháp',
  SUBMITTED: 'Đã nộp',
  EXAMINING: 'Đang thẩm định',
  APPROVED: 'Chấp nhận',
  REFUSED: 'Từ chối',
  RECORDED: 'Đã ghi nhận',
};

export const RequestStatusColors: Record<RequestStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  EXAMINING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REFUSED: 'bg-red-100 text-red-800',
  RECORDED: 'bg-purple-100 text-purple-800',
};

// Amendment Section Enum
export const AmendmentSection = {
  BIBLIOGRAPHY: 'BIBLIOGRAPHY',
  SPECIFICATION: 'SPECIFICATION',
  CLAIMS: 'CLAIMS',
  DRAWINGS: 'DRAWINGS',
  REPRESENTATIVE: 'REPRESENTATIVE',
} as const;

export type AmendmentSection = (typeof AmendmentSection)[keyof typeof AmendmentSection];

export const AmendmentSectionValues = Object.values(AmendmentSection);

export const AmendmentSectionLabels: Record<AmendmentSection, string> = {
  BIBLIOGRAPHY: 'Thông tin thư mục',
  SPECIFICATION: 'Bản mô tả',
  CLAIMS: 'Yêu cầu bảo hộ',
  DRAWINGS: 'Bản vẽ/Hình ảnh',
  REPRESENTATIVE: 'Người đại diện',
};

// Transfer Type Enum
export const TransferType = {
  CONTRACT: 'CONTRACT',
  INHERITANCE: 'INHERITANCE',
  MERGER: 'MERGER',
  COURT_DECISION: 'COURT_DECISION',
} as const;

export type TransferType = (typeof TransferType)[keyof typeof TransferType];

export const TransferTypeValues = Object.values(TransferType);

export const TransferTypeLabels: Record<TransferType, string> = {
  CONTRACT: 'Hợp đồng chuyển nhượng',
  INHERITANCE: 'Thừa kế',
  MERGER: 'Sáp nhập doanh nghiệp',
  COURT_DECISION: 'Quyết định của tòa án',
};

// License Type Enum
export const LicenseType = {
  EXCLUSIVE: 'EXCLUSIVE',
  NON_EXCLUSIVE: 'NON_EXCLUSIVE',
  COMPULSORY: 'COMPULSORY',
} as const;

export type LicenseType = (typeof LicenseType)[keyof typeof LicenseType];

export const LicenseTypeValues = Object.values(LicenseType);

export const LicenseTypeLabels: Record<LicenseType, string> = {
  EXCLUSIVE: 'Li-xăng độc quyền',
  NON_EXCLUSIVE: 'Li-xăng không độc quyền',
  COMPULSORY: 'Li-xăng bắt buộc',
};

// Appeal Type Enum
export const AppealType = {
  DECISION_APPEAL: 'DECISION_APPEAL',
  NOTICE_OBJECTION: 'NOTICE_OBJECTION',
} as const;

export type AppealType = (typeof AppealType)[keyof typeof AppealType];

export const AppealTypeValues = Object.values(AppealType);

export const AppealTypeLabels: Record<AppealType, string> = {
  DECISION_APPEAL: 'Khiếu nại quyết định',
  NOTICE_OBJECTION: 'Phản đối thông báo',
};

// Appeal Resolution Enum
export const AppealResolution = {
  UPHELD: 'UPHELD',
  OVERTURNED: 'OVERTURNED',
  PARTIAL: 'PARTIAL',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type AppealResolution = (typeof AppealResolution)[keyof typeof AppealResolution];

export const AppealResolutionValues = Object.values(AppealResolution);

export const AppealResolutionLabels: Record<AppealResolution, string> = {
  UPHELD: 'Giữ nguyên quyết định',
  OVERTURNED: 'Hủy bỏ quyết định',
  PARTIAL: 'Sửa đổi một phần',
  WITHDRAWN: 'Rút khiếu nại',
};

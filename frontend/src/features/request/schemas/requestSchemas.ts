import { z } from 'zod';
import {
  AmendmentSection,
  AmendmentSectionValues,
  TransferType,
  TransferTypeValues,
  LicenseType,
  LicenseTypeValues,
} from '../types/enums';

// Amendment Schema
export const amendmentSchema = z.object({
  section: z.enum(AmendmentSectionValues as [AmendmentSection, ...AmendmentSection[]], {
    message: 'Vui lòng chọn nội dung cần sửa đổi',
  }),
  change_summary: z
    .string()
    .min(10, 'Mô tả thay đổi phải có ít nhất 10 ký tự')
    .max(5000, 'Mô tả thay đổi không được quá 5000 ký tự'),
  field_name: z.string().max(100).optional(),
  old_value: z.string().optional(),
  new_value: z.string().optional(),
});

export type AmendmentFormData = z.infer<typeof amendmentSchema>;

// Assignment Base Schema (for type inference)
const assignmentBaseSchema = z.object({
  assignor_user_id: z.number({
    message: 'Vui lòng chọn người chuyển nhượng',
  }),
  assignee_user_id: z.number({
    message: 'Vui lòng chọn người nhận chuyển nhượng',
  }),
  transfer_type: z.enum(TransferTypeValues as [TransferType, ...TransferType[]], {
    message: 'Vui lòng chọn hình thức chuyển nhượng',
  }),
  contract_number: z.string().max(100).optional(),
  contract_date: z.string().optional(),
});

// Assignment Schema with refinements
export const assignmentSchema = assignmentBaseSchema.refine(
  (data) => data.assignor_user_id !== data.assignee_user_id,
  {
    message: 'Người chuyển nhượng và người nhận không được trùng nhau',
    path: ['assignee_user_id'],
  }
);

export type AssignmentFormData = z.infer<typeof assignmentBaseSchema>;

// License Base Schema (for type inference)
const licenseBaseSchema = z.object({
  licensor_user_id: z.number({
    message: 'Vui lòng chọn bên cấp phép',
  }),
  licensee_user_ids: z
    .array(z.number(), {
      message: 'Vui lòng chọn bên được cấp phép',
    })
    .min(1, 'Phải chọn ít nhất một bên được cấp phép')
    .max(10, 'Tối đa 10 bên được cấp phép'),
  license_type: z.enum(LicenseTypeValues as [LicenseType, ...LicenseType[]], {
    message: 'Vui lòng chọn loại li-xăng',
  }),
  valid_from: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  valid_to: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  scope_territory: z.string().max(255).optional(),
  scope_products: z.string().optional(),
  contract_number: z.string().max(100).optional(),
});

// License Schema with refinements
export const licenseSchema = licenseBaseSchema
  .refine(
    (data) => !data.licensee_user_ids.includes(data.licensor_user_id),
    {
      message: 'Bên cấp phép không được nằm trong danh sách bên được cấp phép',
      path: ['licensee_user_ids'],
    }
  )
  .refine(
    (data) => new Set(data.licensee_user_ids).size === data.licensee_user_ids.length,
    {
      message: 'Không được có bên được cấp phép trùng lặp',
      path: ['licensee_user_ids'],
    }
  )
  .refine(
    (data) => {
      if (data.valid_from && data.valid_to) {
        return new Date(data.valid_to) > new Date(data.valid_from);
      }
      return true;
    },
    {
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
      path: ['valid_to'],
    }
  );

export type LicenseFormData = z.infer<typeof licenseBaseSchema>;

// Split Schema
export const splitSchema = z.object({
  split_description: z
    .string()
    .min(10, 'Mô tả tách đơn phải có ít nhất 10 ký tự')
    .max(5000, 'Mô tả tách đơn không được quá 5000 ký tự'),
});

export type SplitFormData = z.infer<typeof splitSchema>;

// Complaint Schema (replaces Appeal per SRS Section 3.2)
export const complaintSchema = z.object({
  grounds: z
    .string()
    .min(50, 'Lý do khiếu nại phải có ít nhất 50 ký tự')
    .max(10000, 'Lý do khiếu nại không được quá 10000 ký tự'),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;

// Renewal Schema
export const renewalSchema = z.object({
  renewal_years: z
    .number({ message: 'Vui lòng nhập số năm gia hạn' })
    .min(1, 'Số năm gia hạn tối thiểu là 1')
    .max(20, 'Số năm gia hạn tối đa là 20'),
});

export type RenewalFormData = z.infer<typeof renewalSchema>;

// Termination Schema
export const terminationSchema = z.object({
  reason: z.string().max(5000, 'Lý do chấm dứt không được quá 5000 ký tự').optional(),
  effective_date: z.string().optional(),
});

export type TerminationFormData = z.infer<typeof terminationSchema>;

// Withdrawal Schema (for pre-grant applications)
export const withdrawalSchema = z.object({
  reason: z.string().max(2000, 'Lý do rút đơn không được quá 2000 ký tự').optional(),
  effective_date: z.string().optional(),
});

export type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

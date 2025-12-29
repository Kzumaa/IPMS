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
  licensee_user_id: z.number({
    message: 'Vui lòng chọn bên được cấp phép',
  }),
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
  .refine((data) => data.licensor_user_id !== data.licensee_user_id, {
    message: 'Bên cấp phép và bên được cấp phép không được trùng nhau',
    path: ['licensee_user_id'],
  })
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

// Appeal Base Schema (for type inference)
const appealBaseSchema = z.object({
  target_decision_id: z.number().optional(),
  target_event_id: z.number().optional(),
  notice_date: z.string().optional(),
  grounds: z
    .string()
    .min(50, 'Lý do khiếu nại phải có ít nhất 50 ký tự')
    .max(10000, 'Lý do khiếu nại không được quá 10000 ký tự'),
});

// Appeal Schema with refinements
export const appealSchema = appealBaseSchema.refine(
  (data) => data.target_decision_id || data.target_event_id,
  {
    message: 'Vui lòng chọn đối tượng khiếu nại',
    path: ['target_decision_id'],
  }
);

export type AppealFormData = z.infer<typeof appealBaseSchema>;

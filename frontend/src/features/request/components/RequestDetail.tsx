import React from "react";
import { useTranslation } from "react-i18next";
import type { ApplicationRequest } from "../types/requestTypes";
import RequestStatusBadge from "./RequestStatusBadge";
import RequestTypeBadge from "./RequestTypeBadge";
import {
  TransferTypeLabels,
  LicenseTypeLabels,
  AppealTypeLabels,
  AppealResolutionLabels,
  ComplaintResolutionLabels,
} from "../types/enums";

interface RequestDetailProps {
  request: ApplicationRequest;
  onSubmit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
  submitting?: boolean;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const RequestDetail: React.FC<RequestDetailProps> = ({
  request,
  onSubmit,
  onDelete,
  loading = false,
  submitting = false,
}) => {
  const { t } = useTranslation();

  const renderAmendmentDetails = () => {
    if (!request.amendment) return null;
    const { amendment } = request;

    // Helper to format field labels
    const getFieldLabel = (field: string): string => {
      const labels: Record<string, string> = {
        title: t("application.steps.basicInfo.inventionTitle", "Title"),
        parties: t("application.steps.parties.title", "Parties"),
        attachments: t("application.steps.attachments.title", "Documents"),
        metrics: t("application.metrics.title", "Metrics"),
        applicant_is_inventor: "Applicant is Inventor",
        publication_early_requested: "Early Publication Requested",
        pub_delay_months: "Publication Delay (months)",
      };
      return labels[field] || field;
    };

    // Helper to format values
    const formatValue = (value: unknown): string => {
      if (value === null || value === undefined) return "-";
      if (typeof value === "boolean")
        return value ? t("common.yes", "Yes") : t("common.no", "No");
      if (typeof value === "object") {
        if (Array.isArray(value)) return `${value.length} item(s)`;
        return JSON.stringify(value);
      }
      return String(value);
    };

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t("request.amendment.details")}
        </h4>

        {/* Change Summary */}
        <div>
          <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {t("request.amendment.changeSummary")}
          </dt>
          <dd className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg whitespace-pre-wrap">
            {amendment.change_summary}
          </dd>
        </div>

        {/* Pending Version Changes (Edit-mode amendments) */}
        {amendment.pending_version &&
          amendment.pending_version.field_changes && (
            <div className="mt-6">
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                {t("request.amendment.proposedChanges", "Proposed Changes")}
              </h5>
              <div className="space-y-3">
                {Object.entries(amendment.pending_version.field_changes).map(
                  ([field, change]: [string, any]) => {
                    // Handle party changes with detailed info
                    if (
                      field === "parties" &&
                      typeof change === "object" &&
                      (change.added || change.removed || change.modified)
                    ) {
                      const getPartyDisplayName = (party: any): string => {
                        return party.snapshot_name || party.name || "Unknown";
                      };

                      const getPartyRole = (party: any): string => {
                        return party.role || party.party_type || "Unknown Role";
                      };

                      const renderPartyDetails = (party: any) => {
                        const name = getPartyDisplayName(party);
                        const email = party.snapshot_email || party.email;
                        const address = party.snapshot_address || party.address;
                        const phone = party.phone;
                        const idNumber = party.id_number;
                        const nationality = party.nationality_text || party.nationality || party.country_code;
                        const role = getPartyRole(party);

                        return (
                          <div className="text-xs space-y-0.5">
                            <div className="font-semibold">{name} ({role})</div>
                            {email && <div className="text-slate-600 dark:text-slate-400">Email: {email}</div>}
                            {phone && <div className="text-slate-600 dark:text-slate-400">Phone: {phone}</div>}
                            {address && <div className="text-slate-600 dark:text-slate-400">Address: {address}</div>}
                            {idNumber && <div className="text-slate-600 dark:text-slate-400">ID: {idNumber}</div>}
                            {nationality && <div className="text-slate-600 dark:text-slate-400">Nationality: {nationality}</div>}
                          </div>
                        );
                      };

                      const renderPartyFieldChanges = (oldParty: any, newParty: any) => {
                        const fields = [
                          { key: ['snapshot_name', 'name'], label: 'Name' },
                          { key: ['snapshot_email', 'email'], label: 'Email' },
                          { key: ['phone'], label: 'Phone' },
                          { key: ['snapshot_address', 'address'], label: 'Address' },
                          { key: ['id_number'], label: 'ID Number' },
                          { key: ['id_type'], label: 'ID Type' },
                          { key: ['nationality', 'country_code'], label: 'Nationality' },
                          { key: ['role', 'party_type'], label: 'Role' },
                        ];

                        const changes: Array<{ label: string; oldValue: string; newValue: string }> = [];

                        fields.forEach(({ key, label }) => {
                          const keys = Array.isArray(key) ? key : [key];
                          let oldValue = null;
                          let newValue = null;

                          for (const k of keys) {
                            if (oldValue === null && oldParty[k] !== undefined) oldValue = oldParty[k];
                            if (newValue === null && newParty[k] !== undefined) newValue = newParty[k];
                          }

                          if (oldValue !== newValue) {
                            changes.push({
                              label,
                              oldValue: oldValue || '-',
                              newValue: newValue || '-',
                            });
                          }
                        });

                        return changes;
                      };

                      return (
                        <div
                          key={field}
                          className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3"
                        >
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            {getFieldLabel(field)}
                          </div>
                          <div className="space-y-3">
                            {/* Added Parties */}
                            {change.added && change.added.length > 0 && (
                              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                                  Added Parties ({change.added.length})
                                </p>
                                <div className="space-y-2">
                                  {change.added.map((party: any, idx: number) => (
                                    <div key={idx} className="border-l-2 border-green-400 pl-2">
                                      {renderPartyDetails(party)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Removed Parties */}
                            {change.removed && change.removed.length > 0 && (
                              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                                  Removed Parties ({change.removed.length})
                                </p>
                                <div className="space-y-2">
                                  {change.removed.map((party: any, idx: number) => (
                                    <div key={idx} className="border-l-2 border-red-400 pl-2 line-through opacity-70">
                                      {renderPartyDetails(party)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Modified Parties */}
                            {change.modified && change.modified.length > 0 && (
                              <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                                  Modified Parties ({change.modified.length})
                                </p>
                                <div className="space-y-3">
                                  {change.modified.map((mod: any, idx: number) => {
                                    const fieldChanges = renderPartyFieldChanges(mod.old, mod.new);
                                    return (
                                      <div key={idx} className="border-l-2 border-amber-400 pl-2">
                                        <div className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                          {getPartyDisplayName(mod.old || mod.new)} ({getPartyRole(mod.old || mod.new)})
                                        </div>
                                        {fieldChanges.length > 0 ? (
                                          <div className="space-y-2">
                                            {fieldChanges.map((fc, fcIdx) => (
                                              <div key={fcIdx} className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                  <div className="text-slate-500 dark:text-slate-400 mb-0.5">{fc.label}</div>
                                                  <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded line-through">
                                                    {fc.oldValue}
                                                  </div>
                                                </div>
                                                <div>
                                                  <div className="text-slate-500 dark:text-slate-400 mb-0.5">&nbsp;</div>
                                                  <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                                    {fc.newValue}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                                            No field changes detected
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (
                      field === "attachments" &&
                      typeof change === "object" &&
                      (change.added || change.removed || change.replaced)
                    ) {
                      return (
                        <div
                          key={field}
                          className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3"
                        >
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {getFieldLabel(field)}
                          </div>

                          {/* Added files */}
                          {change.added && change.added.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                Added ({change.added.length}):
                              </span>
                              <ul className="mt-1 space-y-1">
                                {change.added.map((doc: any, idx: number) => (
                                  <li
                                    key={idx}
                                    className="text-xs text-slate-600 dark:text-slate-400 ml-2"
                                  >
                                    •{" "}
                                    {doc.filename || doc.doc_type || "Document"}
                                    {doc.doc_type && ` (${doc.doc_type})`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Removed files */}
                          {change.removed && change.removed.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                Removed ({change.removed.length}):
                              </span>
                              <ul className="mt-1 space-y-1">
                                {change.removed.map((doc: any, idx: number) => (
                                  <li
                                    key={idx}
                                    className="text-xs text-slate-600 dark:text-slate-400 ml-2 line-through"
                                  >
                                    •{" "}
                                    {doc.filename || doc.doc_type || "Document"}
                                    {doc.doc_type && ` (${doc.doc_type})`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Replaced files */}
                          {change.replaced && change.replaced.length > 0 && (
                            <div>
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                Replaced ({change.replaced.length}):
                              </span>
                              {change.replaced.map(
                                (replacement: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="mt-2 border-l-2 border-amber-300 dark:border-amber-700 pl-3"
                                  >
                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                      {replacement.doc_type}
                                    </div>

                                    {/* Old files */}
                                    {replacement.old_files &&
                                      replacement.old_files.length > 0 && (
                                        <div className="mb-2">
                                          <span className="text-xs text-red-600 dark:text-red-400">
                                            Old:
                                          </span>
                                          <ul className="mt-0.5 space-y-0.5">
                                            {replacement.old_files.map(
                                              (file: any, fileIdx: number) => (
                                                <li
                                                  key={fileIdx}
                                                  className="text-xs text-slate-600 dark:text-slate-400 ml-2 line-through"
                                                >
                                                  •{" "}
                                                  {file.filename ||
                                                    "Unknown file"}
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    {/* New files */}
                                    {replacement.new_files &&
                                      replacement.new_files.length > 0 && (
                                        <div>
                                          <span className="text-xs text-green-600 dark:text-green-400">
                                            New:
                                          </span>
                                          <ul className="mt-0.5 space-y-0.5">
                                            {replacement.new_files.map(
                                              (file: any, fileIdx: number) => (
                                                <li
                                                  key={fileIdx}
                                                  className="text-xs text-slate-600 dark:text-slate-400 ml-2"
                                                >
                                                  •{" "}
                                                  {file.filename ||
                                                    "Unknown file"}
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Simple value changes
                    if (change.old !== undefined || change.new !== undefined) {
                      return (
                        <div
                          key={field}
                          className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3"
                        >
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {getFieldLabel(field)}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-red-600 dark:text-red-400 line-through">
                              {formatValue(change.old)}
                            </span>
                            <span className="material-symbols-outlined text-slate-400 !text-xs">
                              arrow_forward
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              {formatValue(change.new)}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  }
                )}
              </div>
            </div>
          )}

        {/* Legacy simple amendment fields (for old-style amendments) */}
        {!amendment.pending_version_id && (
          <>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {t("request.amendment.sections", "Affected Sections")}
                </dt>
                <dd>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(amendment.section) && amendment.section.length > 0 ? (
                      amendment.section.map((sec: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
                          {sec.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
                    )}
                  </div>
                </dd>
              </div>
              {amendment.field_name && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    {t("request.amendment.fieldName")}
                  </dt>
                  <dd className="text-sm text-slate-900 dark:text-white">
                    {amendment.field_name}
                  </dd>
                </div>
              )}
            </dl>
            {(amendment.old_value || amendment.new_value) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amendment.old_value && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      {t("request.amendment.oldValue")}
                    </dt>
                    <dd className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg line-through">
                      {amendment.old_value}
                    </dd>
                  </div>
                )}
                {amendment.new_value && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      {t("request.amendment.newValue")}
                    </dt>
                    <dd className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      {amendment.new_value}
                    </dd>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderAssignmentDetails = () => {
    if (!request.assignment) return null;
    const { assignment } = request;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t("request.assignment.details")}
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.assignment.transferType")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {TransferTypeLabels[assignment.transfer_type]}
            </dd>
          </div>
          {assignment.contract_number && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t("request.assignment.contractNumber")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {assignment.contract_number}
              </dd>
            </div>
          )}
          {assignment.contract_date && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t("request.assignment.contractDate")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {formatDate(assignment.contract_date)}
              </dd>
            </div>
          )}
        </dl>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignment.assignor && (
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t("request.assignment.assignor")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                <p className="font-medium">{assignment.assignor.name}</p>
                <p className="text-slate-500 dark:text-slate-400">
                  {assignment.assignor.email}
                </p>
              </dd>
            </div>
          )}
          {assignment.assignee && (
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t("request.assignment.assignee")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                <p className="font-medium">{assignment.assignee.name}</p>
                <p className="text-slate-500 dark:text-slate-400">
                  {assignment.assignee.email}
                </p>
              </dd>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLicenseDetails = () => {
    if (!request.license) return null;
    const { license } = request;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t("request.license.details")}
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.license.licenseType")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {LicenseTypeLabels[license.license_type]}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.license.validFrom", "Valid From")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {formatDate(license.valid_from)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.license.validTo", "Valid To")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {formatDate(license.valid_to)}
            </dd>
          </div>
          {license.scope_territory && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t("request.license.scopeTerritory")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {license.scope_territory}
              </dd>
            </div>
          )}
          {license.contract_number && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t("request.license.contractNumber")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {license.contract_number}
              </dd>
            </div>
          )}
        </dl>
        {license.scope_products && (
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("request.license.scopeProducts")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
              {license.scope_products}
            </dd>
          </div>
        )}
        {/* Licensor */}
        {license.licensor && (
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t("request.license.licensor")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              <p className="font-medium">{license.licensor.name}</p>
              <p className="text-slate-500 dark:text-slate-400">
                {license.licensor.email}
              </p>
            </dd>
          </div>
        )}

        {/* Licensees */}
        {license.licensees && license.licensees.length > 0 && (
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t("request.license.licensees", "Licensees")} ({license.licensees.length})
            </dt>
            <dd className="space-y-2">
              {license.licensees.map((licensee, idx) => (
                <div
                  key={`${licensee.id}-${idx}`}
                  className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 !text-base">
                      person
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {licensee.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {licensee.email}
                    </p>
                  </div>
                </div>
              ))}
            </dd>
          </div>
        )}
      </div>
    );
  };

  const renderAppealDetails = () => {
    if (!request.appeal) return null;
    const { appeal } = request;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t("request.appeal.details")}
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.appeal.type")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {AppealTypeLabels[appeal.appeal_type]}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.appeal.deadline")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white flex items-center">
              {formatDate(appeal.deadline)}
              {appeal.is_within_deadline ? (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined !text-sm">
                    check_circle
                  </span>
                </span>
              ) : (
                <span className="ml-2 text-red-600 dark:text-red-400">
                  <span className="material-symbols-outlined !text-sm">
                    error
                  </span>
                </span>
              )}
            </dd>
          </div>
          {appeal.resolution && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t("request.appeal.resolution")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {AppealResolutionLabels[appeal.resolution]}
              </dd>
            </div>
          )}
          {appeal.resolved_at && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t("request.appeal.resolvedAt")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {formatDate(appeal.resolved_at)}
              </dd>
            </div>
          )}
        </dl>
        <div>
          <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {t("request.appeal.grounds")}
          </dt>
          <dd className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            {appeal.grounds}
          </dd>
        </div>
      </div>
    );
  };

  const renderComplaintDetails = () => {
    if (!request.complaint) return null;
    const { complaint } = request;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t("request.complaint.details")}
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.complaint.number")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {complaint.complaint_number}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.complaint.deadline")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {formatDate(complaint.deadline)}
            </dd>
          </div>
          {complaint.resolution && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t("request.complaint.resolution")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {ComplaintResolutionLabels[complaint.resolution]}
              </dd>
            </div>
          )}
          {complaint.resolved_at && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t("request.complaint.resolvedAt")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {formatDate(complaint.resolved_at)}
              </dd>
            </div>
          )}
        </dl>
        <div>
          <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {t("request.complaint.grounds")}
          </dt>
          <dd className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            {complaint.grounds}
          </dd>
        </div>
      </div>
    );
  };

  const renderRenewalDetails = () => {
    if (!request.renewal) return null;
    const { renewal } = request;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t("request.renewal.details")}
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.renewal.renewalYears")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {renewal.renewal_years} {t("request.renewal.years")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.renewal.currentExpiration")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {formatDate(renewal.current_expiration_date)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.renewal.newExpiration")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white font-medium text-green-600 dark:text-green-400">
              {formatDate(renewal.new_expiration_date)}
            </dd>
          </div>
        </dl>
      </div>
    );
  };

  const renderTerminationDetails = () => {
    if (!request.termination) return null;
    const { termination } = request;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t("request.termination.details")}
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.termination.effectiveDate")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {formatDate(termination.effective_date)}
            </dd>
          </div>
        </dl>
        {termination.reason && (
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("request.termination.reason")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
              {termination.reason}
            </dd>
          </div>
        )}
      </div>
    );
  };

  const renderTypeSpecificDetails = () => {
    switch (request.type) {
      case "AMENDMENT":
        return renderAmendmentDetails();
      case "ASSIGNMENT":
        return renderAssignmentDetails();
      case "LICENSE":
        return renderLicenseDetails();
      case "APPEAL":
        return renderAppealDetails();
      case "COMPLAINT":
        return renderComplaintDetails();
      case "RENEWAL":
        return renderRenewalDetails();
      case "TERMINATION":
        return renderTerminationDetails();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">
            refresh
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {t("common.loading")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RequestTypeBadge type={request.type} size="lg" />
            <span className="text-lg font-medium text-slate-900 dark:text-white">
              #{request.id}
            </span>
          </div>
          <RequestStatusBadge status={request.status} size="lg" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* General Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("request.table.date")}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {formatDate(request.request_date || request.created_at)}
            </dd>
          </div>
          {request.processed_date && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t("request.processedDate")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {formatDate(request.processed_date)}
              </dd>
            </div>
          )}
          {request.creator && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t("request.creator")}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {request.creator.name}
              </dd>
            </div>
          )}
        </div>

        {/* Type-specific details */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          {renderTypeSpecificDetails()}
        </div>

        {/* Fee Quote */}
        {request.fee_quote && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-4">
              {t("request.feeQuote")}
            </h4>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  {t("request.totalFee")}
                </span>
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(request.fee_quote.total_amount)}
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t("request.feeStatus")}: {request.fee_quote.status}
              </div>
            </div>
          </div>
        )}

        {/* Processing Notes */}
        {request.processing_notes && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">
              {t("request.processingNotes")}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
              {request.processing_notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {(request.can_submit || request.can_edit) && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-end space-x-3">
            {request.can_edit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600
                  rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {t("common.delete")}
              </button>
            )}
            {request.can_submit && onSubmit && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting && (
                  <span className="material-symbols-outlined animate-spin mr-2 !text-lg">
                    refresh
                  </span>
                )}
                {t("request.submit")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail;

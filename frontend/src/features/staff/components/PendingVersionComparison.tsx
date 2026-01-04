import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { applicationService } from "../../application/services/applicationService";
import type {
  PendingVersion,
  FieldChange,
} from "../../application/types/applicationTypes";

interface PendingVersionComparisonProps {
  applicationId: number;
}

const PendingVersionComparison: React.FC<PendingVersionComparisonProps> = ({
  applicationId,
}) => {
  const { t } = useTranslation();
  const [pendingVersion, setPendingVersion] = useState<PendingVersion | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingVersion = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getPendingVersion(
          applicationId
        );
        setPendingVersion(response.data);
      } catch (err) {
        setError("Failed to load pending version");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingVersion();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">
          refresh
        </span>
        <span className="text-slate-500">
          {t("common.loading", "Loading...")}
        </span>
      </div>
    );
  }

  if (error || !pendingVersion) {
    return null;
  }

  const getFieldLabel = (fieldPath: string): string => {
    const labels: Record<string, string> = {
      title: t("application.fields.title", "Title"),
      applicant_is_inventor: t(
        "application.fields.applicantIsInventor",
        "Applicant is Inventor"
      ),
      parties: t("application.fields.parties", "Parties"),
      attachments: t("application.fields.attachments", "Documents"),
      priority_claims: t(
        "application.fields.priorityClaims",
        "Priority Claims"
      ),
      metrics: t("application.fields.metrics", "Metrics"),
    };
    return labels[fieldPath] || fieldPath;
  };

  const renderFieldChange = (fieldPath: string, change: FieldChange) => {
    if (fieldPath === "parties") {
      return renderPartyChanges(change);
    }

    if (fieldPath === "metrics") {
      return renderMetricsChanges(change);
    }

    if (fieldPath === "attachments") {
      return renderAttachmentChanges(change);
    }

    // Simple value changes
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
            {t("common.before", "Before")}
          </p>
          <p className="text-sm text-red-900 dark:text-red-100">
            {formatValue(change.old)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
            {t("common.after", "After")}
          </p>
          <p className="text-sm text-green-900 dark:text-green-100">
            {formatValue(change.new)}
          </p>
        </div>
      </div>
    );
  };

  const renderPartyChanges = (change: FieldChange) => {
    const partyChanges = change as {
      added?: unknown[];
      removed?: unknown[];
      modified?: unknown[];
    };

    const getPartyDisplayName = (party: any): string => {
      return party.snapshot_name || party.name || "Unknown";
    };

    const getPartyRole = (party: any): string => {
      return party.role || party.party_type || "Unknown Role";
    };

    const renderPartyDetails = (party: any, includeRole: boolean = true) => {
      const name = getPartyDisplayName(party);
      const email = party.snapshot_email || party.email;
      const address = party.snapshot_address || party.address;
      const phone = party.phone;
      const idNumber = party.id_number;
      const nationality = party.nationality_text || party.nationality || party.country_code;
      const role = getPartyRole(party);

      return (
        <div className="text-xs space-y-0.5">
          {includeRole && (
            <div className="font-semibold">{name} ({role})</div>
          )}
          {!includeRole && <div className="font-semibold">{name}</div>}
          {email && <div className="text-slate-600 dark:text-slate-400">Email: {email}</div>}
          {phone && <div className="text-slate-600 dark:text-slate-400">Phone: {phone}</div>}
          {address && <div className="text-slate-600 dark:text-slate-400">Address: {address}</div>}
          {idNumber && <div className="text-slate-600 dark:text-slate-400">ID: {idNumber}</div>}
          {nationality && <div className="text-slate-600 dark:text-slate-400">Nationality: {nationality}</div>}
        </div>
      );
    };

    const renderPartyFieldChange = (oldParty: any, newParty: any) => {
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
      <div className="space-y-3">
        {partyChanges.added && partyChanges.added.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
              {t("amendment.changes.partiesAdded", "Added Parties")} ({partyChanges.added.length})
            </p>
            <div className="space-y-3">
              {partyChanges.added.map((party: any, idx: number) => (
                <div key={idx} className="border-l-2 border-green-400 pl-3">
                  {renderPartyDetails(party)}
                </div>
              ))}
            </div>
          </div>
        )}

        {partyChanges.removed && partyChanges.removed.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
              {t("amendment.changes.partiesRemoved", "Removed Parties")} ({partyChanges.removed.length})
            </p>
            <div className="space-y-3">
              {partyChanges.removed.map((party: any, idx: number) => (
                <div key={idx} className="border-l-2 border-red-400 pl-3 line-through opacity-70">
                  {renderPartyDetails(party)}
                </div>
              ))}
            </div>
          </div>
        )}

        {partyChanges.modified && partyChanges.modified.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
              {t("amendment.changes.partiesModified", "Modified Parties")} ({partyChanges.modified.length})
            </p>
            <div className="space-y-4">
              {partyChanges.modified.map((mod: any, idx: number) => {
                const changes = renderPartyFieldChange(mod.old, mod.new);
                return (
                  <div key={idx} className="border-l-2 border-amber-400 dark:border-amber-600 pl-3">
                    <div className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      {getPartyDisplayName(mod.old || mod.new)} ({getPartyRole(mod.old || mod.new)})
                    </div>
                    {changes.length > 0 ? (
                      <div className="space-y-2">
                        {changes.map((change, changeIdx) => (
                          <div key={changeIdx} className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-slate-500 dark:text-slate-400 mb-0.5">{change.label}</div>
                              <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded line-through">
                                {change.oldValue}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 dark:text-slate-400 mb-0.5">&nbsp;</div>
                              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                {change.newValue}
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
    );
  };

  const renderAttachmentChanges = (change: FieldChange) => {
    const attachmentChanges = change as {
      added?: any[];
      removed?: any[];
      replaced?: Array<{
        doc_type: string;
        old_count: number;
        new_count: number;
        old_files?: any[];
        new_files?: any[];
      }>;
    };

    const docTypeLabels: Record<string, string> = {
      DESCRIPTION: t("application.docTypes.description", "Specification"),
      CLAIMS: t("application.docTypes.claims", "Claims"),
      ABSTRACT: t("application.docTypes.abstract", "Abstract"),
      DRAWINGS: t("application.docTypes.drawings", "Drawings"),
      PRIORITY_DOCS: t(
        "application.docTypes.priorityDocs",
        "Priority Documents"
      ),
      PHOTOS: t("application.docTypes.photos", "Photos/Drawings"),
      ID_DESCRIPTION: t("application.docTypes.idDescription", "ID Description"),
    };

    return (
      <div className="space-y-3">
        {/* Added Documents */}
        {attachmentChanges.added && attachmentChanges.added.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
              {t("amendment.changes.documentsAdded", "Added Documents")} (
              {attachmentChanges.added.length})
            </p>
            <ul className="space-y-1">
              {attachmentChanges.added.map((doc: any, idx: number) => (
                <li
                  key={idx}
                  className="text-xs text-green-900 dark:text-green-100 ml-2"
                >
                  <span className="material-symbols-outlined text-green-500 text-sm align-middle mr-1">
                    add_circle
                  </span>
                  {doc.filename ||
                    doc.file_name ||
                    doc.original_filename ||
                    "Document"}
                  {doc.doc_type &&
                    ` (${docTypeLabels[doc.doc_type] || doc.doc_type})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Removed Documents */}
        {attachmentChanges.removed && attachmentChanges.removed.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
              {t("amendment.changes.documentsRemoved", "Removed Documents")} (
              {attachmentChanges.removed.length})
            </p>
            <ul className="space-y-1">
              {attachmentChanges.removed.map((doc: any, idx: number) => (
                <li
                  key={idx}
                  className="text-xs text-red-900 dark:text-red-100 ml-2 line-through"
                >
                  <span className="material-symbols-outlined text-red-500 text-sm align-middle mr-1">
                    remove_circle
                  </span>
                  {doc.filename ||
                    doc.file_name ||
                    doc.original_filename ||
                    "Document"}
                  {doc.doc_type &&
                    ` (${docTypeLabels[doc.doc_type] || doc.doc_type})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Replaced Documents with File Details */}
        {attachmentChanges.replaced &&
          attachmentChanges.replaced.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                {t("amendment.changes.documentsReplaced", "Replaced Documents")}{" "}
                ({attachmentChanges.replaced.length})
              </p>
              {attachmentChanges.replaced.map(
                (replacement: any, idx: number) => (
                  <div
                    key={idx}
                    className="mt-2 border-l-2 border-amber-400 dark:border-amber-600 pl-3"
                  >
                    <div className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                      {docTypeLabels[replacement.doc_type] ||
                        replacement.doc_type}
                    </div>

                    {/* Old Files */}
                    {replacement.old_files &&
                      replacement.old_files.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            {t("common.before", "Before")}:
                          </span>
                          <ul className="mt-0.5 space-y-0.5">
                            {replacement.old_files.map(
                              (file: any, fileIdx: number) => (
                                <li
                                  key={fileIdx}
                                  className="text-xs text-red-800 dark:text-red-200 ml-2 line-through"
                                >
                                  •{" "}
                                  {file.filename ||
                                    file.file_name ||
                                    file.original_filename ||
                                    "Unknown file"}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {/* New Files */}
                    {replacement.new_files &&
                      replacement.new_files.length > 0 && (
                        <div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {t("common.after", "After")}:
                          </span>
                          <ul className="mt-0.5 space-y-0.5">
                            {replacement.new_files.map(
                              (file: any, fileIdx: number) => (
                                <li
                                  key={fileIdx}
                                  className="text-xs text-green-800 dark:text-green-200 ml-2"
                                >
                                  •{" "}
                                  {file.filename ||
                                    file.file_name ||
                                    file.original_filename ||
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
  };

  const renderMetricsChanges = (change: FieldChange) => {
    const oldMetrics = change.old as Record<string, number> | null;
    const newMetrics = change.new as Record<string, number> | null;

    const metricLabels: Record<string, string> = {
      description_pages: t(
        "application.metrics.descriptionPages",
        "Description Pages"
      ),
      claims_total: t("application.metrics.claimsTotal", "Total Claims"),
      claims_independent: t(
        "application.metrics.independentClaims",
        "Independent Claims"
      ),
      drawings_images: t("application.metrics.drawings", "Drawings"),
      id_variants: t("application.metrics.variants", "Design Variants"),
    };

    const allKeys = new Set([
      ...Object.keys(oldMetrics || {}),
      ...Object.keys(newMetrics || {}),
    ]);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                {t("common.metric", "Metric")}
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-red-500">
                {t("common.before", "Before")}
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-green-500">
                {t("common.after", "After")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {Array.from(allKeys).map((key) => {
              const oldVal = oldMetrics?.[key] ?? "-";
              const newVal = newMetrics?.[key] ?? "-";
              const changed = oldVal !== newVal;

              return (
                <tr
                  key={key}
                  className={changed ? "bg-amber-50 dark:bg-amber-900/10" : ""}
                >
                  <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                    {metricLabels[key] || key}
                  </td>
                  <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
                    {oldVal}
                  </td>
                  <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400">
                    {newVal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <span className="material-symbols-outlined text-amber-500 mr-2">
          compare_arrows
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("amendment.pendingChanges", "Pending Changes")}
        </h2>
        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
          {t("amendment.version", "Version {{number}}", {
            number: pendingVersion.version_number,
          })}
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        {t(
          "amendment.changesDescription",
          "Review the proposed changes below before approving or rejecting this amendment."
        )}
      </p>

      {/* Changed Fields Summary */}
      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          {t("amendment.fieldsChanged", "Fields Changed:")}{" "}
          {pendingVersion.changes_count}
        </p>
        <div className="flex flex-wrap gap-2">
          {pendingVersion.changed_fields.map((field) => (
            <span
              key={field}
              className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded"
            >
              {getFieldLabel(field)}
            </span>
          ))}
        </div>
      </div>

      {/* Detailed Changes */}
      <div className="space-y-6">
        {Object.entries(pendingVersion.field_changes).map(
          ([fieldPath, change]) => (
            <div
              key={fieldPath}
              className="border-t border-slate-200 dark:border-slate-700 pt-4"
            >
              <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center">
                <span className="material-symbols-outlined text-amber-500 text-sm mr-1">
                  edit
                </span>
                {getFieldLabel(fieldPath)}
              </h4>
              {renderFieldChange(fieldPath, change)}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PendingVersionComparison;

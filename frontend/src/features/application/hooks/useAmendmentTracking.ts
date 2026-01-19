import { useState, useCallback, useMemo } from 'react';
import type { ApplicationSnapshot, ProposedAmendmentData, FieldChange } from '../types/applicationTypes';

interface UseAmendmentTrackingReturn {
    proposedData: ProposedAmendmentData;
    changedFields: Set<string>;
    fieldChanges: Record<string, FieldChange>;
    trackChange: <T>(fieldPath: string, newValue: T) => void;
    setFieldValue: <T>(fieldPath: string, value: T) => void;
    hasChanges: boolean;
    changesCount: number;
    getChangeSummary: () => string[];
    resetChanges: () => void;
}

// Helper to extract party data from snapshot (handles both old and new field names)
function extractPartyData(p: Record<string, unknown>) {
    return {
        id: p.id as number | undefined,
        role: (p.role || p.party_type) as string,
        user_id: p.user_id as number | null | undefined,
        snapshot_name: (p.snapshot_name || p.name || '') as string,
        snapshot_email: (p.snapshot_email || p.email || '') as string,
        snapshot_address: (p.snapshot_address || p.address || '') as string,
        phone: p.phone as string | null | undefined,
        id_number: p.id_number as string | null | undefined,
        id_type: p.id_type as string | null | undefined,
        nationality: (p.nationality || p.country_code) as string | null | undefined,
        nationality_text: p.nationality_text as string | null | undefined,
        is_primary: p.is_primary as boolean | undefined,
    };
}

// Helper to extract metrics data from snapshot (handles both old and new field names)
function extractMetricsData(m: Record<string, unknown> | null | undefined) {
    if (!m) return undefined;
    return {
        description_pages: (m.description_pages ?? m.page_count) as number | undefined,
        claims_independent: (m.claims_independent ?? m.independent_claims) as number | undefined,
        claims_total: (m.claims_total ?? m.claim_count) as number | undefined,
        drawings_images: (m.drawings_images ?? m.image_count) as number | undefined,
        id_variants: (m.id_variants ?? m.embodiment_count) as number | undefined,
        id_images_per_variant: m.id_images_per_variant as number | undefined,
    };
}

// Helper to extract priority claim data from snapshot
function extractPriorityClaimData(pc: Record<string, unknown>) {
    return {
        id: pc.id as number | undefined,
        country_code: pc.country_code as string,
        app_no: (pc.app_no || pc.number) as string,
        filing_date: pc.filing_date as string,
    };
}

export function useAmendmentTracking(originalData: ApplicationSnapshot): UseAmendmentTrackingReturn {
    const [proposedData, setProposedData] = useState<ProposedAmendmentData>(() => ({
        title: originalData.title,
        parties: originalData.parties?.map(p => extractPartyData(p as unknown as Record<string, unknown>)) || [],
        attachments: originalData.attachments?.map(a => ({
            id: a.id,
            doc_type: a.doc_type,
            original_filename: (a as unknown as Record<string, unknown>).original_filename as string || (a as unknown as Record<string, unknown>).file_name as string || '',
            page_count: a.page_count,
        })) || [],
        priority_claims: originalData.priority_claims?.map(pc => extractPriorityClaimData(pc as unknown as Record<string, unknown>)) || [],
        metrics: extractMetricsData(originalData.metrics as unknown as Record<string, unknown>),
    }));

    const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
    const [fieldChanges, setFieldChanges] = useState<Record<string, FieldChange>>({});

    const getOriginalValue = useCallback((fieldPath: string): unknown => {
        const keys = fieldPath.split('.');
        let value: unknown = originalData;
        for (const key of keys) {
            if (value === null || value === undefined) return undefined;
            value = (value as Record<string, unknown>)[key];
        }
        return value;
    }, [originalData]);

    const valuesAreDifferent = useCallback((a: unknown, b: unknown): boolean => {
        if (a === b) return false;
        if (a === null && b === undefined) return false;
        if (a === undefined && b === null) return false;
        if (typeof a === 'object' && typeof b === 'object') {
            return JSON.stringify(a) !== JSON.stringify(b);
        }
        return a !== b;
    }, []);

    const trackChange = useCallback(<T>(fieldPath: string, newValue: T) => {
        const originalValue = getOriginalValue(fieldPath);
        const isDifferent = valuesAreDifferent(originalValue, newValue);

        setChangedFields(prev => {
            const next = new Set(prev);
            if (isDifferent) {
                next.add(fieldPath);
            } else {
                next.delete(fieldPath);
            }
            return next;
        });

        setFieldChanges(prev => {
            const next = { ...prev };
            if (isDifferent) {
                next[fieldPath] = { old: originalValue, new: newValue };
            } else {
                delete next[fieldPath];
            }
            return next;
        });
    }, [getOriginalValue, valuesAreDifferent]);

    const setFieldValue = useCallback(<T>(fieldPath: string, value: T) => {
        setProposedData(prev => {
            const keys = fieldPath.split('.');
            const result = { ...prev };
            let current: Record<string, unknown> = result as unknown as Record<string, unknown>;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (current[key] === undefined || current[key] === null) {
                    current[key] = {};
                } else {
                    current[key] = { ...(current[key] as Record<string, unknown>) };
                }
                current = current[key] as Record<string, unknown>;
            }

            current[keys[keys.length - 1]] = value;
            return result;
        });

        trackChange(fieldPath, value);
    }, [trackChange]);

    const hasChanges = useMemo(() => changedFields.size > 0, [changedFields]);

    const changesCount = useMemo(() => changedFields.size, [changedFields]);

    const getChangeSummary = useCallback((): string[] => {
        const summaries: string[] = [];

        for (const fieldPath of changedFields) {
            const change = fieldChanges[fieldPath];
            if (!change) continue;

            const fieldLabel = getFieldLabel(fieldPath);
            if (change.old === undefined || change.old === null) {
                summaries.push(`Added ${fieldLabel}`);
            } else if (change.new === undefined || change.new === null) {
                summaries.push(`Removed ${fieldLabel}`);
            } else {
                summaries.push(`Changed ${fieldLabel}`);
            }
        }

        return summaries;
    }, [changedFields, fieldChanges]);

    const resetChanges = useCallback(() => {
        setProposedData({
            title: originalData.title,
            parties: originalData.parties?.map(p => extractPartyData(p as unknown as Record<string, unknown>)) || [],
            attachments: originalData.attachments?.map(a => ({
                id: a.id,
                doc_type: a.doc_type,
                original_filename: (a as unknown as Record<string, unknown>).original_filename as string || (a as unknown as Record<string, unknown>).file_name as string || '',
                page_count: a.page_count,
            })) || [],
            priority_claims: originalData.priority_claims?.map(pc => extractPriorityClaimData(pc as unknown as Record<string, unknown>)) || [],
            metrics: extractMetricsData(originalData.metrics as unknown as Record<string, unknown>),
        });
        setChangedFields(new Set());
        setFieldChanges({});
    }, [originalData]);

    return {
        proposedData,
        changedFields,
        fieldChanges,
        trackChange,
        setFieldValue,
        hasChanges,
        changesCount,
        getChangeSummary,
        resetChanges,
    };
}

function getFieldLabel(fieldPath: string): string {
    const labels: Record<string, string> = {
        'title': 'Title',
        'applicant_is_inventor': 'Applicant is Inventor',
        'publication_early_requested': 'Early Publication',
        'pub_delay_months': 'Publication Delay',
        'parties': 'Parties',
        'attachments': 'Documents',
        'priority_claims': 'Priority Claims',
        'metrics': 'Metrics',
        'metrics.description_pages': 'Description Pages',
        'metrics.claims_independent': 'Independent Claims',
        'metrics.claims_total': 'Total Claims',
        'metrics.drawings_images': 'Drawing Images',
        'metrics.id_variants': 'Design Variants',
        'metrics.id_images_per_variant': 'Images per Variant',
    };

    return labels[fieldPath] || fieldPath.split('.').pop() || fieldPath;
}

export default useAmendmentTracking;

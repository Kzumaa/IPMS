import React, { useState, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect } from '../forms';
import { PartyType, AppType } from '../../types/enums';
import type { PartiesFormData, PartyFormData } from '../../schemas/applicationSchemas';
import type { UserSearchResult } from '../../types/applicationTypes';
import { applicationService } from '../../services/applicationService';

// Debounce hook for search
function useDebounce(
    callback: (query: string) => void,
    delay: number
): (query: string) => void {
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const callbackRef = React.useRef<(query: string) => void>(callback);

    // Update callback ref when callback changes
    React.useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        (query: string) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(query);
            }, delay);
        },
        [delay]
    );
}

type PartyArrayKey = 'applicants' | 'inventors';

interface PartyCardProps {
    index: number;
    partyType: PartyArrayKey;
    onRemove: () => void;
    canRemove: boolean;
    isIndustrialDesign?: boolean;
}

const PartyCard: React.FC<PartyCardProps> = ({ index, partyType, onRemove, canRemove, isIndustrialDesign }) => {
    const { t } = useTranslation();
    const {
        register,
        formState: { errors },
    } = useFormContext<PartiesFormData>();
    const [isExpanded, setIsExpanded] = useState(true);

    // Get field errors with proper typing
    const partyErrors = partyType === 'applicants' ? errors.applicants : errors.inventors;
    const fieldErrors = partyErrors?.[index];

    const getPartyTypeLabel = () => {
        if (partyType === 'applicants') {
            return t('application.partyTypes.APPLICANT');
        }
        // For inventors/authors/designers
        return isIndustrialDesign
            ? t('application.steps.parties.authorDesigner')
            : t('application.partyTypes.INVENTOR');
    };

    const idTypeOptions = [
        { value: 'CMND', label: t('application.steps.parties.fields.idTypes.nationalId') },
        { value: 'CCCD', label: t('application.steps.parties.fields.idTypes.citizenId') },
        { value: 'PASSPORT', label: t('application.steps.parties.fields.idTypes.passport') },
        { value: 'OTHER', label: t('application.steps.parties.fields.idTypes.other') },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 mr-2">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                        {getPartyTypeLabel()} #{index + 1}
                        {index === 0 && partyType === 'applicants' && (
                            <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                                {t('application.steps.parties.primary')}
                            </span>
                        )}
                    </span>
                </div>
                {canRemove && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    >
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                )}
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label={t('application.steps.parties.fields.name')}
                            name={`${partyType}.${index}.name`}
                            placeholder={t('application.steps.parties.fields.namePlaceholder')}
                            required
                            register={register(`${partyType}.${index}.name` as `applicants.${number}.name`)}
                            error={fieldErrors?.name}
                        />

                        <FormInput
                            label={t('application.steps.parties.fields.nationality')}
                            name={`${partyType}.${index}.nationality`}
                            placeholder={t('application.steps.parties.fields.nationalityPlaceholder')}
                            required
                            register={register(`${partyType}.${index}.nationality` as `applicants.${number}.nationality`)}
                            error={fieldErrors?.nationality}
                        />

                        <div className="md:col-span-2">
                            <FormInput
                                label={t('application.steps.parties.fields.address')}
                                name={`${partyType}.${index}.address`}
                                placeholder={t('application.steps.parties.fields.addressPlaceholder')}
                                required
                                register={register(`${partyType}.${index}.address` as `applicants.${number}.address`)}
                                error={fieldErrors?.address}
                            />
                        </div>

                        <FormInput
                            label={t('application.steps.parties.fields.email')}
                            name={`${partyType}.${index}.email`}
                            type="email"
                            placeholder={t('application.steps.parties.fields.emailPlaceholder')}
                            required
                            register={register(`${partyType}.${index}.email` as `applicants.${number}.email`)}
                            error={fieldErrors?.email}
                        />

                        <FormInput
                            label={t('application.steps.parties.fields.phone')}
                            name={`${partyType}.${index}.phone`}
                            type="tel"
                            placeholder={t('application.steps.parties.fields.phonePlaceholder')}
                            required
                            register={register(`${partyType}.${index}.phone` as `applicants.${number}.phone`)}
                            error={fieldErrors?.phone}
                        />

                        <FormInput
                            label={t('application.steps.parties.fields.countryCode')}
                            name={`${partyType}.${index}.country_code`}
                            placeholder={t('application.steps.parties.fields.countryCodePlaceholder')}
                            register={register(`${partyType}.${index}.country_code` as `applicants.${number}.country_code`)}
                            error={fieldErrors?.country_code}
                            helperText={t('application.steps.parties.fields.countryCodeHelper')}
                        />

                        <FormInput
                            label={t('application.steps.parties.fields.idNumber')}
                            name={`${partyType}.${index}.id_number`}
                            placeholder={t('application.steps.parties.fields.idNumberPlaceholder')}
                            register={register(`${partyType}.${index}.id_number` as `applicants.${number}.id_number`)}
                            error={fieldErrors?.id_number}
                        />

                        <FormSelect
                            label={t('application.steps.parties.fields.idType')}
                            name={`${partyType}.${index}.id_type`}
                            options={idTypeOptions}
                            placeholder={t('application.steps.parties.fields.idTypePlaceholder')}
                            register={register(`${partyType}.${index}.id_type` as `applicants.${number}.id_type`)}
                            error={fieldErrors?.id_type}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// User Search Component
interface UserSearchProps {
    onSelect: (user: UserSearchResult) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSelect }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const performSearch = useCallback(async (query: string) => {
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await applicationService.searchUserByEmail(query);
            setSearchResults(response.data || []);
            setShowResults(true);
        } catch (error) {
            console.error('User search failed:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const debouncedSearch = useDebounce(performSearch, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const handleSelect = (user: UserSearchResult) => {
        onSelect(user);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        search
                    </span>
                    <input
                        type="email"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        placeholder={t('application.steps.parties.searchByEmail')}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                    />
                    {isSearching && (
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin">
                            progress_activity
                        </span>
                    )}
                </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((user) => (
                        <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelect(user)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                        >
                            <div className="font-medium text-slate-900 dark:text-white">
                                {user.full_name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                {user.email}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showResults && searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 text-center text-slate-500 dark:text-slate-400">
                    {t('application.steps.parties.noUsersFound')}
                </div>
            )}
        </div>
    );
};

interface PartiesStepProps {
    appType?: AppType;
}

const PartiesStep: React.FC<PartiesStepProps> = ({ appType }) => {
    const { t } = useTranslation();
    const { control, formState: { errors } } = useFormContext<PartiesFormData>();

    // Use app_type from props (passed from parent wizard)
    const isIndustrialDesign = appType === AppType.INDUSTRIAL_DESIGN;

    const {
        fields: applicantFields,
        append: appendApplicant,
        remove: removeApplicant,
    } = useFieldArray({
        control,
        name: 'applicants',
    });

    const {
        fields: inventorFields,
        append: appendInventor,
        remove: removeInventor,
    } = useFieldArray({
        control,
        name: 'inventors',
    });

    const MAX_ADDITIONAL_APPLICANTS = 2; // Max 2 additional (total 3 including primary)
    const canAddMoreApplicants = applicantFields.length < (MAX_ADDITIONAL_APPLICANTS + 1);

    const defaultParty: PartyFormData = {
        party_type: PartyType.APPLICANT,
        name: '',
        address: '',
        nationality: 'Việt Nam',
        country_code: 'VN',
        email: '',
        phone: '',
        id_number: null,
        id_type: null,
        is_primary: false,
        share_percentage: null,
    };

    const handleUserSelect = (user: UserSearchResult) => {
        if (!canAddMoreApplicants) return;

        const newApplicant: PartyFormData = {
            party_type: PartyType.APPLICANT,
            name: user.full_name,
            address: user.address || '',
            nationality: user.country || 'Việt Nam',
            country_code: user.country?.slice(0, 2).toUpperCase() || 'VN',
            email: user.email,
            phone: user.phone || '',
            id_number: null,
            id_type: null,
            is_primary: false,
            share_percentage: null,
            user_id: user.id,
        };

        appendApplicant(newApplicant);
    };

    const handleAddApplicant = () => {
        if (!canAddMoreApplicants) return;
        appendApplicant({ ...defaultParty, party_type: PartyType.APPLICANT });
    };

    return (
        <div className="space-y-8">
            {/* Applicants Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {t('application.steps.parties.applicants')}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('application.steps.parties.applicantsDesc')}
                        </p>
                    </div>
                </div>

                {errors.applicants?.message && (
                    <p className="text-sm text-red-500 mb-4">{errors.applicants.message}</p>
                )}

                {/* Primary Applicant (first one) */}
                <div className="space-y-4 mb-6">
                    {applicantFields.slice(0, 1).map((field, index) => (
                        <PartyCard
                            key={field.id}
                            index={index}
                            partyType="applicants"
                            onRemove={() => removeApplicant(index)}
                            canRemove={false}
                            isIndustrialDesign={isIndustrialDesign}
                        />
                    ))}
                </div>

                {applicantFields.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">person_add</span>
                        <p className="text-slate-500 dark:text-slate-400">{t('application.steps.parties.noApplicants')}</p>
                        <button
                            type="button"
                            onClick={handleAddApplicant}
                            className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            {t('application.steps.parties.addApplicant')}
                        </button>
                    </div>
                )}

                {/* Other Applicants Section */}
                {applicantFields.length > 0 && (
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-white">
                                    {t('application.steps.parties.otherApplicants')}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('application.steps.parties.otherApplicantsDesc', { max: MAX_ADDITIONAL_APPLICANTS })}
                                </p>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {applicantFields.length - 1}/{MAX_ADDITIONAL_APPLICANTS}
                            </span>
                        </div>

                        {/* User Search */}
                        {canAddMoreApplicants && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('application.steps.parties.searchExistingUser')}
                                </label>
                                <UserSearch onSelect={handleUserSelect} />
                            </div>
                        )}

                        {/* Other Applicants List */}
                        <div className="space-y-4">
                            {applicantFields.slice(1).map((field, idx) => (
                                <PartyCard
                                    key={field.id}
                                    index={idx + 1}
                                    partyType="applicants"
                                    onRemove={() => removeApplicant(idx + 1)}
                                    canRemove={true}
                                    isIndustrialDesign={isIndustrialDesign}
                                />
                            ))}
                        </div>

                        {/* Add Manual Button */}
                        {canAddMoreApplicants && (
                            <button
                                type="button"
                                onClick={handleAddApplicant}
                                className="mt-4 flex items-center px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined mr-1 !text-lg">add</span>
                                {t('application.steps.parties.addManually')}
                            </button>
                        )}

                        {!canAddMoreApplicants && applicantFields.length > 1 && (
                            <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                                {t('application.steps.parties.maxApplicantsReached')}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Inventors/Authors Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {isIndustrialDesign
                                ? t('application.steps.parties.authorsDesigners')
                                : t('application.steps.parties.inventors')}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isIndustrialDesign
                                ? t('application.steps.parties.authorsDesignersDesc')
                                : t('application.steps.parties.inventorsDesc')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => appendInventor({ ...defaultParty, party_type: PartyType.INVENTOR })}
                        className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined mr-1 !text-lg">add</span>
                        {t('application.steps.parties.add')}
                    </button>
                </div>

                <div className="space-y-4">
                    {inventorFields.map((field, index) => (
                        <PartyCard
                            key={field.id}
                            index={index}
                            partyType="inventors"
                            onRemove={() => removeInventor(index)}
                            canRemove={true}
                            isIndustrialDesign={isIndustrialDesign}
                        />
                    ))}
                </div>

                {inventorFields.length === 0 && (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {t('application.steps.parties.noData')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartiesStep;

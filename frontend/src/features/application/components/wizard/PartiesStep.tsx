import React, { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect } from '../forms';
import { PartyType } from '../../types/enums';
import type { PartiesFormData, PartyFormData } from '../../schemas/applicationSchemas';

interface PartyCardProps {
    index: number;
    partyType: 'applicants' | 'inventors' | 'representatives';
    onRemove: () => void;
    canRemove: boolean;
}

const PartyCard: React.FC<PartyCardProps> = ({ index, partyType, onRemove, canRemove }) => {
    const { t } = useTranslation();
    const {
        register,
        formState: { errors },
    } = useFormContext<PartiesFormData>();
    const [isExpanded, setIsExpanded] = useState(true);

    const fieldErrors = errors[partyType]?.[index];

    const getPartyTypeKey = () => {
        if (partyType === 'applicants') return 'APPLICANT';
        if (partyType === 'inventors') return 'INVENTOR';
        return 'REPRESENTATIVE';
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
                        {t(`application.partyTypes.${getPartyTypeKey()}`)} #{index + 1}
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
                            register={register(`${partyType}.${index}.name` as keyof PartiesFormData)}
                            error={fieldErrors?.name}
                        />

                        <FormInput
                            label={t('application.steps.parties.fields.nameEn')}
                            name={`${partyType}.${index}.name_en`}
                            placeholder={t('application.steps.parties.fields.nameEnPlaceholder')}
                            register={register(`${partyType}.${index}.name_en` as keyof PartiesFormData)}
                            error={fieldErrors?.name_en}
                        />

                        <div className="md:col-span-2">
                            <FormInput
                                label={t('application.steps.parties.fields.address')}
                                name={`${partyType}.${index}.address`}
                                placeholder={t('application.steps.parties.fields.addressPlaceholder')}
                                required
                                register={register(`${partyType}.${index}.address` as keyof PartiesFormData)}
                                error={fieldErrors?.address}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <FormInput
                                label={t('application.steps.parties.fields.addressEn')}
                                name={`${partyType}.${index}.address_en`}
                                placeholder={t('application.steps.parties.fields.addressEnPlaceholder')}
                                register={register(`${partyType}.${index}.address_en` as keyof PartiesFormData)}
                                error={fieldErrors?.address_en}
                            />
                        </div>

                        <FormInput
                            label={t('application.steps.parties.fields.nationality')}
                            name={`${partyType}.${index}.nationality`}
                            placeholder={t('application.steps.parties.fields.nationalityPlaceholder')}
                            register={register(`${partyType}.${index}.nationality` as keyof PartiesFormData)}
                            error={fieldErrors?.nationality}
                        />

                        <FormInput
                            label={t('application.steps.parties.fields.countryCode')}
                            name={`${partyType}.${index}.country_code`}
                            placeholder={t('application.steps.parties.fields.countryCodePlaceholder')}
                            register={register(`${partyType}.${index}.country_code` as keyof PartiesFormData)}
                            error={fieldErrors?.country_code}
                            helperText={t('application.steps.parties.fields.countryCodeHelper')}
                        />

                        <FormInput
                            label={t('application.steps.parties.fields.email')}
                            name={`${partyType}.${index}.email`}
                            type="email"
                            placeholder={t('application.steps.parties.fields.emailPlaceholder')}
                            register={register(`${partyType}.${index}.email` as keyof PartiesFormData)}
                            error={fieldErrors?.email}
                        />

                        <FormInput
                            label={t('application.steps.parties.fields.phone')}
                            name={`${partyType}.${index}.phone`}
                            type="tel"
                            placeholder={t('application.steps.parties.fields.phonePlaceholder')}
                            register={register(`${partyType}.${index}.phone` as keyof PartiesFormData)}
                            error={fieldErrors?.phone}
                        />

                        <FormInput
                            label={t('application.steps.parties.fields.idNumber')}
                            name={`${partyType}.${index}.id_number`}
                            placeholder={t('application.steps.parties.fields.idNumberPlaceholder')}
                            register={register(`${partyType}.${index}.id_number` as keyof PartiesFormData)}
                            error={fieldErrors?.id_number}
                        />

                        <FormSelect
                            label={t('application.steps.parties.fields.idType')}
                            name={`${partyType}.${index}.id_type`}
                            options={idTypeOptions}
                            placeholder={t('application.steps.parties.fields.idTypePlaceholder')}
                            register={register(`${partyType}.${index}.id_type` as keyof PartiesFormData)}
                            error={fieldErrors?.id_type}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const PartiesStep: React.FC = () => {
    const { t } = useTranslation();
    const { control, formState: { errors } } = useFormContext<PartiesFormData>();

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

    const {
        fields: representativeFields,
        append: appendRepresentative,
        remove: removeRepresentative,
    } = useFieldArray({
        control,
        name: 'representatives',
    });

    const defaultParty: PartyFormData = {
        party_type: PartyType.APPLICANT,
        name: '',
        name_en: null,
        address: '',
        address_en: null,
        nationality: 'Việt Nam',
        country_code: 'VN',
        email: null,
        phone: null,
        id_number: null,
        id_type: null,
        is_primary: false,
        share_percentage: null,
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
                    <button
                        type="button"
                        onClick={() => appendApplicant({ ...defaultParty, party_type: PartyType.APPLICANT })}
                        className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined mr-1 !text-lg">add</span>
                        {t('application.steps.parties.add')}
                    </button>
                </div>

                {errors.applicants?.message && (
                    <p className="text-sm text-red-500 mb-4">{errors.applicants.message}</p>
                )}

                <div className="space-y-4">
                    {applicantFields.map((field, index) => (
                        <PartyCard
                            key={field.id}
                            index={index}
                            partyType="applicants"
                            onRemove={() => removeApplicant(index)}
                            canRemove={applicantFields.length > 1}
                        />
                    ))}
                </div>

                {applicantFields.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">person_add</span>
                        <p className="text-slate-500 dark:text-slate-400">{t('application.steps.parties.noApplicants')}</p>
                        <button
                            type="button"
                            onClick={() => appendApplicant({ ...defaultParty, party_type: PartyType.APPLICANT })}
                            className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            {t('application.steps.parties.addApplicant')}
                        </button>
                    </div>
                )}
            </div>

            {/* Inventors Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {t('application.steps.parties.inventors')}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('application.steps.parties.inventorsDesc')}
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

            {/* Representatives Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {t('application.steps.parties.representatives')}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('application.steps.parties.representativesDesc')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => appendRepresentative({ ...defaultParty, party_type: PartyType.REPRESENTATIVE })}
                        className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined mr-1 !text-lg">add</span>
                        {t('application.steps.parties.add')}
                    </button>
                </div>

                <div className="space-y-4">
                    {representativeFields.map((field, index) => (
                        <PartyCard
                            key={field.id}
                            index={index}
                            partyType="representatives"
                            onRemove={() => removeRepresentative(index)}
                            canRemove={true}
                        />
                    ))}
                </div>

                {representativeFields.length === 0 && (
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

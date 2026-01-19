import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { applicationService } from '@/features/application/services/applicationService';
import type { UserSearchResult } from '@/features/application/types/applicationTypes';

interface LicenseeSearchProps {
  onAdd: (user: UserSearchResult) => void;
  disabled?: boolean;
  error?: string;
  excludedUserIds?: number[];
  label?: string;
  required?: boolean;
  placeholder?: string;
}

const LicenseeSearch: React.FC<LicenseeSearchProps> = ({
  onAdd,
  disabled = false,
  error,
  excludedUserIds = [],
  label,
  required = false,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search users when search term changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchTerm || searchTerm.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setSearchError(null);
        const response = await applicationService.searchUserByEmail(searchTerm);
        let filteredResults = response.data;

        // Exclude the specified users (e.g., licensor and already selected licensees)
        if (excludedUserIds.length > 0) {
          filteredResults = filteredResults.filter(
            (user) => !excludedUserIds.includes(user.id)
          );
        }

        setResults(filteredResults);
        setShowDropdown(true);
      } catch (err) {
        console.error('Failed to search users:', err);
        setSearchError(t('request.license.searchError', 'Failed to search users'));
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, excludedUserIds, t]);

  const handleSelect = (user: UserSearchResult) => {
    onAdd(user);
    setSearchTerm('');
    setShowDropdown(false);
    setResults([]);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          disabled={disabled}
          placeholder={
            placeholder || t('request.license.searchPlaceholder', 'Search by email...')
          }
          className={`w-full px-3 py-2 pl-10 border rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error || searchError ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'}`}
        />
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-lg">
          search
        </span>
        {loading && (
          <span className="material-symbols-outlined animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 !text-lg">
            refresh
          </span>
        )}
      </div>

      {/* Error message */}
      {(error || searchError) && (
        <p className="mt-1 text-sm text-red-600">{error || searchError}</p>
      )}

      {/* Search hint */}
      {searchTerm.length > 0 && searchTerm.length < 3 && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t('request.license.searchHint', 'Enter at least 3 characters to search')}
        </p>
      )}

      {/* Results dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 !text-base">
                  person
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
              <span className="material-symbols-outlined text-indigo-500 !text-lg">
                add_circle
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && results.length === 0 && !loading && searchTerm.length >= 3 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
          <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">
            person_off
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('request.license.noResults', 'No users found')}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {t('request.license.noResultsHint', 'The licensee must be a registered user')}
          </p>
        </div>
      )}
    </div>
  );
};

export default LicenseeSearch;

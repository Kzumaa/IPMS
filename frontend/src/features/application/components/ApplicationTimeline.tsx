import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { applicationService } from '../services/applicationService';
import type { TimelineEvent, TimelineEventColor } from '../types/applicationTypes';

interface ApplicationTimelineProps {
  applicationId: number;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getColorClasses = (color: TimelineEventColor): { dot: string; bg: string; text: string } => {
  const colorMap: Record<TimelineEventColor, { dot: string; bg: string; text: string }> = {
    gray: {
      dot: 'bg-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-400',
    },
    blue: {
      dot: 'bg-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
    },
    green: {
      dot: 'bg-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
    },
    red: {
      dot: 'bg-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
    },
    amber: {
      dot: 'bg-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-300',
    },
    purple: {
      dot: 'bg-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
    },
    indigo: {
      dot: 'bg-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-700 dark:text-indigo-300',
    },
  };
  return colorMap[color] || colorMap.gray;
};

const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ applicationId }) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await applicationService.getTimeline(applicationId);
        setEvents(response.data);
      } catch (err) {
        setError(t('timeline.loadError'));
        console.error('Failed to load timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [applicationId, t]);

  const displayedEvents = expanded ? events : events.slice(0, 5);
  const hasMoreEvents = events.length > 5;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t('timeline.title')}
        </h3>
        <div className="flex items-center justify-center py-8">
          <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">
            refresh
          </span>
          <span className="text-slate-500 dark:text-slate-400">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t('timeline.title')}
        </h3>
        <div className="text-center py-4">
          <span className="material-symbols-outlined text-red-500 text-3xl mb-2">error</span>
          <p className="text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('timeline.title')}
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {events.length} {t('timeline.events')}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">
            history
          </span>
          <p className="text-slate-500 dark:text-slate-400">{t('timeline.empty')}</p>
        </div>
      ) : (
        <>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

            {/* Timeline events */}
            <div className="space-y-4">
              {displayedEvents.map((event, index) => {
                const colors = getColorClasses(event.color);
                const isLast = index === displayedEvents.length - 1;

                return (
                  <div key={event.id} className="relative flex items-start pl-10">
                    {/* Dot */}
                    <div
                      className={`absolute left-2.5 w-3 h-3 rounded-full ${colors.dot} ring-4 ring-white dark:ring-slate-800`}
                    />

                    {/* Content */}
                    <div className={`flex-1 ${isLast ? '' : 'pb-2'}`}>
                      <div className={`p-3 rounded-lg ${colors.bg}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {event.icon && (
                              <span
                                className={`material-symbols-outlined !text-lg ${colors.text}`}
                              >
                                {event.icon}
                              </span>
                            )}
                            <span className={`font-medium text-sm ${colors.text}`}>
                              {event.title}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDate(event.date)}
                          </span>
                        </div>

                        {event.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {event.description}
                          </p>
                        )}

                        {event.actor && (
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {t('timeline.by')} {event.actor.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Show more/less button */}
          {hasMoreEvents && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined !text-lg">
                {expanded ? 'expand_less' : 'expand_more'}
              </span>
              {expanded
                ? t('timeline.showLess')
                : t('timeline.showMore', { count: events.length - 5 })}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ApplicationTimeline;

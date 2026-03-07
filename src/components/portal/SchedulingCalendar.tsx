import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { Project } from '@/types';

// ── Types ────────────────────────────────────────────────────

interface SchedulingCalendarProps {
  projects: Project[];
  onSelectProject?: (project: Project) => void;
  /** Controlled month in YYYY-MM format — syncs with URL search params */
  month?: string;
  /** Controlled selected date in YYYY-MM-DD format */
  selectedDateParam?: string;
  /** Called when month changes (for URL sync) */
  onMonthChange?: (month: string) => void;
  /** Called when a date is selected (for URL sync) */
  onDateChange?: (date: string | null) => void;
}

interface CalendarEvent {
  project: Project;
  date: Date;
  type: 'capture' | 'delivery' | 'review';
}

// ── Helpers ──────────────────────────────────────────────────

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const EVENT_STYLE_CLS: Record<string, string> = {
  capture: 'bg-blue-500/90 text-white',
  delivery: 'bg-emerald-500/90 text-white',
  review: 'bg-amber-500/90 text-white',
};

const EVENT_LABEL_KEYS: Record<string, string> = {
  capture: 'calendar.capture',
  delivery: 'calendar.delivery',
  review: 'calendar.qaReview',
};

/** Seeded PRNG for deterministic scheduling */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Get day of week for first day of month (0=Mon, 6=Sun) */
function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Convert Sun=0 to Mon=0 format
}

// ── Component ────────────────────────────────────────────────

export const SchedulingCalendar: React.FC<SchedulingCalendarProps> = ({
  projects,
  onSelectProject,
  month: controlledMonth,
  selectedDateParam,
  onMonthChange,
  onDateChange,
}) => {
  const { t } = useTranslation();
  const today = new Date();

  // Parse controlled month (YYYY-MM) if provided
  const parsedMonth = controlledMonth ? controlledMonth.split('-').map(Number) : null;
  const initialYear = parsedMonth ? parsedMonth[0] : today.getFullYear();
  const initialMonth = parsedMonth ? parsedMonth[1] - 1 : today.getMonth(); // 0-indexed

  // Parse controlled selected date (YYYY-MM-DD) if provided
  const parsedDate = selectedDateParam ? new Date(selectedDateParam + 'T00:00:00') : null;

  const [internalYear, setInternalYear] = useState(initialYear);
  const [internalMonth, setInternalMonth] = useState(initialMonth);
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(parsedDate);

  // Use controlled values when callbacks are provided
  const isControlled = onMonthChange !== undefined;
  const currentYear = isControlled && parsedMonth ? parsedMonth[0] : internalYear;
  const currentMonth = isControlled && parsedMonth ? parsedMonth[1] - 1 : internalMonth;
  const selectedDate = isControlled ? parsedDate : internalSelectedDate;

  const updateMonth = (year: number, month: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}`;
    if (isControlled) {
      onMonthChange?.(formatted);
    } else {
      setInternalYear(year);
      setInternalMonth(month);
    }
  };

  const updateSelectedDate = (date: Date | null) => {
    if (isControlled) {
      if (date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        onDateChange?.(`${y}-${m}-${d}`);
      } else {
        onDateChange?.(null);
      }
    } else {
      setInternalSelectedDate(date);
    }
  };

  // Generate calendar events from project data
  const events = useMemo<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = [];
    const rng = seededRand(projects.length + 7);

    projects.forEach((project) => {
      const created = new Date(project.created_at ?? Date.now());

      // Assigned projects → capture event (3-7 days from assignment)
      if (project.status === 'assigned' || project.status === 'captured') {
        const captureDate = new Date(created.getTime() + Math.floor(rng() * 4 + 3) * 86400000);
        result.push({ project, date: captureDate, type: 'capture' });
      }

      // QA projects → review event
      if (project.status === 'qa') {
        const reviewDate = new Date(created.getTime() + Math.floor(rng() * 2 + 1) * 86400000);
        result.push({ project, date: reviewDate, type: 'review' });
      }

      // Approved/Delivered → delivery event
      if (project.status === 'approved' || project.status === 'delivered') {
        const deliveryDate = new Date(created.getTime() + Math.floor(rng() * 5 + 5) * 86400000);
        result.push({ project, date: deliveryDate, type: 'delivery' });
      }

      // Pending projects → scheduled capture (future)
      if (project.status === 'pending') {
        const futureCapture = new Date(today.getTime() + Math.floor(rng() * 14 + 3) * 86400000);
        result.push({ project, date: futureCapture, type: 'capture' });
      }
    });

    return result;
  }, [projects, today]);

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    // Previous month padding
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    const days: { date: Date; isCurrentMonth: boolean; events: CalendarEvent[] }[] = [];

    // Previous month padding days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(prevYear, prevMonth, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter((e) => isSameDay(e.date, date)),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      days.push({
        date,
        isCurrentMonth: true,
        events: events.filter((e) => isSameDay(e.date, date)),
      });
    }

    // Next month padding (fill to 6 rows × 7 = 42)
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(nextYear, nextMonth, d);
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter((e) => isSameDay(e.date, date)),
      });
    }

    return days;
  }, [currentYear, currentMonth, events]);

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => isSameDay(e.date, selectedDate));
  }, [selectedDate, events]);

  // Upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const sevenDaysOut = new Date(today.getTime() + 7 * 86400000);
    return events
      .filter((e) => e.date >= today && e.date <= sevenDaysOut)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [events, today]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      updateMonth(currentYear - 1, 11);
    } else {
      updateMonth(currentYear, currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      updateMonth(currentYear + 1, 0);
    } else {
      updateMonth(currentYear, currentMonth + 1);
    }
  };

  const goToToday = () => {
    updateMonth(today.getFullYear(), today.getMonth());
    updateSelectedDate(today);
  };

  // Count events by type this month
  const monthEventCounts = useMemo(() => {
    const monthEvents = events.filter(
      (e) => e.date.getFullYear() === currentYear && e.date.getMonth() === currentMonth
    );
    const captures = monthEvents.filter((e) => e.type === 'capture').length;
    const deliveries = monthEvents.filter((e) => e.type === 'delivery').length;
    const reviews = monthEvents.filter((e) => e.type === 'review').length;
    return { captures, deliveries, reviews, total: monthEvents.length };
  }, [events, currentYear, currentMonth]);

  return (
    <div className="space-y-6">
      {/* Month Event Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: t('calendar.totalEvents'),
            value: monthEventCounts.total.toString(),
            icon: Calendar,
            iconCls: 'text-brand-600 dark:text-brand-400',
            bgCls: 'bg-brand-100 dark:bg-brand-900/30',
          },
          {
            label: t('calendar.captures'),
            value: monthEventCounts.captures.toString(),
            icon: Camera,
            iconCls: 'text-blue-600 dark:text-blue-400',
            bgCls: 'bg-blue-100 dark:bg-blue-900/30',
          },
          {
            label: t('calendar.deliveries'),
            value: monthEventCounts.deliveries.toString(),
            icon: CheckCircle2,
            iconCls: 'text-emerald-600 dark:text-emerald-400',
            bgCls: 'bg-emerald-100 dark:bg-emerald-900/30',
          },
          {
            label: t('calendar.qaReviews'),
            value: monthEventCounts.reviews.toString(),
            icon: Clock,
            iconCls: 'text-amber-600 dark:text-amber-400',
            bgCls: 'bg-amber-100 dark:bg-amber-900/30',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 hover:-translate-y-1 hover:shadow-lg transition-all shadow-sm p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.bgCls}`}
            >
              <kpi.icon className={`w-5 h-5 ${kpi.iconCls}`} />
            </div>
            <div>
              <div className="text-xl font-bold font-serif-premium text-zinc-900 dark:text-white leading-none">
                {kpi.value}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-sm font-bold font-serif-premium text-zinc-900 dark:text-white uppercase tracking-wider">
                {t(`calendar.months.${currentMonth}`)} {currentYear}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
              >
                {t('calendar.today')}
              </button>
              <button
                onClick={goToPrevMonth}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
            {WEEKDAY_KEYS.map((dayKey) => (
              <div
                key={dayKey}
                className="text-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider py-2"
              >
                {t(`calendar.${dayKey}`)}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const isToday = isSameDay(day.date, today);
              const isSelected = selectedDate && isSameDay(day.date, selectedDate);
              const hasEvents = day.events.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => updateSelectedDate(day.date)}
                  className={`relative h-20 p-1 border-b border-r border-zinc-50 dark:border-zinc-800/40 transition-colors text-left ${!day.isCurrentMonth
                      ? 'bg-zinc-50/50 dark:bg-zinc-950/30'
                      : isSelected
                        ? 'bg-brand-50 dark:bg-brand-900/20'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                    }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full ${isToday
                        ? 'bg-brand-600 text-white'
                        : !day.isCurrentMonth
                          ? 'text-zinc-300 dark:text-zinc-600'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                  >
                    {day.date.getDate()}
                  </span>

                  {/* Event dots */}
                  {hasEvents && (
                    <div className="mt-0.5 space-y-0.5">
                      {day.events.slice(0, 2).map((evt, j) => {
                        const cls = EVENT_STYLE_CLS[evt.type];
                        return (
                          <div
                            key={j}
                            className={`text-[8px] font-bold px-1 py-0.5 rounded truncate leading-tight ${cls}`}
                          >
                            {evt.project.client.split(' ')[0]}
                          </div>
                        );
                      })}
                      {day.events.length > 2 && (
                        <div className="text-[8px] font-semibold text-zinc-400 dark:text-zinc-500 px-1">
                          +{day.events.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
            {Object.entries(EVENT_STYLE_CLS).map(([type, cls]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${cls.split(' ')[0]}`} />
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                  {t(EVENT_LABEL_KEYS[type])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Selected Date + Upcoming */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-sm font-bold font-serif-premium text-zinc-900 dark:text-white uppercase tracking-wider">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h4>
              </div>
              {selectedDateEvents.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  {t('calendar.noEvents')}
                </div>
              ) : (
                <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                  {selectedDateEvents.map((evt, i) => {
                    const cls = EVENT_STYLE_CLS[evt.type];
                    return (
                      <button
                        key={i}
                        onClick={() => onSelectProject?.(evt.project)}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls}`}>
                            {t(EVENT_LABEL_KEYS[evt.type])}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                          {evt.project.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                          <span>{evt.project.client}</span>
                          {evt.project.address && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              {evt.project.address.split(',')[0]}
                            </span>
                          )}
                        </div>
                        {evt.project.assigned_to && (
                          <div className="flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                            <UserCheck className="w-3 h-3" />
                            <span>{evt.project.assigned_to}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <h4 className="text-sm font-bold font-serif-premium text-zinc-900 dark:text-white uppercase tracking-wider">
                {t('calendar.upcoming')}
              </h4>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                {t('calendar.noEvents')}
              </div>
            ) : (
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                {upcomingEvents.map((evt, i) => {
                  const cls = EVENT_STYLE_CLS[evt.type];
                  const dayLabel = isSameDay(evt.date, today)
                    ? t('calendar.today')
                    : evt.date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        updateSelectedDate(evt.date);
                        onSelectProject?.(evt.project);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls}`}>
                          {t(EVENT_LABEL_KEYS[evt.type])}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                          {dayLabel}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                        {evt.project.client} — {evt.project.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

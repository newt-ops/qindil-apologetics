import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useCalendarEvents } from '../../../hooks/useCalendar';
import { CalendarEventItem, EventType } from '../../../api/event';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { CalendarGridSkeleton } from '../../../components/ui/Skeleton';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Grid calculation: start from Sunday before or on 1st of month
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 6 = Sat

  const gridStartDate = new Date(year, month, 1 - startDayOfWeek, 0, 0, 0, 0);
  const gridEndDate = new Date(gridStartDate.getTime() + (42 * 24 * 60 * 60 * 1000 - 1));

  const fromIso = gridStartDate.toISOString();
  const toIso = gridEndDate.toISOString();

  const { data: events = [], isLoading } = useCalendarEvents(fromIso, toIso);

  const today = new Date();

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (typeFilter === 'all') return true;
    return e.type === typeFilter;
  });

  // Generate 42 grid cells (6 weeks)
  const gridDays = [];
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(
      gridStartDate.getFullYear(),
      gridStartDate.getMonth(),
      gridStartDate.getDate() + i
    );

    const isCurrentMonth = cellDate.getMonth() === month;
    const isToday =
      cellDate.getDate() === today.getDate() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getFullYear() === today.getFullYear();

    const cellEvents = filteredEvents.filter((e) => {
      const eDate = new Date(e.startDate);
      return (
        eDate.getDate() === cellDate.getDate() &&
        eDate.getMonth() === cellDate.getMonth() &&
        eDate.getFullYear() === cellDate.getFullYear()
      );
    });

    gridDays.push({
      date: cellDate,
      dayNumber: cellDate.getDate(),
      isCurrentMonth,
      isToday,
      events: cellEvents,
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventTypePillStyle = (type: EventType) => {
    switch (type) {
      case 'deadline':
        return 'bg-gold/15 text-gold border-gold/40 hover:bg-gold/25';
      case 'meeting':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/40 hover:bg-blue-500/25';
      case 'publicEvent':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25';
      default:
        return 'bg-purple-500/15 text-purple-400 border-purple-500/40 hover:bg-purple-500/25';
    }
  };

  const getEventTypeBadgeVariant = (type: EventType) => {
    switch (type) {
      case 'deadline':
        return 'gold';
      case 'meeting':
        return 'inReview';
      case 'publicEvent':
        return 'published';
      default:
        return 'muted';
    }
  };

  // Upcoming agenda events for current and future dates
  const upcomingEvents = [...filteredEvents]
    .filter((e) => new Date(e.startDate) >= new Date(today.setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Calendar" size={14} />
            <span>Operations Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Team Operations Calendar
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Track task deadlines, team research syncs, and publication milestones.
          </p>
        </div>

        {/* View Mode & Month Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'month'
                  ? 'bg-gold text-bg font-bold shadow-xs'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              Month View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'agenda'
                  ? 'bg-gold text-bg font-bold shadow-xs'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              Agenda View
            </button>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center space-x-1.5 bg-surface p-1 rounded-xl border border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="!px-2 text-textMuted hover:text-gold"
              title="Previous Month"
            >
              <Icon name="ChevronLeft" size={15} />
            </Button>

            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-text hover:text-gold transition-colors"
            >
              Today
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="!px-2 text-textMuted hover:text-gold"
              title="Next Month"
            >
              <Icon name="ChevronRight" size={15} />
            </Button>

            <span className="text-xs sm:text-sm font-extrabold text-gold px-2 text-center whitespace-nowrap">
              {currentDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Event Type Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            typeFilter === 'all'
              ? 'bg-gold text-bg font-bold shadow-sm'
              : 'border border-border bg-surface text-textMuted hover:text-text'
          }`}
        >
          All Events ({events.length})
        </button>
        <button
          onClick={() => setTypeFilter('deadline')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            typeFilter === 'deadline'
              ? 'bg-gold text-bg font-bold shadow-sm'
              : 'border border-border bg-surface text-textMuted hover:text-gold'
          }`}
        >
          Deadlines
        </button>
        <button
          onClick={() => setTypeFilter('meeting')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            typeFilter === 'meeting'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'border border-border bg-surface text-textMuted hover:text-blue-400'
          }`}
        >
          Meetings &amp; Syncs
        </button>
        <button
          onClick={() => setTypeFilter('publicEvent')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            typeFilter === 'publicEvent'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'border border-border bg-surface text-textMuted hover:text-emerald-400'
          }`}
        >
          Public Events
        </button>
      </div>

      {/* Calendar View Canvas */}
      {viewMode === 'month' ? (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-md">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-border bg-bg/80 text-center text-[11px] font-bold uppercase tracking-wider text-textMuted py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Cells Grid (Prompt 42 compliant responsive cell heights) */}
          {isLoading ? (
            <CalendarGridSkeleton />
          ) : (
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60 bg-bg/10">
              {gridDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`min-h-[70px] sm:min-h-[105px] p-1.5 sm:p-2 flex flex-col transition-colors ${
                    day.isCurrentMonth ? 'bg-surface/70' : 'bg-bg/40 opacity-40'
                  } ${day.isToday ? 'ring-1 ring-gold/80 bg-gold/5' : ''}`}
                >
                  {/* Date Label Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full text-[10px] sm:text-xs font-bold ${
                        day.isToday
                          ? 'bg-gold text-bg font-extrabold'
                          : day.isCurrentMonth
                          ? 'text-text'
                          : 'text-textMuted'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {day.events.length > 0 && (
                      <span className="text-[9px] sm:text-[10px] font-mono text-gold font-bold">
                        {day.events.length}
                      </span>
                    )}
                  </div>

                  {/* Event Pills List */}
                  <div className="space-y-0.5 sm:space-y-1 overflow-y-auto max-h-[70px]">
                    {day.events.map((evt) => (
                      <button
                        key={evt._id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full text-left rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold border transition-all truncate block ${getEventTypePillStyle(
                          evt.type
                        )}`}
                      >
                        <span className="truncate">{evt.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Agenda View */
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-xs text-textMuted">
              No upcoming scheduled operations events matching this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt._id}
                  onClick={() => setSelectedEvent(evt)}
                  className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-gold/50 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge variant={getEventTypeBadgeVariant(evt.type)} size="sm">
                        {evt.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono text-textMuted">
                        {new Date(evt.startDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-text hover:text-gold transition-colors leading-snug">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="text-xs text-textMuted line-clamp-2">{evt.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className="text-[11px] font-mono text-gold flex items-center gap-1">
                      <Icon name="Clock" size={11} />
                      {evt.allDay
                        ? 'All Day'
                        : new Date(evt.startDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                    </span>

                    <span className="text-gold font-semibold text-xs inline-flex items-center gap-1">
                      <span>Details</span>
                      <Icon name="ArrowRight" size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title="Scheduled Event Details"
          size="md"
        >
          <div className="space-y-4 font-sans">
            {/* Header info */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={getEventTypeBadgeVariant(selectedEvent.type)}>
                  {selectedEvent.type.toUpperCase()}
                </Badge>
                <Badge variant="muted">{selectedEvent.visibility.toUpperCase()}</Badge>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-text leading-snug">
                {selectedEvent.title}
              </h2>
            </div>

            {/* Date & Time info */}
            <div className="rounded-xl border border-border bg-bg/50 p-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-text">
                <Icon name="Calendar" size={15} className="text-gold" />
                <span className="font-mono font-bold">
                  {new Date(selectedEvent.startDate).toLocaleString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: selectedEvent.allDay ? undefined : '2-digit',
                    minute: selectedEvent.allDay ? undefined : '2-digit',
                  })}
                </span>
                {selectedEvent.allDay && (
                  <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded font-mono">
                    All Day
                  </span>
                )}
              </div>

              {selectedEvent.location && (
                <div className="flex items-center space-x-2 text-textMuted">
                  <Icon name="Compass" size={15} className="text-gold" />
                  <span>Location: {selectedEvent.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-textMuted uppercase block">
                  Description
                </span>
                <p className="text-xs text-text bg-bg/30 p-3 rounded-xl border border-border/50 whitespace-pre-wrap leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Associated Task */}
            {selectedEvent.relatedTask && (
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="FileText" size={15} className="text-gold" />
                    <span className="text-xs font-bold text-gold uppercase tracking-wider">
                      Associated Task Deadline
                    </span>
                  </div>
                  <StatusBadge status={selectedEvent.relatedTask.status} size="sm" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-text">{selectedEvent.relatedTask.title}</h4>
                  <p className="text-[11px] text-textMuted font-mono mt-0.5">
                    Task Type: {selectedEvent.relatedTask.type}
                  </p>
                </div>

                <div className="pt-1">
                  <Link
                    to={`/admin/tasks/${selectedEvent.relatedTask._id}`}
                    onClick={() => setSelectedEvent(null)}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center"
                      rightIcon={<Icon name="ArrowRight" size={14} />}
                    >
                      Open Task Details Page
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t border-border">
              <Button variant="secondary" size="sm" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarPage;

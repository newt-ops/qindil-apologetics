import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import { useCalendarEvents } from '../../hooks/useCalendar';
import { CalendarEventItem, EventType } from '../../api/event';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Spinner } from '../../components/ui/Spinner';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);

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

    const cellEvents = events.filter((e) => {
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

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Calendar" size={14} />
            <span>Team Operations Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Team Operations Calendar
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Task deadlines, team syncs, and operational schedule overview.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center space-x-2 bg-surface p-1.5 rounded-xl border border-border">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrevMonth}
            className="!px-2.5"
            title="Previous Month"
          >
            <Icon name="ChevronLeft" size={16} />
          </Button>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-bold text-text hover:text-gold transition-colors"
          >
            Today
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleNextMonth}
            className="!px-2.5"
            title="Next Month"
          >
            <Icon name="ChevronRight" size={16} />
          </Button>

          <span className="text-sm font-extrabold text-gold px-3 min-w-[130px] text-center">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-border bg-bg/80 text-center text-xs font-bold uppercase tracking-wider text-textMuted py-3">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Cells Grid */}
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60 bg-bg/20">
            {gridDays.map((day, idx) => (
              <div
                key={idx}
                className={`min-h-[100px] p-2 flex flex-col transition-colors ${
                  day.isCurrentMonth ? 'bg-surface/60' : 'bg-bg/40 opacity-40'
                } ${day.isToday ? 'ring-1 ring-gold/80 bg-gold/5' : ''}`}
              >
                {/* Date Label Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
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
                    <span className="text-[10px] font-mono font-semibold text-textMuted">
                      {day.events.length} {day.events.length === 1 ? 'event' : 'events'}
                    </span>
                  )}
                </div>

                {/* Event Pills List */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                  {day.events.map((evt) => (
                    <button
                      key={evt._id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`w-full text-left rounded px-2 py-0.5 text-[11px] font-semibold border transition-all truncate block ${getEventTypePillStyle(
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

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title="Event Details"
          size="md"
        >
          <div className="space-y-5 font-sans">
            {/* Header info */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={getEventTypeBadgeVariant(selectedEvent.type)}>
                  {selectedEvent.type.toUpperCase()}
                </Badge>
                <Badge variant="muted">{selectedEvent.visibility.toUpperCase()}</Badge>
              </div>
              <h2 className="text-xl font-bold text-text">{selectedEvent.title}</h2>
            </div>

            {/* Date & Time info */}
            <div className="rounded-lg border border-border bg-bg/50 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-text">
                <Icon name="Calendar" size={16} className="text-gold" />
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
                <div className="flex items-center space-x-2 text-xs text-textMuted">
                  <Icon name="Compass" size={16} className="text-gold" />
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
                <p className="text-xs text-text bg-bg/30 p-3 rounded-lg border border-border/50 whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Related Task Card */}
            {selectedEvent.relatedTask && (
              <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="FileText" size={16} className="text-gold" />
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
            <div className="flex justify-end pt-2">
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePublicEvents } from '../../../hooks/usePublicData';
import Icon from '../../../components/icons/Icon';
import Seo from '../../../components/shared/Seo';
import { EventCardSkeleton } from '../../../components/ui/Skeleton';

export function EventsPage() {
  const [includePast, setIncludePast] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: events, isLoading, isError } = usePublicEvents({ includePast });

  // Filter events by category if set
  const filteredEvents = (events || []).filter((e) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'online') {
      const loc = (e.location || '').toLowerCase();
      return loc.includes('online') || loc.includes('webinar') || loc.includes('zoom') || loc.includes('stream');
    }
    if (selectedCategory === 'in-person') {
      const loc = (e.location || '').toLowerCase();
      return !loc.includes('online') && !loc.includes('webinar') && !loc.includes('zoom');
    }
    return true;
  });

  const generateGoogleCalendarUrl = (event: any) => {
    const title = encodeURIComponent(event.title || 'Qindil Event');
    const details = encodeURIComponent(event.description || 'Academic symposium hosted by Qindil Apologetics');
    const location = encodeURIComponent(event.location || 'Online');
    const start = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = event.endDate
      ? new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '')
      : start;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  };

  const eventsJsonLd =
    events && events.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: events.map((event, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'Event',
              name: event.title,
              description: event.description || event.title,
              startDate: event.startDate,
              endDate: event.endDate || event.startDate,
              eventStatus: 'https://schema.org/EventScheduled',
              eventAttendanceMode:
                event.location?.toLowerCase().includes('online') ||
                event.location?.toLowerCase().includes('webinar') ||
                event.location?.toLowerCase().includes('zoom')
                  ? 'https://schema.org/OnlineEventAttendanceMode'
                  : 'https://schema.org/OfflineEventAttendanceMode',
              location:
                event.location?.toLowerCase().includes('online') ||
                event.location?.toLowerCase().includes('webinar') ||
                event.location?.toLowerCase().includes('zoom')
                  ? {
                      '@type': 'VirtualLocation',
                      url: typeof window !== 'undefined' ? window.location.href : 'https://qindilapologetics.com/events',
                    }
                  : {
                      '@type': 'Place',
                      name: event.location || 'Qindil Research Center',
                    },
              organizer: {
                '@type': 'Organization',
                name: 'Qindil Apologetics',
                url: typeof window !== 'undefined' ? window.location.origin : 'https://qindilapologetics.com',
              },
            },
          })),
        }
      : undefined;

  return (
    <div className="relative min-h-screen bg-bg text-text font-sans py-6 sm:py-16 selection:bg-gold/20 selection:text-gold transition-colors duration-200 overflow-hidden">
      <Seo
        title="Public Events & Symposia"
        description="Academic symposiums, public webinars, and live Q&A sessions hosted by Qindil Apologetics."
        jsonLd={eventsJsonLd}
      />

      {/* Ambient background glow & radial highlights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(179,133,76,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,168,76,0.12),rgba(0,0,0,0))]" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] bg-gold/10 dark:bg-gold/5 blur-[130px] rounded-full" />

      <div className="relative mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 sm:pb-6 border-b border-border">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center space-x-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-[11px] sm:text-xs font-semibold text-gold">
              <Icon name="Calendar" size={13} />
              <span>Public Symposia &amp; Seminars</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
              Schedule of Academic Events
            </h1>
            <p className="text-xs sm:text-sm text-textMuted max-w-xl leading-relaxed">
              Explore upcoming webinars, academic panel discussions, and public discourses hosted by the Qindil research fellows.
            </p>
          </div>

          {/* Include Past Events Toggle */}
          <label className="flex items-center space-x-2 text-xs font-medium text-textMuted cursor-pointer bg-surface border border-border px-3 py-2 rounded-lg hover:border-gold/50 transition self-start md:self-auto shrink-0 shadow-sm">
            <input
              type="checkbox"
              checked={includePast}
              onChange={(e) => setIncludePast(e.target.checked)}
              className="rounded border-border text-gold focus:ring-gold accent-gold cursor-pointer"
            />
            <span>Include Past Archive</span>
          </label>
        </div>

        {/* Filter Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-gold text-bg font-bold shadow-sm'
                : 'bg-surface border border-border text-textMuted hover:text-text'
            }`}
          >
            All Sessions ({events?.length || 0})
          </button>
          <button
            onClick={() => setSelectedCategory('online')}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              selectedCategory === 'online'
                ? 'bg-gold text-bg font-bold shadow-sm'
                : 'bg-surface border border-border text-textMuted hover:text-text'
            }`}
          >
            Virtual &amp; Webinars
          </button>
          <button
            onClick={() => setSelectedCategory('in-person')}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              selectedCategory === 'in-person'
                ? 'bg-gold text-bg font-bold shadow-sm'
                : 'bg-surface border border-border text-textMuted hover:text-text'
            }`}
          >
            In-Person Seminars
          </button>
        </div>

        {/* Events List - Prompt 42: Compact list rows on mobile */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <EventCardSkeleton key={n} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-5 text-center text-xs sm:text-sm text-danger font-medium">
            Failed to load public events. Please check your connection and try again.
          </div>
        ) : filteredEvents && filteredEvents.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredEvents.map((event, index) => {
              const startDate = new Date(event.startDate);
              const isPast = startDate < new Date();

              const day = startDate.getDate();
              const month = startDate.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
              const year = startDate.getFullYear();
              const timeString = event.allDay
                ? 'All Day'
                : startDate.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

              const isOnline =
                event.location?.toLowerCase().includes('online') ||
                event.location?.toLowerCase().includes('webinar') ||
                event.location?.toLowerCase().includes('zoom');

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.25) }}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between rounded-xl sm:rounded-2xl border bg-surface p-3.5 sm:p-5 shadow-sm transition hover:border-gold/50 hover:shadow-md gap-3 ${
                    isPast ? 'opacity-75 border-border/70' : 'border-border'
                  }`}
                >
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-5 min-w-0">
                    {/* Compact Date Badge */}
                    <div className="flex flex-col items-center justify-center rounded-xl bg-bg border border-border px-2.5 py-1.5 sm:px-4 sm:py-3 min-w-[56px] sm:min-w-[76px] text-center shrink-0 shadow-inner">
                      <span className="text-base sm:text-2xl font-black text-gold leading-none font-mono">
                        {day}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-textMuted uppercase mt-0.5 tracking-wider">
                        {month} {year}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
                          <Icon name="Clock" size={10} />
                          <span>{timeString}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] font-medium text-textMuted">
                          <Icon name={isOnline ? 'Globe' : 'MapPin'} size={10} />
                          <span>{isOnline ? 'Virtual Session' : 'In-Person'}</span>
                        </span>

                        {isPast ? (
                          <span className="inline-block rounded-full bg-surface border border-border px-2 py-0.5 text-[10px] font-semibold text-textMuted">
                            Concluded
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                            Upcoming
                          </span>
                        )}
                      </div>

                      <h2 className="text-xs sm:text-base font-bold text-text group-hover:text-gold transition-colors leading-snug">
                        {event.title}
                      </h2>

                      {event.description && (
                        <p className="text-[11px] sm:text-xs text-textMuted leading-relaxed max-w-2xl line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {event.location && (
                        <div className="flex items-center space-x-1 text-[10px] sm:text-xs text-gold">
                          <Icon name="Compass" size={11} className="shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Add to Calendar */}
                  {!isPast && (
                    <div className="flex items-center sm:self-center shrink-0 pt-1 sm:pt-0 pl-14 sm:pl-0">
                      <a
                        href={generateGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 rounded-lg border border-gold/30 bg-gold/10 hover:bg-gold hover:text-bg px-3 py-1.5 text-[11px] font-semibold text-gold transition"
                      >
                        <Icon name="Calendar" size={12} />
                        <span>Add to Google Calendar</span>
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-8 sm:p-14 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold border border-gold/20">
              <Icon name="Calendar" size={24} />
            </div>
            <h3 className="text-base font-bold text-text">No Events Scheduled</h3>
            <p className="text-xs text-textMuted max-w-md mx-auto leading-relaxed">
              There are currently no active public events matching your filter. Please subscribe to our updates or check back for new symposium announcements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;

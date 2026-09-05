import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePublicEvents } from '../../hooks/usePublicData';
import Icon from '../../components/icons/Icon';
import Seo from '../../components/shared/Seo';

export function EventsPage() {
  const [includePast, setIncludePast] = useState(false);

  const { data: events, isLoading, isError } = usePublicEvents({ includePast });

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
    <div className="min-h-screen bg-bg text-text font-sans py-16">
      <Seo
        title="Public Events & Webinars"
        description="Academic symposiums, public webinars, and live Q&A sessions hosted by Qindil Apologetics."
        jsonLd={eventsJsonLd}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold">
              <Icon name="Calendar" size={14} />
              <span>Public Schedule</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              Public Events & Webinars
            </h1>
            <p className="text-sm text-textMuted max-w-xl">
              Academic symposiums, public webinars, and live Q&A sessions hosted by Qindil.
            </p>
          </div>

          {/* Include Past Events Checkbox */}
          <label className="flex items-center space-x-2.5 text-xs font-medium text-textMuted cursor-pointer bg-surface border border-border px-3.5 py-2 rounded-md hover:border-gold/50 transition">
            <input
              type="checkbox"
              checked={includePast}
              onChange={(e) => setIncludePast(e.target.checked)}
              className="rounded border-border text-gold focus:ring-gold accent-gold cursor-pointer"
            />
            <span>Include Past Events</span>
          </label>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 animate-pulse rounded-xl border border-border bg-surface/50 p-6"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-6 text-center text-sm text-danger">
            Failed to load public events. Please try again later.
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event, index) => {
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

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className={`group flex flex-col sm:flex-row items-start sm:items-center rounded-xl border bg-surface p-3.5 sm:p-6 shadow-sm transition hover:border-gold/50 ${
                    isPast ? 'opacity-70 border-border/60' : 'border-border'
                  }`}
                >
                  {/* Date Badge */}
                  <div className="flex sm:flex-col items-center justify-center rounded-lg bg-bg border border-border px-3 py-2 sm:px-4 sm:py-3 min-w-[70px] sm:min-w-[85px] text-center mb-2 sm:mb-0 sm:mr-6 shrink-0">
                    <span className="text-lg sm:text-2xl font-black text-gold leading-none">{day}</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-textMuted uppercase ml-2 sm:ml-0 sm:mt-1">
                      {month} {year}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 space-y-1 sm:space-y-2 w-full">
                    <div className="flex items-center space-x-2">
                      <span className="inline-block rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-[11px] font-semibold text-gold">
                        {timeString}
                      </span>
                      {isPast && (
                        <span className="inline-block rounded-full bg-surface border border-border px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-[11px] font-semibold text-textMuted">
                          Ended
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-lg font-bold text-text group-hover:text-gold transition-colors leading-snug">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-[11px] sm:text-xs text-textMuted leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">
                        {event.description}
                      </p>
                    )}

                    {event.location && (
                      <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs text-gold pt-0.5 sm:pt-1">
                        <Icon name="Compass" size={13} className="sm:w-3.5 sm:h-3.5" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-sm text-textMuted space-y-2">
            <Icon name="Calendar" size={32} className="mx-auto text-gold/40 mb-3" />
            <p className="font-semibold text-text">No Public Events Scheduled</p>
            <p className="text-xs text-textMuted max-w-md mx-auto">
              Check back soon for upcoming webinars, live streams, and academic symposiums.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;

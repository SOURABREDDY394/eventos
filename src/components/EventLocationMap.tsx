import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import type { Event } from '@/types';

function cleanLocationPart(value?: string | null) {
  const next = (value || '').trim();
  if (!next || next.toLowerCase() === 'to be announced') return '';
  return next;
}

export function getEventLocationQuery(event: Pick<Event, 'venue' | 'city' | 'title'>) {
  const query = [cleanLocationPart(event.venue), cleanLocationPart(event.city)].filter(Boolean).join(', ');
  return query || cleanLocationPart(event.title);
}

export function getGoogleMapsUrl(event: Pick<Event, 'venue' | 'city' | 'title'>) {
  const query = getEventLocationQuery(event);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function getGoogleMapsEmbedUrl(event: Pick<Event, 'venue' | 'city' | 'title'>) {
  const query = getEventLocationQuery(event);
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
}

export function EventLocationMap({ event, variant = 'light' }: { event: Event; variant?: 'light' | 'dark' }) {
  const venue = cleanLocationPart(event.venue);
  const city = cleanLocationPart(event.city);
  const hasLocation = Boolean(venue || city);
  const mapsUrl = getGoogleMapsUrl(event);
  const embedUrl = getGoogleMapsEmbedUrl(event);
  const isDark = variant === 'dark';

  return (
    <section className={isDark ? 'glass-card rounded-xl p-5' : 'rounded-2xl border border-[#D9D0B8] bg-white shadow-sm overflow-hidden'}>
      <div className={isDark ? 'mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3' : 'p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'}>
        <div>
          <div className="flex items-center gap-2">
            <span className={isDark ? 'w-10 h-10 rounded-full bg-[#E49B3A]/10 flex items-center justify-center' : 'w-10 h-10 rounded-full bg-[#52670F]/10 flex items-center justify-center'}>
              <MapPin className={isDark ? 'w-5 h-5 text-[#E49B3A]' : 'w-5 h-5 text-[#52670F]'} />
            </span>
            <div>
              <h2 className={isDark ? 'text-base font-semibold text-white' : 'text-base font-black text-[#14150F]'}>Event Location</h2>
              <p className={isDark ? 'text-xs text-white/35 mt-1' : 'text-xs text-[#5E6256] mt-1'}>
                {hasLocation ? [venue, city].filter(Boolean).join(', ') : 'Location will be announced by the organizer.'}
              </p>
            </div>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className={isDark ? 'ghost-btn rounded-full text-xs inline-flex items-center gap-2' : 'rounded-full border border-[#C9D4A8] px-4 py-2 text-xs font-black text-[#52670F] inline-flex items-center gap-2 hover:bg-[#EEF5DC] transition-colors'}
        >
          <Navigation className="w-4 h-4" />
          Open in Maps
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {hasLocation ? (
        <div className={isDark ? 'overflow-hidden rounded-xl border border-white/10 bg-black/20' : 'overflow-hidden border-t border-[#E6DEC8] bg-[#F5F1E6]'}>
          <iframe
            title={`${event.title} location map`}
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0"
          />
        </div>
      ) : (
        <div className={isDark ? 'rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center' : 'border-t border-dashed border-[#D9D0B8] bg-[#F5F1E6] p-8 text-center'}>
          <MapPin className={isDark ? 'w-10 h-10 text-white/15 mx-auto mb-3' : 'w-10 h-10 text-[#52670F]/25 mx-auto mb-3'} />
          <p className={isDark ? 'text-sm text-white/35' : 'text-sm text-[#5E6256]'}>
            Add a venue or city while creating the event to show the embedded map.
          </p>
        </div>
      )}
    </section>
  );
}

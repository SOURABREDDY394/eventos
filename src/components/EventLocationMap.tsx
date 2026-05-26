import { Building2, Compass, ExternalLink, LocateFixed, MapPin, Navigation, Route } from 'lucide-react';
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
  const shellClass = isDark
    ? 'relative overflow-hidden rounded-2xl border border-[#F5C66C]/15 bg-[#0B0D06] shadow-[0_28px_90px_rgba(0,0,0,0.32)]'
    : 'relative overflow-hidden rounded-[1.75rem] border border-[#D9D0B8] bg-[#FEFCF4] shadow-[0_28px_80px_rgba(82,103,15,0.12)]';
  const panelClass = isDark
    ? 'border-white/10 bg-white/[0.055] text-white'
    : 'border-[#E2D9BF] bg-white text-[#14150F]';
  const mutedText = isDark ? 'text-white/45' : 'text-[#5E6256]';
  const titleText = isDark ? 'text-white' : 'text-[#14150F]';
  const accentText = isDark ? 'text-[#F5C66C]' : 'text-[#52670F]';

  return (
    <section className={shellClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className={isDark ? 'absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#F5C66C]/10 blur-3xl' : 'absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#DCE9B7] blur-3xl'} />
        <div className={isDark ? 'absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-[#A76A19]/10 blur-3xl' : 'absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-[#F5C66C]/18 blur-3xl'} />
      </div>

      <div className="relative grid lg:grid-cols-[0.78fr_1.22fr]">
        <aside className={isDark ? 'p-5 sm:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-white/10' : 'p-5 sm:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-[#E6DEC8]'}>
          <div className="flex items-center gap-2">
            <span className={isDark ? 'inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5C66C]/12 text-[#F5C66C]' : 'inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF5DC] text-[#52670F]'}>
              <LocateFixed className="h-5 w-5" />
            </span>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${accentText}`}>Venue Map</p>
              <h2 className={`mt-1 text-2xl font-black ${titleText}`}>Event Location</h2>
            </div>
          </div>

          <p className={`mt-4 text-sm leading-relaxed ${mutedText}`}>
            {hasLocation
              ? 'Use the map preview to understand the venue context before applying, volunteering, or sponsoring.'
              : 'The organizer has not added a venue yet. Add a city or venue to unlock the live map preview.'}
          </p>

          <div className="mt-6 space-y-3">
            <div className={`rounded-2xl border p-4 ${panelClass}`}>
              <div className="flex items-start gap-3">
                <Building2 className={`mt-0.5 h-4 w-4 ${accentText}`} />
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${mutedText}`}>Venue</p>
                  <p className={`mt-1 text-sm font-bold ${titleText}`}>{venue || 'To be announced'}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${panelClass}`}>
              <div className="flex items-start gap-3">
                <MapPin className={`mt-0.5 h-4 w-4 ${accentText}`} />
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${mutedText}`}>City</p>
                  <p className={`mt-1 text-sm font-bold ${titleText}`}>{city || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className={isDark ? 'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F5C66C] px-5 py-3 text-sm font-black text-[#14150F] transition-transform hover:-translate-y-0.5 hover:brightness-105' : 'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#52670F] px-5 py-3 text-sm font-black text-white transition-transform hover:-translate-y-0.5 hover:bg-[#43540C]'}
          >
            <Navigation className="h-4 w-4" />
            Open in Google Maps
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </aside>

        <div className="relative min-h-[22rem] p-3 sm:p-4">
          {hasLocation ? (
            <div className={isDark ? 'relative h-full min-h-[22rem] overflow-hidden rounded-[1.35rem] border border-white/10 bg-black shadow-2xl' : 'relative h-full min-h-[22rem] overflow-hidden rounded-[1.35rem] border border-[#E3D8BD] bg-[#EEE7D6] shadow-[0_18px_48px_rgba(82,103,15,0.13)]'}>
              <iframe
                title={`${event.title} location map`}
                src={embedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[22rem] w-full border-0 grayscale-[18%] sepia-[10%] contrast-[1.02]"
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
              <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/55 px-3 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md">
                {event.title}
              </div>
              <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/18 bg-black/58 p-4 text-white shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[#F5C66C]">
                    <Compass className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">Arrive Prepared</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{[venue, city].filter(Boolean).join(', ')}</p>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/18 bg-white/90 p-4 text-[#14150F] shadow-xl backdrop-blur-md transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 text-[#52670F]">
                    <Route className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">Directions</span>
                  </div>
                  <p className="mt-2 text-sm font-black">Open route planner</p>
                </a>
              </div>
            </div>
          ) : (
            <div className={isDark ? 'flex h-full min-h-[22rem] items-center justify-center rounded-[1.35rem] border border-dashed border-white/12 bg-white/[0.035] p-8 text-center' : 'flex h-full min-h-[22rem] items-center justify-center rounded-[1.35rem] border border-dashed border-[#D9D0B8] bg-[#F5F1E6] p-8 text-center'}>
              <div>
                <MapPin className={isDark ? 'mx-auto mb-4 h-12 w-12 text-white/15' : 'mx-auto mb-4 h-12 w-12 text-[#52670F]/25'} />
                <p className={`text-lg font-black ${titleText}`}>Map unlocks after location is added</p>
                <p className={`mx-auto mt-2 max-w-sm text-sm ${mutedText}`}>Add venue and city while creating or editing the event so participants can open directions instantly.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

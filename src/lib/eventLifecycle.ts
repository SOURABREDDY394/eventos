import type { Event } from '@/types';

export type EventDisplayStatus = 'Cancelled' | 'Draft' | 'Ended' | 'Live Today' | 'Upcoming';

function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function todayLocalDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isPastEvent(eventDate: string) {
  return parseLocalDate(eventDate).getTime() < todayLocalDate().getTime();
}

export function isTodayEvent(eventDate: string) {
  return parseLocalDate(eventDate).getTime() === todayLocalDate().getTime();
}

export function isUpcomingEvent(eventDate: string) {
  return parseLocalDate(eventDate).getTime() >= todayLocalDate().getTime();
}

export function getEventDisplayStatus(event: Event): EventDisplayStatus {
  if (event.status === 'cancelled') return 'Cancelled';
  if (event.status === 'draft') return 'Draft';
  if (isPastEvent(event.date)) return 'Ended';
  if (isTodayEvent(event.date)) return 'Live Today';
  return 'Upcoming';
}

export function isActivePublishedEvent(event: Event) {
  return event.status === 'published' && isUpcomingEvent(event.date);
}

export function sortUpcomingEvents(events: Event[]) {
  return [...events].sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());
}

export function sortPastEvents(events: Event[]) {
  return [...events].sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
}

export function eventStatusBadgeClass(status: EventDisplayStatus) {
  if (status === 'Live Today') return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/20';
  if (status === 'Upcoming') return 'bg-[#E49B3A]/15 text-[#F7C56B] border-[#E49B3A]/25';
  if (status === 'Ended') return 'bg-zinc-500/20 text-zinc-300 border-zinc-400/15';
  if (status === 'Cancelled') return 'bg-red-500/20 text-red-300 border-red-400/20';
  return 'bg-white/10 text-white/35 border-white/10';
}

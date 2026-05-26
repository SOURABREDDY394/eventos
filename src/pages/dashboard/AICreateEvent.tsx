import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bot, Calendar, CheckCircle2, ClipboardList, Handshake, Loader2, QrCode, Sparkles, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import type { EventFormField } from '@/types';

type DraftField = Omit<EventFormField, 'id' | 'event_id' | 'created_at'>;

type EventDraft = {
  title: string;
  slug: string;
  description: string;
  category: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  city: string;
  max_participants: number;
  formFields: DraftField[];
  volunteerRoles: Array<{ role_name: string; description: string; required_count: number; skills: string[] }>;
  sponsorPackages: string[];
  budgetCategories: string[];
  certificateSetup: string;
  analysis: {
    foundEventType: string;
    foundDate: boolean;
    warnings: string[];
  };
};

const defaultPrompt = 'Create a 100-seat AI workshop in Hyderabad with registration form, volunteer support, QR check-in, and certificates.';
const AI_PROMPT_KEY = 'eventos_ai_prompt';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const monthIndexes: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

function titleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word ? `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}` : word)
    .join(' ');
}

function parsePromptDate(prompt: string) {
  const lower = prompt.toLowerCase();
  const monthPattern = Object.keys(monthIndexes).join('|');
  const dayFirst = lower.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthPattern})\\b`));
  const monthFirst = lower.match(new RegExp(`\\b(${monthPattern})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`));

  const day = dayFirst ? Number(dayFirst[1]) : monthFirst ? Number(monthFirst[2]) : null;
  const monthName = dayFirst ? dayFirst[2] : monthFirst ? monthFirst[1] : null;
  if (!day || !monthName || day < 1 || day > 31) return '';

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const month = monthIndexes[monthName];
  let candidate = new Date(today.getFullYear(), month, day);
  if (candidate < startOfToday) candidate = new Date(today.getFullYear() + 1, month, day);
  return formatDateInput(candidate);
}

function inferEvent(prompt: string) {
  const lower = prompt.toLowerCase();
  if (/\b(pubg|bgmi|free fire|esports|e-sports|gaming)\b/.test(lower)) {
    const title = lower.includes('pubg') ? 'PUBG Tournament' : lower.includes('bgmi') ? 'BGMI Tournament' : 'Esports Tournament';
    return { title, category: 'Gaming / Esports', kind: 'gaming', found: title };
  }
  if (/\b(ai|artificial intelligence|machine learning|ml|gen ai|genai)\b/.test(lower)) {
    return { title: 'AI Workshop', category: 'Technology / AI', kind: 'ai', found: 'AI workshop' };
  }
  if (/\b(hackathon|coding)\b/.test(lower)) {
    const title = /\b24\s*(?:hour|hr)\b/.test(lower) ? '24-Hour Hackathon' : 'Hackathon';
    return { title, category: 'Hackathon / Technology', kind: 'hackathon', found: title };
  }
  if (/\b(web dev|web development|frontend|full stack|fullstack)\b/.test(lower)) {
    return { title: 'Web Development Bootcamp', category: 'Technology', kind: 'workshop', found: 'Web development' };
  }
  if (/\b(startup|business|entrepreneur)\b/.test(lower)) {
    return { title: 'Startup Event', category: 'Entrepreneurship', kind: 'business', found: 'Startup / business' };
  }
  if (/\b(cultural|dance|music|singing|concert)\b/.test(lower)) {
    return { title: 'Cultural Event', category: 'Cultural', kind: 'cultural', found: 'Cultural event' };
  }
  if (/\bsports?\b/.test(lower)) {
    return { title: 'Sports Event', category: 'Sports', kind: 'sports', found: 'Sports event' };
  }
  return null;
}

function inferCity(prompt: string) {
  const known = ['Hyderabad', 'Bengaluru', 'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Chennai', 'Kolkata', 'Noida', 'Gurgaon', 'Gurugram', 'Ahmedabad', 'Jaipur'];
  const knownCity = known.find(city => new RegExp(`\\b${city}\\b`, 'i').test(prompt));
  if (knownCity) return knownCity === 'Bangalore' ? 'Bengaluru' : knownCity;

  const cityMatch = prompt.match(/\bin\s+([a-zA-Z ]+?)(?=\s+(?:on|at|for|with|from|and|having|including|where|which)\b|,|\.|$)/i);
  if (!cityMatch?.[1]) return '';

  const city = cityMatch[1].trim().replace(/\s+/g, ' ');
  if (city.length < 2 || /\b(event|workshop|hackathon|tournament|students?|participants?)\b/i.test(city)) return '';
  return titleCase(city);
}

function inferVenue(prompt: string) {
  const venueMatch = prompt.match(/\b(?:venue|at)\s+(?:the\s+)?([a-zA-Z0-9 &'-]+?(?:auditorium|hall|arena|ground|stadium|campus|center|centre|room|lab|club|cafe))\b/i);
  return venueMatch?.[1] ? titleCase(venueMatch[1]) : 'To be announced';
}

function inferCapacity(prompt: string, kind: string) {
  const match = prompt.match(/(\d{1,5})\s*(?:seat|seats|person|people|student|students|participant|participants|attendee|attendees|player|players)/i);
  if (match) return Number(match[1]);
  return kind === 'gaming' || kind === 'sports' || kind === 'cultural' ? 50 : 100;
}

function descriptionFor(event: NonNullable<ReturnType<typeof inferEvent>>, maxParticipants: number, city: string) {
  const locationText = city ? ` in ${city}` : '';
  if (event.kind === 'gaming') {
    return `${event.title} is a competitive gaming event where participants compete in structured matches${locationText}. Registrations require organizer approval, and approved players receive event access details.`;
  }
  if (event.kind === 'ai') {
    return `${event.title} is a hands-on learning event for ${maxParticipants} participants${locationText}. Participants apply through a registration form, organizers approve attendees, and approved participants receive QR tickets for verified check-in.`;
  }
  if (event.kind === 'hackathon') {
    return `${event.title} is a build-focused event for ${maxParticipants} participants${locationText}. Teams or individuals submit applications, organizers approve participants, and attendance can be verified for certificates and Proof Passport records.`;
  }
  return `${event.title} is an organized event for ${maxParticipants} participants${locationText}. Registration requires organizer approval, approved attendees receive QR tickets, and verified participation can become certificates and proof records.`;
}

function buildDraft(prompt: string): EventDraft {
  const lower = prompt.toLowerCase();
  const event = inferEvent(prompt);
  const warnings: string[] = [];

  if (!event) {
    warnings.push('Event type was not clear. What type of event do you want to create?');
  }

  const city = inferCity(prompt);
  if (!city) warnings.push('City was not found. You can leave it empty or add a city.');

  const venue = inferVenue(prompt);
  if (venue === 'To be announced') warnings.push('Venue was not found. Venue is set to To be announced.');

  const date = parsePromptDate(prompt);
  if (!date) warnings.push('Date was not found. Please choose a date.');

  const fallbackEvent = event ?? { title: 'Untitled Event', category: '', kind: 'unknown', found: '' };
  const maxParticipants = inferCapacity(prompt, fallbackEvent.kind);
  const needsSponsors = lower.includes('sponsor');
  const needsVolunteers = lower.includes('volunteer') || maxParticipants >= 100 || fallbackEvent.kind === 'gaming';

  return {
    title: fallbackEvent.title,
    slug: slugify(`${fallbackEvent.title}-${Date.now().toString().slice(-4)}`),
    description: event ? descriptionFor(event, maxParticipants, city) : '',
    category: fallbackEvent.category,
    date,
    start_time: '10:00',
    end_time: '16:00',
    venue,
    city,
    max_participants: maxParticipants,
    formFields: [
      { label: 'Full Name', field_type: 'text', required: true, options: [], sort_order: 0 },
      { label: 'Email', field_type: 'email', required: true, options: [], sort_order: 1 },
      { label: 'Phone Number', field_type: 'phone', required: true, options: [], sort_order: 2 },
      { label: 'College / Organization', field_type: 'text', required: true, options: [], sort_order: 3 },
      { label: 'Why do you want to attend?', field_type: 'textarea', required: true, options: [], sort_order: 4 },
      { label: 'Need certificate?', field_type: 'select', required: false, options: ['Yes', 'No'], sort_order: 5 },
    ],
    volunteerRoles: needsVolunteers ? [
      { role_name: fallbackEvent.kind === 'gaming' ? 'Match Desk' : 'Registration Desk', description: fallbackEvent.kind === 'gaming' ? 'Coordinate player check-in, match slots, and event flow.' : 'Verify approved registrations and guide attendees at check-in.', required_count: 2, skills: ['Communication', 'Check-in Ops'] },
      { role_name: fallbackEvent.kind === 'gaming' ? 'Score Coordinator' : 'Venue Support', description: fallbackEvent.kind === 'gaming' ? 'Track match results and support tournament operations.' : 'Support room flow, seating, and participant assistance.', required_count: 2, skills: ['Event Operations', 'Coordination'] },
    ] : [],
    sponsorPackages: needsSponsors ? ['Community Partner', fallbackEvent.kind === 'gaming' ? 'Esports Partner' : 'Workshop Partner', 'Certificate Partner'] : ['Community Partner'],
    budgetCategories: fallbackEvent.kind === 'gaming'
      ? ['Venue', 'Gaming Setup', 'Prize Pool', 'Operations', 'Promotion']
      : ['Venue', 'Food & Beverages', 'Certificates', 'Operations', 'Promotion'],
    certificateSetup: 'Certificates are prepared for attended participants after organizer verification.',
    analysis: {
      foundEventType: fallbackEvent.found,
      foundDate: Boolean(date),
      warnings,
    },
  };
}

export default function AICreateEvent() {
  const navigate = useNavigate();
  const user = store.getCurrentUser();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const pendingPrompt = localStorage.getItem(AI_PROMPT_KEY);
    if (pendingPrompt) {
      setPrompt(pendingPrompt);
      setDraft(buildDraft(pendingPrompt));
    }
  }, []);

  const outputItems = useMemo(() => [
    { icon: ClipboardList, label: 'Registration form generated' },
    { icon: CheckCircle2, label: 'Approval flow enabled' },
    { icon: QrCode, label: 'QR check-in ready' },
    { icon: Users, label: 'Volunteer roles suggested' },
    { icon: Handshake, label: 'Sponsor packages suggested' },
    { icon: Calendar, label: 'Certificate setup prepared' },
  ], []);

  const generateDraft = () => {
    setError('');
    if (!prompt.trim()) {
      setError('Describe the event you want to create.');
      return;
    }
    if (!inferEvent(prompt)) {
      setError('What type of event do you want to create? Try examples like PUBG event, AI workshop, hackathon, cultural event, or sports event.');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setDraft(buildDraft(prompt));
      setLoading(false);
    }, 450);
  };

  const updateDraft = <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => {
    setDraft(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const handleCreate = () => {
    setError('');
    if (!user) {
      navigate('/login');
      return;
    }
    if (!draft) {
      setError('Generate an event draft first.');
      return;
    }
    if (!draft.title.trim() || !draft.date) {
      setError('Event title and date are required.');
      return;
    }

    const event = store.createEvent({
      organizer_id: user.id,
      title: draft.title.trim(),
      slug: draft.slug || slugify(draft.title),
      description: draft.description,
      category: draft.category,
      date: draft.date,
      start_time: draft.start_time,
      end_time: draft.end_time,
      venue: draft.venue,
      city: draft.city,
      poster_url: null,
      max_participants: draft.max_participants,
      status: 'published',
    });

    store.saveEventFormFields(event.id, draft.formFields);
    draft.volunteerRoles.forEach(role => store.createVolunteerRole({ event_id: event.id, ...role }));
    localStorage.removeItem(AI_PROMPT_KEY);
    navigate(`/dashboard/organizer/events/${event.id}`);
  };

  return (
    <DashboardLayout title="AI Create Event">
      <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <section className="rounded-[2rem] bg-white border border-[#E7E1D2] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-10 rounded-full bg-[#EEF5D9] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#5C7415]" />
            </span>
            <div>
              <p className="text-base font-black text-[#14150F]">Create an event by chatting</p>
              <p className="text-xs text-[#5E6256]">Local deterministic builder is active. No Groq key is exposed in Vite.</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#E7E1D2] bg-[#F7F6EB] p-4 mb-4">
            <label className="text-xs font-black tracking-wide text-[#6A7D1A] mb-2 block">Describe your event</label>
            <textarea
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
              rows={6}
              className="w-full bg-transparent text-sm text-[#14150F] leading-6 placeholder:text-[#9AA08D] focus:outline-none resize-none"
              placeholder="Create a 100-seat AI workshop in Hyderabad..."
            />
          </div>

          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button onClick={generateDraft} disabled={loading} className="gold-btn text-sm disabled:opacity-60 flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Event Draft
            </button>
            <button onClick={() => navigate('/dashboard/organizer/events/new')} className="ghost-btn rounded-full text-sm">
              Manual Create Event
            </button>
          </div>

          {draft && (
            <div className="mt-6 rounded-[1.5rem] border border-[#DCE8BE] bg-[#EEF5D9] p-4">
              <p className="text-sm font-black text-[#52670F]">Event draft generated from your prompt.</p>
              <p className="mt-1 mb-3 text-xs text-[#5E6256]">Please review and edit before creating.</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {outputItems.map(item => (
                  <div key={item.label} className="flex items-center gap-2 rounded-xl bg-white border border-[#E7E1D2] px-3 py-2">
                    <item.icon className="w-3.5 h-3.5 text-[#52670F]" />
                    <span className="text-xs font-semibold text-[#45493E]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-[2rem] bg-white border border-[#E7E1D2] p-5 sm:p-6 shadow-sm">
          {!draft ? (
            <div className="min-h-[30rem] flex flex-col items-center justify-center text-center">
              <Sparkles className="w-12 h-12 text-[#52670F]/35 mb-4" />
              <p className="text-lg font-black text-[#14150F]">Your editable draft will appear here.</p>
              <p className="text-sm text-[#5E6256] mt-2 max-w-md">EventOS will generate event fields, registration form, approval settings, volunteer roles, sponsor suggestions, budget categories, and certificate setup.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-[#DCE8BE] bg-[#F3F8E3] p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-[#52670F]">Event draft generated from your prompt.</p>
                    <p className="mt-1 text-xs text-[#5E6256]">Please review and edit every field before creating the event.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white border border-[#DCE8BE] px-3 py-1 text-xs font-bold text-[#52670F]">
                      Found event type: {draft.analysis.foundEventType}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      draft.analysis.foundDate ? 'bg-white border-[#DCE8BE] text-[#52670F]' : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {draft.analysis.foundDate ? 'Found date' : 'Missing date'}
                    </span>
                  </div>
                </div>
                {draft.analysis.warnings.length > 0 && (
                  <div className="mt-3 grid sm:grid-cols-2 gap-2">
                    {draft.analysis.warnings.map(warning => (
                      <p key={warning} className="rounded-xl bg-white/75 border border-[#E7E1D2] px-3 py-2 text-xs text-[#6B705D]">
                        {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs text-[#5E6256] mb-1.5 block">Event Title</span>
                  <input value={draft.title} onChange={event => updateDraft('title', event.target.value)}
                    className="w-full bg-[#F7F6EB] border border-[#E7E1D2] rounded-xl py-2.5 px-3 text-sm text-[#14150F] focus:outline-none focus:border-[#52670F]/50" />
                </label>
                <label className="block">
                  <span className="text-xs text-[#5E6256] mb-1.5 block">Category</span>
                  <input value={draft.category} onChange={event => updateDraft('category', event.target.value)}
                    className="w-full bg-[#F7F6EB] border border-[#E7E1D2] rounded-xl py-2.5 px-3 text-sm text-[#14150F] focus:outline-none focus:border-[#52670F]/50" />
                </label>
              </div>

              <label className="block">
                <span className="text-xs text-[#5E6256] mb-1.5 block">Description</span>
                <textarea value={draft.description} onChange={event => updateDraft('description', event.target.value)} rows={4}
                  className="w-full bg-[#F7F6EB] border border-[#E7E1D2] rounded-xl py-2.5 px-3 text-sm text-[#14150F] focus:outline-none focus:border-[#52670F]/50 resize-none" />
              </label>

              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-xs text-white/45 mb-1.5 block">Date</span>
                  <input type="date" value={draft.date} onChange={event => updateDraft('date', event.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50" />
                </label>
                <label className="block">
                  <span className="text-xs text-white/45 mb-1.5 block">Start</span>
                  <input type="time" value={draft.start_time} onChange={event => updateDraft('start_time', event.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50" />
                </label>
                <label className="block">
                  <span className="text-xs text-white/45 mb-1.5 block">End</span>
                  <input type="time" value={draft.end_time} onChange={event => updateDraft('end_time', event.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50" />
                </label>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block sm:col-span-1">
                  <span className="text-xs text-white/45 mb-1.5 block">Venue</span>
                  <input value={draft.venue} onChange={event => updateDraft('venue', event.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50" />
                </label>
                <label className="block">
                  <span className="text-xs text-white/45 mb-1.5 block">City</span>
                  <input value={draft.city} onChange={event => updateDraft('city', event.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50" />
                </label>
                <label className="block">
                  <span className="text-xs text-white/45 mb-1.5 block">Seats</span>
                  <input type="number" value={draft.max_participants} onChange={event => updateDraft('max_participants', Number(event.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50" />
                </label>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white mb-3">Registration Form</p>
                  <div className="space-y-2">
                    {draft.formFields.map(field => (
                      <div key={field.label} className="flex items-center justify-between rounded-lg bg-black/16 px-3 py-2">
                        <span className="text-xs text-white/68">{field.label}</span>
                        <span className="text-[10px] text-white/30">{field.required ? 'required' : 'optional'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white mb-3">Support Setup</p>
                  <div className="space-y-3 text-xs text-white/55">
                    <p><span className="text-[#E49B3A]">Volunteer roles:</span> {draft.volunteerRoles.length ? draft.volunteerRoles.map(role => role.role_name).join(', ') : 'No volunteer roles requested'}</p>
                    <p><span className="text-[#E49B3A]">Sponsor packages:</span> {draft.sponsorPackages.join(', ')}</p>
                    <p><span className="text-[#E49B3A]">Budget:</span> {draft.budgetCategories.join(', ')}</p>
                    <p><span className="text-[#E49B3A]">Certificate:</span> {draft.certificateSetup}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap gap-3">
                <button onClick={handleCreate} className="gold-btn text-sm">Create Event</button>
                <button onClick={generateDraft} className="ghost-btn rounded-full text-sm">Regenerate</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

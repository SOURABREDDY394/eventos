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
};

const defaultPrompt = 'Create a 100-seat AI workshop in Hyderabad with registration form, volunteer support, QR check-in, and certificates.';
const AI_PROMPT_KEY = 'eventos_ai_prompt';

function nextDate(daysAhead = 14) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function inferCity(prompt: string) {
  const cityMatch = prompt.match(/\bin\s+([a-zA-Z ]+?)(?:\s+with|\s+for|,|\.|$)/i);
  if (cityMatch?.[1]) return cityMatch[1].trim().replace(/\s+/g, ' ');
  const known = ['Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Chennai'];
  return known.find(city => prompt.toLowerCase().includes(city.toLowerCase())) || 'Hyderabad';
}

function inferCapacity(prompt: string) {
  const match = prompt.match(/(\d{2,5})\s*(?:seat|person|people|student|participant|attendee)/i);
  return match ? Number(match[1]) : 100;
}

function inferCategory(prompt: string) {
  const lower = prompt.toLowerCase();
  if (lower.includes('hackathon')) return 'Hackathon';
  if (lower.includes('workshop') || lower.includes('ai') || lower.includes('tech')) return 'Technology';
  if (lower.includes('business') || lower.includes('startup')) return 'Business';
  if (lower.includes('college') || lower.includes('student')) return 'Education';
  return 'Technology';
}

function inferTitle(prompt: string, category: string, city: string) {
  const lower = prompt.toLowerCase();
  if (lower.includes('hackathon')) return `${city} Student Hackathon`;
  if (lower.includes('workshop')) return `${city} AI Workshop`;
  if (lower.includes('meetup')) return `${city} ${category} Meetup`;
  return `${city} ${category} Event`;
}

function buildDraft(prompt: string): EventDraft {
  const city = inferCity(prompt);
  const maxParticipants = inferCapacity(prompt);
  const category = inferCategory(prompt);
  const title = inferTitle(prompt, category, city);
  const lower = prompt.toLowerCase();
  const needsSponsors = lower.includes('sponsor');
  const needsVolunteers = lower.includes('volunteer') || maxParticipants >= 100;

  return {
    title,
    slug: slugify(`${title}-${Date.now().toString().slice(-4)}`),
    description: `${title} is a curated ${category.toLowerCase()} event for ${maxParticipants} participants in ${city}. Registration requires organizer approval, approved attendees receive QR tickets, and verified participation can become certificates and proof records.`,
    category,
    date: nextDate(14),
    start_time: '10:00',
    end_time: '16:00',
    venue: 'Main Auditorium',
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
      { role_name: 'Registration Desk', description: 'Verify approved registrations and guide attendees at check-in.', required_count: 2, skills: ['Communication', 'Check-in Ops'] },
      { role_name: 'Venue Support', description: 'Support room flow, seating, and participant assistance.', required_count: 2, skills: ['Event Operations', 'Coordination'] },
    ] : [],
    sponsorPackages: needsSponsors ? ['Community Partner', 'Workshop Partner', 'Certificate Partner'] : ['Community Partner'],
    budgetCategories: ['Venue', 'Food & Beverages', 'Certificates', 'Operations', 'Promotion'],
    certificateSetup: 'Certificates are prepared for attended participants after organizer verification.',
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
              <p className="text-xs font-black text-[#52670F] mb-3">EventOS generated</p>
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

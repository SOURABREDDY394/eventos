import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bot, Calendar, CheckCircle2, ClipboardList, Handshake, Loader2, QrCode, Sparkles, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import type { EventFormField } from '@/types';
import { requireSupabase } from '@/lib/supabase';

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
  sponsorPackages: Array<{ title: string; description: string; benefits: string[] }>;
  budgetCategories: Array<{ type: 'income' | 'expense'; title: string }>;
  certificateSetup: string;
  certificateEnabled: boolean;
  analysis: {
    foundEventType: string;
    foundDate: boolean;
    warnings: string[];
  };
};

type EdgeRegistrationField = {
  label?: string;
  field_type?: DraftField['field_type'];
  required?: boolean;
  options?: string[];
};

type EdgeEventDraft = {
  title?: string;
  category?: string;
  description?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  city?: string;
  max_participants?: number;
  registration_fields?: EdgeRegistrationField[];
  volunteer_roles?: Array<{ role?: string; description?: string }>;
  sponsor_packages?: Array<{ title?: string; description?: string; benefits?: string[] }>;
  budget_categories?: Array<{ type?: 'income' | 'expense'; title?: string }>;
  certificate_enabled?: boolean;
  warnings?: string[];
};

const defaultPrompt = 'Create a 100-seat AI workshop in Hyderabad with registration form, volunteer support, QR check-in, and certificates.';
const AI_PROMPT_KEY = 'eventos_ai_prompt';
const timezone = 'Asia/Kolkata';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDraft(edgeDraft: EdgeEventDraft): EventDraft {
  const title = (edgeDraft.title || '').trim();
  const category = (edgeDraft.category || '').trim();
  const fields = Array.isArray(edgeDraft.registration_fields) ? edgeDraft.registration_fields : [];
  const warnings = Array.isArray(edgeDraft.warnings) ? edgeDraft.warnings.filter(Boolean) : [];

  return {
    title,
    slug: slugify(`${title || 'event'}-${Date.now().toString().slice(-4)}`),
    description: edgeDraft.description || '',
    category,
    date: edgeDraft.event_date || '',
    start_time: edgeDraft.start_time || '10:00',
    end_time: edgeDraft.end_time || '16:00',
    venue: edgeDraft.venue || 'To be announced',
    city: edgeDraft.city || '',
    max_participants: Number(edgeDraft.max_participants) || 0,
    formFields: fields.map((field, index) => ({
      label: field.label || `Question ${index + 1}`,
      field_type: field.field_type || 'text',
      required: Boolean(field.required),
      options: Array.isArray(field.options) ? field.options : [],
      sort_order: index,
    })),
    volunteerRoles: (edgeDraft.volunteer_roles || []).map(role => ({
      role_name: role.role || 'Volunteer',
      description: role.description || '',
      required_count: 1,
      skills: [],
    })),
    sponsorPackages: (edgeDraft.sponsor_packages || []).map(pkg => ({
      title: pkg.title || 'Sponsor Package',
      description: pkg.description || '',
      benefits: Array.isArray(pkg.benefits) ? pkg.benefits : [],
    })),
    budgetCategories: (edgeDraft.budget_categories || []).map(category => ({
      type: category.type === 'income' ? 'income' : 'expense',
      title: category.title || 'Budget item',
    })),
    certificateEnabled: edgeDraft.certificate_enabled !== false,
    certificateSetup: edgeDraft.certificate_enabled === false
      ? 'Certificates are disabled for this draft.'
      : 'Certificates are prepared for attended participants after organizer verification.',
    analysis: {
      foundEventType: title || 'Review needed',
      foundDate: Boolean(edgeDraft.event_date),
      warnings,
    },
  };
}

async function generateDraftFromGroq(prompt: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke<EdgeEventDraft>('generate-event-draft', {
    body: {
      prompt,
      currentDate: getCurrentDate(),
      timezone,
    },
  });

  if (error) {
    throw new Error(error.message || 'AI event generation is not configured or failed. Please try manual event creation.');
  }

  if (!data) {
    throw new Error('AI event generation returned no draft. Please try manual event creation.');
  }

  return toDraft(data);
}

async function saveDraftToSupabase(draft: EventDraft) {
  const supabase = requireSupabase();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  if (!authData.user) {
    throw new Error('Creating events in Supabase requires a real Supabase Auth organizer session. The current one-click demo login is local only.');
  }

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      organizer_id: authData.user.id,
      title: draft.title.trim(),
      slug: draft.slug || slugify(draft.title),
      description: draft.description,
      category: draft.category || 'General',
      date: draft.date,
      start_time: draft.start_time || null,
      end_time: draft.end_time || null,
      venue: draft.venue || null,
      city: draft.city || null,
      poster_url: null,
      max_participants: draft.max_participants,
      status: 'published',
    })
    .select('id')
    .single();

  if (eventError) throw new Error(eventError.message);
  if (!event?.id) throw new Error('Supabase did not return the created event id.');

  if (draft.formFields.length > 0) {
    const { error: fieldsError } = await supabase
      .from('event_form_fields')
      .insert(draft.formFields.map(field => ({
        event_id: event.id,
        label: field.label,
        field_type: field.field_type,
        required: field.required,
        options: field.options,
        sort_order: field.sort_order,
      })));

    if (fieldsError) throw new Error(fieldsError.message);
  }

  return event.id as string;
}

function saveDraftToDemoStore(draft: EventDraft, organizerId: string) {
  const event = store.createEvent({
    organizer_id: organizerId,
    title: draft.title.trim(),
    slug: draft.slug || slugify(draft.title),
    description: draft.description,
    category: draft.category || 'General',
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
  return event.id;
}

function canFallbackToDemoSave(err: unknown) {
  const message = err instanceof Error ? err.message.toLowerCase() : '';
  return (
    message.includes('auth session missing') ||
    message.includes('requires a real supabase auth organizer session') ||
    message.includes('jwt') ||
    message.includes('row-level security') ||
    message.includes('violates row-level security')
  );
}

export default function AICreateEvent() {
  const navigate = useNavigate();
  const user = store.getCurrentUser();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const pendingPrompt = localStorage.getItem(AI_PROMPT_KEY);
    if (pendingPrompt) {
      setPrompt(pendingPrompt);
      void generateDraft(pendingPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const outputItems = useMemo(() => [
    { icon: ClipboardList, label: 'Registration form generated' },
    { icon: CheckCircle2, label: 'Approval flow enabled' },
    { icon: QrCode, label: 'QR check-in ready' },
    { icon: Users, label: 'Volunteer roles suggested' },
    { icon: Handshake, label: 'Sponsor packages suggested' },
    { icon: Calendar, label: 'Certificate setup prepared' },
  ], []);

  const generateDraft = async (promptOverride = prompt) => {
    setError('');
    const promptToGenerate = promptOverride.trim();
    if (!promptToGenerate) {
      setError('Describe the event you want to create.');
      return;
    }
    setLoading(true);
    try {
      const nextDraft = await generateDraftFromGroq(promptToGenerate);
      setDraft(nextDraft);
    } catch (err) {
      setDraft(null);
      setError(err instanceof Error ? err.message : 'AI event generation is not configured or failed. Please try manual event creation.');
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => {
    setDraft(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const handleCreate = async () => {
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

    setSaving(true);
    try {
      const eventId = await saveDraftToSupabase(draft);
      localStorage.removeItem(AI_PROMPT_KEY);
      navigate(`/dashboard/organizer/events/${eventId}`);
    } catch (err) {
      if (canFallbackToDemoSave(err)) {
        const eventId = saveDraftToDemoStore(draft, user.id);
        localStorage.removeItem(AI_PROMPT_KEY);
        navigate(`/dashboard/organizer/events/${eventId}`);
        return;
      }
      setError(err instanceof Error ? err.message : 'Event creation failed.');
    } finally {
      setSaving(false);
    }
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
              <p className="text-xs text-[#5E6256]">Groq runs securely through a Supabase Edge Function. No Groq key is exposed in Vite.</p>
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
            <button onClick={() => void generateDraft()} disabled={loading} className="gold-btn text-sm disabled:opacity-60 flex items-center gap-2">
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
                    <p><span className="text-[#E49B3A]">Volunteer role suggestions:</span> {draft.volunteerRoles.length ? draft.volunteerRoles.map(role => role.role_name).join(', ') : 'No volunteer roles suggested'}</p>
                    <p><span className="text-[#E49B3A]">Sponsor package suggestions:</span> {draft.sponsorPackages.length ? draft.sponsorPackages.map(pkg => pkg.title).join(', ') : 'No sponsor packages suggested'}</p>
                    <p><span className="text-[#E49B3A]">Budget categories:</span> {draft.budgetCategories.length ? draft.budgetCategories.map(item => `${item.type}: ${item.title}`).join(', ') : 'No budget categories suggested'}</p>
                    <p><span className="text-[#E49B3A]">Certificate:</span> {draft.certificateSetup}</p>
                    <p className="text-[11px] text-white/35">Suggestions are shown for review and are not saved automatically.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap gap-3">
                <button onClick={() => void handleCreate()} disabled={saving} className="gold-btn text-sm disabled:opacity-60">
                  {saving ? 'Creating Event...' : 'Create Event'}
                </button>
                <button onClick={() => void generateDraft()} className="ghost-btn rounded-full text-sm">Regenerate</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

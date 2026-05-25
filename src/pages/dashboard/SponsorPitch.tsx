import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { Wand2, Copy, Check } from 'lucide-react';

export default function SponsorPitch() {
  const events = store.getPublishedEvents();
  const [eventId, setEventId] = useState('');
  const [sponsorType, setSponsorType] = useState('');
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [generated, setGenerated] = useState<{ email: string; whatsapp: string; proposal: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generatePitch = () => {
    const event = store.getEventById(eventId);
    if (!event) return;

    const emailPitch = `Subject: Sponsorship Opportunity - ${event.title}

Dear ${contactName || `${company} Team`},

I am writing to invite ${company || 'your company'} to partner with us as a sponsor for ${event.title}, taking place on ${event.date} at ${event.venue}, ${event.city}.

Event Overview:
${event.description}

Why Partner With Us:
- Target audience aligns with ${sponsorType || 'your industry'}
- Direct engagement with ${event.city} community
- Brand visibility across all event materials

Sponsorship Benefits:
- Logo placement on event posters and digital certificates
- Booth space at the venue
- Speaking opportunity during the event
- Access to participant database (with consent)

We would love to discuss how we can create a meaningful partnership. Please let us know your availability for a quick call.

Best regards,
Event Organizer`;

    const whatsappPitch = `Hi ${contactName || 'there'}! This is regarding ${event.title} happening on ${event.date} at ${event.venue}, ${event.city}. We're looking for sponsors like ${company || 'yours'} and think it would be a great fit. Would you be interested in a quick chat?`;

    const proposal = `${event.title} - Sponsorship Proposal

Event: ${event.title}
Date: ${event.date}
Venue: ${event.venue}, ${event.city}
Expected Participants: ${event.max_participants}

Sponsorship Tiers:
- Platinum (Rs.1,00,000): Title sponsor, keynote slot, VIP booth
- Gold (Rs.50,000): Logo on materials, booth space, shoutout
- Silver (Rs.25,000): Digital presence, social media mention

Contact us to discuss a customized package.`;

    setGenerated({ email: emailPitch, whatsapp: whatsappPitch, proposal });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout title="AI Sponsor Pitch Generator">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Select Event</label>
            <select value={eventId} onChange={e => setEventId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50">
              <option value="" className="bg-[#1a1a1a]">Choose an event</option>
              {events.map(e => <option key={e.id} value={e.id} className="bg-[#1a1a1a]">{e.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Sponsor Type / Industry</label>
            <input value={sponsorType} onChange={e => setSponsorType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50"
              placeholder="e.g. Technology, Education" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Target Company</label>
            <input value={company} onChange={e => setCompany(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50"
              placeholder="e.g. CloudTech Corp" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Contact Name (optional)</label>
            <input value={contactName} onChange={e => setContactName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50"
              placeholder="e.g. John Smith" />
          </div>
          <button onClick={generatePitch} className="gold-btn w-full flex items-center justify-center gap-2">
            <Wand2 className="w-4 h-4" /> Generate Pitch
          </button>
        </div>

        <div>
          {generated && (
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Pitch', content: generated.email },
                { key: 'whatsapp', label: 'WhatsApp Pitch', content: generated.whatsapp },
                { key: 'proposal', label: 'Sponsorship Proposal', content: generated.proposal },
              ].map(({ key, label, content }) => (
                <div key={key} className="glass-card rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-white">{label}</p>
                    <button onClick={() => copyToClipboard(content, key)} className="text-[10px] flex items-center gap-1 text-white/30 hover:text-[#E49B3A] transition-colors">
                      {copied === key ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="text-[11px] text-white/50 whitespace-pre-wrap bg-white/[0.02] rounded p-3 max-h-32 overflow-y-auto">{content}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

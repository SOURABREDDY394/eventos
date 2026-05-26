import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { ArrowRight, Award, Bot, CalendarDays, CheckCircle2, ClipboardCheck, FileText, QrCode, ShieldCheck, Sparkles, Ticket, Users } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import store from '@/data/store';
import { useAuth } from '@/hooks/useAuth';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const defaultPrompt = 'Create a 100-seat AI workshop in Hyderabad with registration approval, volunteers, QR check-in, and certificates';
const AI_PROMPT_KEY = 'eventos_ai_prompt';

const featurePills = [
  'Event draft in seconds',
  'Approval-based applications',
  'QR tickets after approval',
  'Volunteer support',
  'Sponsor packages',
];

const moduleStrip = [
  'AI Create Event',
  'Registration Form',
  'Applications',
  'QR Check-in',
  'Certificates',
  'Proof Passport',
  'Volunteers',
  'Sponsors',
  'Budget',
];

export default function Home() {
  const navigate = useNavigate();
  const { user, continueAs } = useAuth();
  const [prompt, setPrompt] = useState(defaultPrompt);
  useScrollReveal();
  const events = store.getEvents();
  const registrations = store.getRegistrations();
  const certificates = store.getCertificates();
  const proofRecords = store.getPassportRecords();
  const volunteerTasks = store.getVolunteerTasks();
  const sponsorInterests = store.getSponsorInterests();

  const liveData = [
    { label: 'EVENTS', value: events.length, tone: 'bg-[#EDF7EC] text-[#53710C]' },
    { label: 'APPLICATIONS', value: registrations.length, tone: 'bg-[#F7F7D9] text-[#5D6710]' },
    { label: 'PROOF RECORDS', value: proofRecords.length, tone: 'bg-[#EAF1FF] text-[#315B92]' },
    { label: 'CERTIFICATES', value: certificates.length, tone: 'bg-[#FFF4DE] text-[#A06D11]' },
    { label: 'VOLUNTEER TASKS', value: volunteerTasks.length, tone: 'bg-[#F4EEFF] text-[#7053A6]' },
    { label: 'SPONSOR LEADS', value: sponsorInterests.length, tone: 'bg-[#FFEDEC] text-[#A84939]' },
  ];

  const productCards = [
    {
      icon: Bot,
      title: 'AI Create Event',
      text: 'Organizer describes the event. EventOS prepares title, description, date, form fields, approval flow, volunteer roles, and certificate setup.',
      stats: ['Prompt to draft', 'Editable setup', 'Publish event'],
    },
    {
      icon: Ticket,
      title: 'Browse & Apply',
      text: 'Participants browse upcoming published events, open details, fill the organizer-created form, and wait for approval.',
      stats: ['Browse events', 'Submit form', 'Pending status'],
    },
    {
      icon: ClipboardCheck,
      title: 'Approve & Check In',
      text: 'Organizers review applications. QR tickets appear only after approval, and attendance works from approved registrations.',
      stats: ['Approve', 'QR ticket', 'Attendance'],
    },
    {
      icon: ShieldCheck,
      title: 'Verified Proof',
      text: 'Attendance, certificates, and volunteer contributions become public Proof Passport records.',
      stats: ['Certificates', 'Volunteer hours', 'Public proof'],
    },
  ];

  const startCreating = () => {
    localStorage.setItem(AI_PROMPT_KEY, prompt.trim() || defaultPrompt);
    if (!user || user.role !== 'organizer') continueAs('organizer');
    navigate('/dashboard/organizer/create-with-ai');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F1] text-[#14150F] overflow-hidden">
      <Navbar />

      <main className="pt-28">
        <section className="max-w-[88rem] mx-auto px-4 sm:px-6 pb-10 text-center">
          <div className="flex justify-center mb-7" data-scroll-reveal="zoom">
            <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-[#D8DEC4] bg-white/80 px-4 py-2 shadow-sm">
              <span className="w-8 h-8 rounded-full bg-[#EEF5D9] text-[#5C7415] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="min-w-0 text-center text-sm font-semibold leading-5 text-[#53620F]">
                <span className="sm:hidden">Create events from a prompt</span>
                <span className="hidden sm:inline">Create and manage events from a prompt</span>
              </span>
            </div>
          </div>

          <h1 className="mx-auto max-w-5xl text-3xl sm:text-6xl lg:text-7xl leading-[0.98] sm:leading-[0.94] font-black tracking-0 px-1" data-scroll-reveal="clip">
            <span className="block sm:hidden">CREATE</span>
            <span className="block sm:hidden">EVENTS</span>
            <span className="block sm:hidden">FROM A</span>
            <span className="block sm:hidden">PROMPT</span>
            <span className="hidden sm:block">CREATE EVENTS FROM A PROMPT</span>
            <span className="block text-[#5C7415]">...AND TURN</span>
            <span className="block sm:hidden text-[#5C7415]">APPROVALS</span>
            <span className="block sm:hidden text-[#5C7415]">INTO</span>
            <span className="block sm:hidden text-[#5C7415]">VERIFIED</span>
            <span className="block sm:hidden text-[#5C7415]">PROOF</span>
            <span className="hidden sm:block text-[#5C7415]">APPROVALS INTO</span>
            <span className="hidden sm:block text-[#5C7415]">VERIFIED PROOF</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[22rem] sm:max-w-4xl px-2 text-base sm:text-lg leading-8 text-[#4B4D43] italic" data-scroll-reveal="hinge">
            “EventOS helps organizers create event drafts, collect applications, approve attendees, issue QR tickets,
            mark attendance, and publish certificates into Proof Passports.”
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 motion-perspective" data-scroll-reveal="lift">
            {[
              { icon: CalendarDays, label: 'Event draft' },
              { icon: FileText, label: 'Registration form' },
              { icon: QrCode, label: 'QR check-in' },
              { icon: Award, label: 'Certificates' },
            ].map(item => (
              <div key={item.label} className="motion-depth-card flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm border border-[#E6E2D4]">
                <item.icon className="w-4 h-4 text-[#5C7415]" />
                <span className="text-sm font-semibold text-[#424638]">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="relative mx-auto mt-10 max-w-6xl" data-scroll-reveal="tilt">
            <div className="absolute inset-0 translate-y-4 rounded-[2.2rem] bg-[#DCE7BD] blur-2xl opacity-55" />
            <div className="goavo-prompt-glow relative flex items-center gap-4 rounded-[2rem] bg-white p-4 sm:p-5 shadow-[0_22px_55px_rgba(61,72,25,0.14)] border border-[#EEE9DE] overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-[#F1F6E1] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#5C7415]" />
              </div>
              <input
                value={prompt}
                onChange={event => setPrompt(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') startCreating();
                }}
                className="flex-1 min-w-0 bg-transparent text-left text-sm sm:text-base text-[#575B4F] placeholder:text-[#9AA08D] focus:outline-none"
                placeholder="Describe your event..."
                aria-label="Describe your event"
              />
              <button
                onClick={startCreating}
                className="w-14 h-14 rounded-full bg-[#52670F] text-white flex items-center justify-center hover:bg-[#40510C] transition-colors flex-shrink-0"
                aria-label="Start Creating Event"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3" data-scroll-reveal="stack">
            {featurePills.map(item => (
              <span key={item} className="rounded-full border border-[#BBDBC5] bg-[#F1FFF5] px-4 py-2 text-sm font-medium text-[#147142]">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="max-w-[88rem] mx-auto px-4 sm:px-6 py-8" data-scroll-reveal="hinge">
          <div className="flex justify-center mb-5" data-scroll-reveal="clip">
            <span className="rounded-full border border-[#E1DEC9] bg-[#F1F0E2] px-7 py-3 text-xs font-bold tracking-[0.22em] text-[#707246]">
              REALTIME EVENTOS DATA
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveData.map((item, index) => (
              <div key={item.label} className={`motion-depth-card rounded-2xl border border-black/10 p-8 text-center min-h-32 shadow-sm ${item.tone}`} data-scroll-reveal={index % 2 === 0 ? 'stack' : 'stack-right'}>
                <p className="text-xs font-black tracking-[0.18em]">{item.label}</p>
                <p className="mt-4 text-4xl font-black tracking-wide">{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8 overflow-hidden" data-scroll-reveal="skew">
          <p className="text-center text-xs font-black tracking-[0.22em] text-[#5B650E] mb-5">EVENTOS PRODUCT MODULES</p>
          <div className="relative flex gap-5 whitespace-nowrap">
            <div className="flex min-w-full animate-marquee gap-5">
              {[...moduleStrip, ...moduleStrip].map((item, index) => (
                <span key={`${item}-${index}`} className="min-w-44 rounded-xl bg-white border border-[#E5E0D1] px-5 py-4 text-center text-sm font-bold text-[#46520F] shadow-sm">
                  {item}
                </span>
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F9F8F1] to-transparent" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F9F8F1] to-transparent" />
          </div>
        </section>

        <section className="max-w-[88rem] mx-auto px-4 sm:px-6 py-12" data-scroll-reveal="lift">
          <div className="text-center mb-8" data-scroll-reveal="clip">
            <p className="text-sm font-bold text-[#6D7718]">PROOF IN ACTION</p>
            <h2 className="mt-2 text-4xl sm:text-5xl font-black tracking-0">The core EventOS flow</h2>
            <p className="mt-3 text-[#5F6256]">No random modules at the center. Organizer creates, participant applies, organizer approves, proof is verified.</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-5">
            {productCards.map((card, index) => (
              <article key={card.title} className="goavo-card-effect motion-depth-card rounded-3xl bg-white border border-[#E7E1D2] p-6 shadow-sm" data-scroll-reveal={['tilt', 'hinge', 'tilt-right', 'zoom'][index]}>
                <div className="w-12 h-12 rounded-2xl bg-[#EEF5D9] flex items-center justify-center mb-5">
                  <card.icon className="w-6 h-6 text-[#5C7415]" />
                </div>
                <h3 className="text-xl font-black">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#616456]">{card.text}</p>
                <div className="mt-6 grid grid-cols-1 gap-2">
                  {card.stats.map(stat => (
                    <div key={stat} className="rounded-xl bg-[#F7F6EB] px-3 py-3">
                      <p className="text-xs font-black tracking-wide text-[#5C7415]">{stat.toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-[88rem] mx-auto px-4 sm:px-6 py-12" data-scroll-reveal="zoom">
          <div className="rounded-[2rem] bg-[#10120B] text-white p-6 sm:p-10 overflow-hidden relative motion-perspective">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#D7F06A]/20 blur-3xl" />
            <div className="relative grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
              <div data-scroll-reveal="left">
                <p className="text-sm font-bold text-[#D8F066]">HOW EVENT ORGANIZERS USE IT</p>
                <h2 className="mt-3 text-4xl sm:text-5xl font-black leading-tight">Chat creates the event. Dashboards run the room.</h2>
                <p className="mt-5 text-white/62 leading-7">
                  The AI builder creates the setup. Event management handles forms, applications, attendance, certificates, volunteers,
                  sponsors, and budget without making those supporting modules the whole product.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/login" className="rounded-full bg-[#D8F066] px-6 py-3 text-sm font-black text-[#10120B]">Start Creating</Link>
                  <Link to="/events" className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white">Browse Events</Link>
                </div>
              </div>

              <div className="motion-depth-card rounded-[1.5rem] bg-white text-[#15170F] p-5 shadow-2xl" data-scroll-reveal="tilt-right">
                <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[#5C7415]" />
                    <span className="font-black">EventOS generated setup</span>
                  </div>
                  <span className="rounded-full bg-[#ECF6D6] px-3 py-1 text-xs font-bold text-[#5C7415]">Ready</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {['Event draft created', 'Registration form generated', 'Approval flow enabled', 'Volunteer roles suggested', 'Sponsor packages drafted', 'Certificate workflow ready'].map(item => (
                    <div key={item} className="rounded-xl bg-[#F6F5EC] p-4 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#5C7415]" />
                      <span className="text-sm font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[88rem] mx-auto px-4 sm:px-6 pt-8 pb-16 text-center" data-scroll-reveal="zoom">
          <Users className="w-10 h-10 mx-auto text-[#5C7415] mb-4" />
          <h2 className="text-4xl sm:text-6xl font-black tracking-0">Build your next event from one prompt.</h2>
          <div className="mt-7 flex justify-center gap-3 flex-wrap">
            <Link to="/login" className="rounded-full bg-[#52670F] px-7 py-3 text-sm font-black text-white">Start Creating</Link>
            <Link to="/events" className="rounded-full border border-[#CBD4A9] bg-white px-7 py-3 text-sm font-black text-[#52670F]">Browse Events</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

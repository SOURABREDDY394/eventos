import { useNavigate } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EventPoster } from '@/components/EventPoster';
import store from '@/data/store';
import { eventStatusBadgeClass, getEventDisplayStatus, isUpcomingEvent, sortUpcomingEvents } from '@/lib/eventLifecycle';
import { ArrowRight, Award, Bot, Calendar, CheckCircle2, ClipboardList, Handshake, QrCode, Sparkles, Users, UserCheck, Wallet, Trophy } from 'lucide-react';

function progressPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}
export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const user = store.getCurrentUser();
  const events = user ? store.getOrganizerEvents(user.id) : [];
  const stats = user ? store.getOrganizerStats(user.id) : { totalEvents: 0, totalRegistrations: 0, totalAttendance: 0, totalVolunteers: 0, totalSponsorLeads: 0, totalCertificates: 0, budgetBalance: 0 };
  const activeOrganizerEvents = sortUpcomingEvents(events.filter(event => event.status === 'published' && isUpcomingEvent(event.date)));
  const otherOrganizerEvents = events.filter(event => !(event.status === 'published' && isUpcomingEvent(event.date)));
  const organizerEventList = [...activeOrganizerEvents, ...otherOrganizerEvents];
  const eventIds = events.map(event => event.id);
  const registrations = store.getRegistrations().filter(reg => eventIds.includes(reg.event_id));
  const pendingRegs = registrations.filter(reg => reg.status === 'pending');
  const approvedRegs = registrations.filter(reg => reg.status === 'approved');
  const attendedRegs = registrations.filter(reg => reg.status === 'attended');
  const volunteerApps = store.getVolunteerApplications().filter(app => eventIds.includes(app.event_id));
  const approvedVolunteers = volunteerApps.filter(app => app.status === 'approved');
  const volunteerTasks = store.getVolunteerTasks().filter(task => eventIds.includes(task.event_id));
  const completedTasks = volunteerTasks.filter(task => task.status === 'completed');
  const sponsorLeads = store.getSponsorInterests().filter(interest => eventIds.includes(interest.event_id));
  const budgetItems = events.flatMap(event => store.getEventBudgetItems(event.id));
  const income = budgetItems.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenses = budgetItems.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);

  const statCards = [
    { icon: Calendar, label: 'Events', value: stats.totalEvents, tone: 'from-[#EFFBDD] to-[#FFFFFF] text-[#53710C]', accent: '#9CBD38' },
    { icon: Users, label: 'Applications', value: registrations.length, tone: 'from-[#FBF9DC] to-[#FFFFFF] text-[#5D6710]', accent: '#D7C944' },
    { icon: UserCheck, label: 'Approved', value: approvedRegs.length, tone: 'from-[#EAF5FF] to-[#FFFFFF] text-[#315B92]', accent: '#75B4F4' },
    { icon: QrCode, label: 'Checked In', value: attendedRegs.length, tone: 'from-[#E9FFF1] to-[#FFFFFF] text-[#147142]', accent: '#61D98E' },
    { icon: Handshake, label: 'Sponsor Leads', value: sponsorLeads.length, tone: 'from-[#FFF0DF] to-[#FFFFFF] text-[#A86617]', accent: '#E7A64C' },
    { icon: Award, label: 'Certificates', value: stats.totalCertificates, tone: 'from-[#FFF5DE] to-[#FFFFFF] text-[#A06D11]', accent: '#F0B84D' },
    { icon: Wallet, label: 'Balance', value: `Rs.${stats.budgetBalance.toLocaleString()}`, tone: stats.budgetBalance >= 0 ? 'from-[#ECF8D5] to-[#FFFFFF] text-[#53710C]' : 'from-[#FFEDEC] to-[#FFFFFF] text-[#A84939]', accent: stats.budgetBalance >= 0 ? '#8FB728' : '#E36B61' },
  ];

  const workspaceOptions = [
    { icon: Bot, title: 'AI Create Event', text: 'Create an event from a prompt.', path: '/dashboard/organizer/create-with-ai' },
    { icon: Calendar, title: 'My Events', text: 'Open event rooms, forms, and approvals.', path: '/dashboard/organizer/events' },
    { icon: Users, title: 'Volunteers', text: `${volunteerApps.length} applications, ${approvedVolunteers.length} approved.`, path: '/dashboard/organizer/volunteers' },
    { icon: Handshake, title: 'Sponsors', text: `${sponsorLeads.length} sponsor leads across events.`, path: '/dashboard/organizer/sponsors' },
    { icon: Wallet, title: 'Budget', text: `Income Rs.${income.toLocaleString()} - Expenses Rs.${expenses.toLocaleString()}`, path: '/dashboard/organizer/budget' },
    { icon: Trophy, title: 'Leaderboard', text: 'Volunteer ranks, points, and badges.', path: '/dashboard/organizer/leaderboard' },
  ];

  const eventOperations = organizerEventList.map(event => {
    const eventRegs = store.getEventRegistrations(event.id);
    const eventVolunteerApps = store.getEventVolunteerApplications(event.id);
    const eventTasks = store.getEventVolunteerTasks(event.id);
    const eventSponsors = store.getEventSponsorInterests(event.id);
    const eventBudget = store.getEventBudgetItems(event.id);
    const eventIncome = eventBudget.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const eventExpenses = eventBudget.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);

    return {
      event,
      regs: eventRegs,
      pending: eventRegs.filter(reg => reg.status === 'pending').length,
      approved: eventRegs.filter(reg => reg.status === 'approved').length,
      attended: eventRegs.filter(reg => reg.status === 'attended').length,
      volunteerApps: eventVolunteerApps.length,
      approvedVolunteers: eventVolunteerApps.filter(app => app.status === 'approved').length,
      tasks: eventTasks.length,
      completedTasks: eventTasks.filter(task => task.status === 'completed').length,
      sponsorLeads: eventSponsors.length,
      certificates: store.getEventCertificates(event.id).length,
      budgetBalance: eventIncome - eventExpenses,
    };
  });

  return (
    <DashboardLayout title="Organizer Command Center">
      <div className="organizer-liveops-page">
      <div className="organizer-command-grid grid xl:grid-cols-[1.1fr_0.9fr] gap-5 mb-6">
        <button
          onClick={() => navigate('/dashboard/organizer/create-with-ai')}
          className="organizer-ai-orb group relative overflow-hidden rounded-[2rem] border border-[#D7E8A7] bg-[#F0F8D9] p-6 sm:p-7 text-left text-[#14150F] shadow-[0_24px_70px_rgba(82,103,15,0.14)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(216,240,102,0.72),transparent_18rem),radial-gradient(circle_at_10%_86%,rgba(244,196,103,0.22),transparent_16rem),linear-gradient(135deg,rgba(255,255,255,0.78),rgba(236,246,214,0.68))]" />
          <div className="absolute inset-0 opacity-[0.24] [background-image:linear-gradient(rgba(82,103,15,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(82,103,15,0.14)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute right-6 top-6 rounded-full border border-[#CFE2A1] bg-white/70 px-3 py-1 text-[0.65rem] font-black tracking-[0.18em] text-[#52670F] shadow-sm">
            MAIN ACTION
          </div>
          <div className="relative max-w-xl">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#52670F] text-white shadow-[0_14px_34px_rgba(82,103,15,0.25)]">
              <Bot className="h-6 w-6" />
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl font-black leading-tight">Create your next event from one prompt.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5E6256]">
              Generate an editable event draft, registration form, volunteer roles, sponsor setup, budget categories, and certificate workflow.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#52670F] px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(82,103,15,0.22)] transition-transform group-hover:translate-x-1">
              Open AI builder <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </button>

        <div className="grid sm:grid-cols-2 gap-3">
          {workspaceOptions.slice(1).map((option, index) => (
            <button
              key={option.path}
              onClick={() => navigate(option.path)}
              className={`organizer-module-card group relative overflow-hidden rounded-[1.55rem] border p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(35,40,20,0.10)] ${index === 4 ? 'sm:col-span-2' : ''} ${
                index % 2 === 0
                  ? 'border-[#DDE5C6] bg-[#F8FBEF]'
                  : 'border-[#E8DFCA] bg-[#FFF9EA]'
              }`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#D8F066]/20 blur-xl transition-transform group-hover:scale-125" />
              <div className="relative">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#52670F] shadow-sm">
                  <option.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-black text-[#14150F]">{option.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#5E6256]">{option.text}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="organizer-stat-ribbon grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className={`organizer-stat-card relative overflow-hidden rounded-[1.35rem] border border-[#E0E7CC] bg-gradient-to-br ${card.tone} p-4 shadow-[0_12px_30px_rgba(82,103,15,0.07)]`}>
            <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/60 blur-lg" />
            <div className="absolute inset-x-4 bottom-0 h-1 rounded-full" style={{ backgroundColor: card.accent }} />
            <span className="relative mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm">
              <card.icon className="w-5 h-5" />
            </span>
            <p className="relative text-xl font-black">{card.value}</p>
            <p className="relative text-[10px] font-black tracking-wide uppercase">{card.label}</p>
          </div>
        ))}
      </div>

      <section className="organizer-ops-grid grid xl:grid-cols-[1fr_0.92fr] gap-5 mb-8">
        <div className="organizer-pipeline-panel relative overflow-hidden rounded-[2rem] bg-white border border-[#E7E1D2] p-6 shadow-[0_22px_55px_rgba(35,40,20,0.08)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D8F066] via-[#F4C467] to-[#9AC24B]" />
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#EEF5D9] blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.22em] text-[#6A7D1A] uppercase">Participant pipeline</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#14150F] mt-2">Applications are the heartbeat.</h2>
            </div>
            <span className="hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF5D9] text-[#52670F]">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <div className="relative mt-7 space-y-5">
            {[
              { label: 'Pending review', value: pendingRegs.length, total: registrations.length, color: 'bg-[#F4C467]' },
              { label: 'Approved tickets', value: approvedRegs.length, total: registrations.length, color: 'bg-[#91C6FF]' },
              { label: 'Attendance verified', value: attendedRegs.length, total: registrations.length, color: 'bg-[#6FE3A0]' },
            ].map(row => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-black text-[#14150F]">{row.label}</span>
                  <span className="rounded-full bg-[#F7F6EB] px-3 py-1 text-xs font-bold text-[#5E6256]">{row.value} / {row.total}</span>
                </div>
                <div className="h-4 rounded-full bg-[#F0EFE4] overflow-hidden border border-[#E8E2D2]">
                  <div className={`h-full rounded-full ${row.color} shadow-[0_0_18px_rgba(82,103,15,0.12)]`} style={{ width: `${progressPercent(row.value, row.total)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="organizer-support-panel relative overflow-hidden rounded-[2rem] bg-[#F7F6EB] border border-[#E7E1D2] p-6 shadow-[0_22px_55px_rgba(35,40,20,0.08)]">
          <div className="absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-[#D8F066]/30 blur-3xl" />
          <p className="relative text-xs font-black tracking-[0.22em] text-[#6A7D1A] uppercase">Support layers</p>
          <h2 className="relative text-2xl sm:text-3xl font-black text-[#14150F] mt-2">Volunteers, sponsors, and budget are visible.</h2>
          <div className="relative grid sm:grid-cols-3 xl:grid-cols-1 gap-3 mt-6">
            <div className="rounded-2xl bg-white border border-[#E7E1D2] p-4 flex items-center gap-4">
              <span className="h-12 w-12 rounded-2xl bg-[#EEF5D9] text-[#52670F] flex items-center justify-center"><Users className="w-5 h-5" /></span>
              <div><p className="text-2xl font-black">{approvedVolunteers.length}</p><p className="text-xs text-[#5E6256]">approved volunteers</p></div>
            </div>
            <div className="rounded-2xl bg-white border border-[#E7E1D2] p-4 flex items-center gap-4">
              <span className="h-12 w-12 rounded-2xl bg-[#EEF5D9] text-[#52670F] flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></span>
              <div><p className="text-2xl font-black">{completedTasks.length}</p><p className="text-xs text-[#5E6256]">completed tasks</p></div>
            </div>
            <div className="rounded-2xl bg-white border border-[#E7E1D2] p-4 flex items-center gap-4">
              <span className="h-12 w-12 rounded-2xl bg-[#EEF5D9] text-[#52670F] flex items-center justify-center"><Wallet className="w-5 h-5" /></span>
              <div><p className="text-2xl font-black">Rs.{stats.budgetBalance.toLocaleString()}</p><p className="text-xs text-[#5E6256]">budget balance</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="organizer-events-section">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-[#6A7D1A] uppercase">Running events</p>
            <h2 className="text-3xl font-black text-[#14150F]">Event operations</h2>
          </div>
          <button onClick={() => navigate('/dashboard/organizer/events')} className="rounded-full border border-[#CBD4A9] bg-white px-4 py-2 text-xs font-black text-[#52670F] shadow-sm hover:bg-[#EEF5D9]">
            View all events
          </button>
        </div>

        {eventOperations.length === 0 ? (
          <div className="glass-card rounded-[2rem] p-8 text-center">
            <ClipboardList className="w-12 h-12 text-[#52670F]/30 mx-auto mb-3" />
            <p className="text-sm text-[#5E6256] mb-4">No upcoming published events yet. Create one to see registrations, volunteers, sponsors, budget, and certificates here.</p>
            <button onClick={() => navigate('/dashboard/organizer/create-with-ai')} className="gold-btn text-sm">Create with AI</button>
          </div>
        ) : (
          <div className="grid xl:grid-cols-2 gap-5">
            {eventOperations.map(row => (
              <article key={row.event.id} className="organizer-event-card group relative overflow-hidden rounded-[2rem] border border-[#DDE8BE] bg-[#FBFFF1] p-5 shadow-[0_22px_55px_rgba(82,103,15,0.10)] transition-all hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(82,103,15,0.16)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(216,240,102,0.38),transparent_15rem),linear-gradient(135deg,rgba(255,255,255,0.82),rgba(244,249,225,0.62))]" />
                <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(82,103,15,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(82,103,15,0.13)_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="relative flex gap-4">
                  <EventPoster event={row.event} variant="thumb" className="w-20 h-20 rounded-[1.35rem] flex-shrink-0 shadow-[0_14px_34px_rgba(82,103,15,0.14)]" />
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${eventStatusBadgeClass(getEventDisplayStatus(row.event))}`}>{getEventDisplayStatus(row.event)}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EEF5D9] text-[#52670F] font-bold">{row.event.category}</span>
                    </div>
                    <h3 className="text-xl font-black text-[#14150F] truncate">{row.event.title}</h3>
                    <p className="text-xs text-[#5E6256]">{row.event.date} - {row.event.city || row.event.venue || 'Venue pending'}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/organizer/events/${row.event.id}`)}
                    className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#52670F] text-[#FFFDF4] shadow-[0_12px_28px_rgba(82,103,15,0.20)] transition-transform group-hover:translate-x-1"
                    aria-label={`Open ${row.event.title}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
                  {[
                    { label: 'Pending', value: row.pending },
                    { label: 'Approved', value: row.approved },
                    { label: 'Attended', value: row.attended },
                    { label: 'Volunteers', value: `${row.approvedVolunteers}/${row.volunteerApps}` },
                    { label: 'Tasks', value: `${row.completedTasks}/${row.tasks}` },
                    { label: 'Sponsors', value: row.sponsorLeads },
                    { label: 'Certs', value: row.certificates },
                    { label: 'Budget', value: `Rs.${row.budgetBalance.toLocaleString()}` },
                  ].map(metric => (
                    <div key={metric.label} className="rounded-2xl bg-white/72 border border-[#E0E7CC] p-3 shadow-sm">
                      <p className="text-base font-black text-[#14150F]">{metric.value}</p>
                      <p className="text-[10px] text-[#5E6256]">{metric.label}</p>
                    </div>
                  ))}
                </div>

                <div className="relative flex flex-wrap gap-2 mt-5 border-t border-[#DDE8BE] pt-4">
                  {[
                    { label: 'Applications', path: 'registrations' },
                    { label: 'Attendance', path: 'attendance' },
                    { label: 'Volunteers', path: 'volunteers' },
                    { label: 'Sponsors', path: 'sponsors' },
                    { label: 'Budget', path: 'budget' },
                    { label: 'Certificates', path: 'certificates' },
                  ].map(action => (
                    <button
                      key={action.path}
                      onClick={() => navigate(`/dashboard/organizer/events/${row.event.id}/${action.path}`)}
                      className="rounded-full border border-[#CBD4A9] bg-white/82 px-3 py-1.5 text-xs font-black text-[#52670F] shadow-sm hover:bg-[#EEF5D9]"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      </div>
    </DashboardLayout>
  );
}

import { useNavigate } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EventPoster } from '@/components/EventPoster';
import store from '@/data/store';
import { eventStatusBadgeClass, getEventDisplayStatus, isUpcomingEvent, sortUpcomingEvents } from '@/lib/eventLifecycle';
import { Award, Bot, Calendar, CheckCircle2, ClipboardList, Handshake, QrCode, Users, UserCheck, Wallet } from 'lucide-react';

function progressPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const user = store.getCurrentUser();
  const events = user ? store.getOrganizerEvents(user.id) : [];
  const stats = user ? store.getOrganizerStats(user.id) : { totalEvents: 0, totalRegistrations: 0, totalAttendance: 0, totalVolunteers: 0, totalSponsorLeads: 0, totalCertificates: 0, budgetBalance: 0 };
  const recentEvents = sortUpcomingEvents(events.filter(event => event.status === 'published' && isUpcomingEvent(event.date))).slice(0, 4);
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
    { icon: Calendar, label: 'Events', value: stats.totalEvents, tone: 'bg-[#EDF7EC] text-[#53710C]' },
    { icon: Users, label: 'Applications', value: registrations.length, tone: 'bg-[#F7F7D9] text-[#5D6710]' },
    { icon: UserCheck, label: 'Approved', value: approvedRegs.length, tone: 'bg-[#EAF1FF] text-[#315B92]' },
    { icon: QrCode, label: 'Checked In', value: attendedRegs.length, tone: 'bg-[#F1FFF5] text-[#147142]' },
    { icon: Handshake, label: 'Sponsor Leads', value: sponsorLeads.length, tone: 'bg-[#FFEDEC] text-[#A84939]' },
    { icon: Award, label: 'Certificates', value: stats.totalCertificates, tone: 'bg-[#FFF4DE] text-[#A06D11]' },
    { icon: Wallet, label: 'Balance', value: `Rs.${stats.budgetBalance.toLocaleString()}`, tone: stats.budgetBalance >= 0 ? 'bg-[#ECF6D6] text-[#53710C]' : 'bg-[#FFEDEC] text-[#A84939]' },
  ];

  const workspaceOptions = [
    { icon: Bot, title: 'AI Create Event', text: 'Create an event from a prompt.', path: '/dashboard/organizer/create-with-ai' },
    { icon: Calendar, title: 'My Events', text: 'Open event rooms, forms, and approvals.', path: '/dashboard/organizer/events' },
    { icon: Users, title: 'Volunteers', text: `${volunteerApps.length} applications, ${approvedVolunteers.length} approved.`, path: '/dashboard/organizer/volunteers' },
    { icon: Handshake, title: 'Sponsors', text: `${sponsorLeads.length} sponsor leads across events.`, path: '/dashboard/organizer/sponsors' },
    { icon: Wallet, title: 'Budget', text: `Income Rs.${income.toLocaleString()} · Expenses Rs.${expenses.toLocaleString()}`, path: '/dashboard/organizer/budget' },
  ];

  const eventOperations = recentEvents.map(event => {
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
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {workspaceOptions.map((option) => (
          <button key={option.path} onClick={() => navigate(option.path)} className="goavo-card-effect glass-card rounded-3xl p-5 text-left">
            <option.icon className="w-6 h-6 text-[#52670F] mb-4" />
            <h3 className="text-base font-black text-[#14150F]">{option.title}</h3>
            <p className="text-xs text-[#5E6256] leading-5 mt-2">{option.text}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-2xl border border-black/10 p-4 shadow-sm ${card.tone}`}>
            <card.icon className="w-5 h-5 mb-3" />
            <p className="text-xl font-black">{card.value}</p>
            <p className="text-[10px] font-black tracking-wide uppercase">{card.label}</p>
          </div>
        ))}
      </div>

      <section className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6 mb-8">
        <div className="glass-card rounded-[2rem] p-6">
          <p className="text-xs font-black tracking-[0.22em] text-[#6A7D1A] uppercase">Participant pipeline</p>
          <h2 className="text-2xl font-black text-[#14150F] mt-2">Applications are the heartbeat.</h2>
          <div className="mt-6 space-y-4">
            {[
              { label: 'Pending review', value: pendingRegs.length, total: registrations.length, color: 'bg-amber-300' },
              { label: 'Approved tickets', value: approvedRegs.length, total: registrations.length, color: 'bg-blue-300' },
              { label: 'Attendance verified', value: attendedRegs.length, total: registrations.length, color: 'bg-emerald-300' },
            ].map(row => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-bold text-[#14150F]">{row.label}</span>
                  <span className="text-[#5E6256]">{row.value} / {row.total}</span>
                </div>
                <div className="h-3 rounded-full bg-[#F0EFE4] overflow-hidden">
                  <div className={`h-full rounded-full ${row.color}`} style={{ width: `${progressPercent(row.value, row.total)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6">
          <p className="text-xs font-black tracking-[0.22em] text-[#6A7D1A] uppercase">Support layers</p>
          <h2 className="text-2xl font-black text-[#14150F] mt-2">Volunteers, sponsors, and budget are visible.</h2>
          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <div className="rounded-2xl bg-[#F7F6EB] border border-[#E7E1D2] p-4">
              <Users className="w-5 h-5 text-[#52670F] mb-3" />
              <p className="text-2xl font-black">{approvedVolunteers.length}</p>
              <p className="text-xs text-[#5E6256]">approved volunteers</p>
            </div>
            <div className="rounded-2xl bg-[#F7F6EB] border border-[#E7E1D2] p-4">
              <CheckCircle2 className="w-5 h-5 text-[#52670F] mb-3" />
              <p className="text-2xl font-black">{completedTasks.length}</p>
              <p className="text-xs text-[#5E6256]">completed tasks</p>
            </div>
            <div className="rounded-2xl bg-[#F7F6EB] border border-[#E7E1D2] p-4">
              <Wallet className="w-5 h-5 text-[#52670F] mb-3" />
              <p className="text-2xl font-black">Rs.{stats.budgetBalance.toLocaleString()}</p>
              <p className="text-xs text-[#5E6256]">budget balance</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-[#6A7D1A] uppercase">Running events</p>
            <h2 className="text-2xl font-black text-[#14150F]">Event operations</h2>
          </div>
          <button onClick={() => navigate('/dashboard/organizer/events')} className="rounded-full border border-[#CBD4A9] bg-white px-4 py-2 text-xs font-black text-[#52670F]">
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
              <article key={row.event.id} className="goavo-card-effect glass-card rounded-[2rem] p-5">
                <div className="flex gap-4">
                  <EventPoster event={row.event} variant="thumb" className="w-16 h-16 rounded-2xl flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${eventStatusBadgeClass(getEventDisplayStatus(row.event))}`}>{getEventDisplayStatus(row.event)}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EEF5D9] text-[#52670F] font-bold">{row.event.category}</span>
                    </div>
                    <h3 className="text-lg font-black text-[#14150F] truncate">{row.event.title}</h3>
                    <p className="text-xs text-[#5E6256]">{row.event.date} · {row.event.city}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5">
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
                    <div key={metric.label} className="rounded-2xl bg-[#F7F6EB] border border-[#E7E1D2] p-3">
                      <p className="text-base font-black text-[#14150F]">{metric.value}</p>
                      <p className="text-[10px] text-[#5E6256]">{metric.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
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
                      className="rounded-full border border-[#CBD4A9] bg-white px-3 py-1.5 text-xs font-black text-[#52670F] hover:bg-[#EEF5D9]"
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
    </DashboardLayout>
  );
}

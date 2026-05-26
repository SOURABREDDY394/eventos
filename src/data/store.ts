import type {
  Profile, Event, Registration, VolunteerApplication, VolunteerTask,
  SponsorPackage, SponsorInterest, BudgetItem, Certificate, PassportRecord, VolunteerRole, EventFormField, Attendance
} from '@/types';
import {
  seedProfiles, seedEvents, seedRegistrations, seedVolunteerApplications,
  seedVolunteerTasks, seedSponsorPackages, seedSponsorInterests,
  seedBudgetItems, seedCertificates, seedPassportRecords, seedVolunteerRoles
} from './seedData';
import { isActivePublishedEvent, isPastEvent, sortPastEvents, sortUpcomingEvents } from '@/lib/eventLifecycle';

const STORAGE_KEYS = {
  profiles: 'eventos_profiles',
  events: 'eventos_events',
  registrations: 'eventos_registrations',
  attendance: 'eventos_attendance',
  eventFormFields: 'eventos_event_form_fields',
  volunteerRoles: 'eventos_volunteer_roles',
  volunteerApplications: 'eventos_volunteer_applications',
  volunteerTasks: 'eventos_volunteer_tasks',
  sponsorPackages: 'eventos_sponsor_packages',
  sponsorInterests: 'eventos_sponsor_interests',
  budgetItems: 'eventos_budget_items',
  certificates: 'eventos_certificates',
  passportRecords: 'eventos_passport_records',
  currentUser: 'eventos_current_user',
};

const DEMO_ROLE_KEY = 'currentRole';
const DEMO_USER_KEY = 'currentUser';

type DemoUser = {
  id: string;
  name: string;
  username: string;
  role: Profile['role'];
};

const DEMO_PROFILES: Profile[] = [
  { id: 'demo-organizer', full_name: 'Event Organizer', username: 'organizer', email: '', role: 'organizer', avatar_url: '', bio: '', passport_slug: 'organizer', created_at: '' },
  { id: 'demo-participant', full_name: 'Sourab Reddy', username: 'sourab', email: '', role: 'participant', avatar_url: '', bio: '', passport_slug: 'sourab', created_at: '' },
  { id: 'demo-volunteer', full_name: 'Volunteer User', username: 'volunteer', email: '', role: 'volunteer', avatar_url: '', bio: '', passport_slug: 'volunteer', created_at: '' },
  { id: 'demo-sponsor', full_name: 'Sponsor Partner', username: 'sponsor', email: '', role: 'sponsor', avatar_url: '', bio: '', passport_slug: 'sponsor', created_at: '' },
];

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function setItem<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function initStore() {
  if (!localStorage.getItem(STORAGE_KEYS.profiles)) {
    setItem(STORAGE_KEYS.profiles, seedProfiles);
    setItem(STORAGE_KEYS.events, seedEvents);
    setItem(STORAGE_KEYS.registrations, seedRegistrations);
    setItem(STORAGE_KEYS.attendance, []);
    setItem(STORAGE_KEYS.eventFormFields, []);
    setItem(STORAGE_KEYS.volunteerRoles, seedVolunteerRoles);
    setItem(STORAGE_KEYS.volunteerApplications, seedVolunteerApplications);
    setItem(STORAGE_KEYS.volunteerTasks, seedVolunteerTasks);
    setItem(STORAGE_KEYS.sponsorPackages, seedSponsorPackages);
    setItem(STORAGE_KEYS.sponsorInterests, seedSponsorInterests);
    setItem(STORAGE_KEYS.budgetItems, seedBudgetItems);
    setItem(STORAGE_KEYS.certificates, seedCertificates);
    setItem(STORAGE_KEYS.passportRecords, seedPassportRecords);
  }
}

initStore();

function genId() { return crypto.randomUUID?.() || Math.random().toString(36).substring(2); }

function generateRegistrationCode() {
  return `EVOS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function defaultFormFields(eventId: string): EventFormField[] {
  const fields: Array<Pick<EventFormField, 'label' | 'field_type' | 'required'>> = [
    { label: 'Full Name', field_type: 'text', required: true },
    { label: 'Email', field_type: 'email', required: true },
    { label: 'Phone Number', field_type: 'phone', required: true },
    { label: 'College / Organization', field_type: 'text', required: true },
    { label: 'Why do you want to attend?', field_type: 'textarea', required: true },
  ];

  return fields.map((field, index) => ({
    id: `default-${eventId}-${index}`,
    event_id: eventId,
    options: [],
    sort_order: index,
    created_at: new Date().toISOString(),
    ...field,
  }));
}

function profileFromDemoUser(user: DemoUser): Profile {
  return {
    id: user.id,
    full_name: user.name,
    username: user.username,
    email: '',
    role: user.role,
    avatar_url: '',
    bio: '',
    passport_slug: user.username,
    created_at: '',
  };
}

function getDemoCurrentUser(): Profile | null {
  try {
    const storedUser = localStorage.getItem(DEMO_USER_KEY);
    const storedRole = localStorage.getItem(DEMO_ROLE_KEY);
    if (!storedUser || !storedRole) return null;

    const parsed = JSON.parse(storedUser) as DemoUser;
    if (!parsed.id || !parsed.name || !parsed.username || parsed.role !== storedRole) return null;
    return profileFromDemoUser(parsed);
  } catch {
    return null;
  }
}

export const store = {
  getCurrentUser(): Profile | null {
    return getDemoCurrentUser();
  },
  setCurrentUser(user: Profile | null) {
    if (!user) {
      localStorage.removeItem(DEMO_ROLE_KEY);
      localStorage.removeItem(DEMO_USER_KEY);
      localStorage.removeItem(STORAGE_KEYS.currentUser);
      return;
    }

    localStorage.setItem(DEMO_ROLE_KEY, user.role);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify({
      id: user.id,
      name: user.full_name,
      username: user.username,
      role: user.role,
    }));
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  },

  // Auth
  signUp(email: string, _password: string, full_name: string, username: string, role: string): Profile {
    void email;
    void _password;
    void full_name;
    void username;
    void role;
    throw new Error('Email signup is disabled. Use the Continue as role screen.');
  },
  signIn(email: string, _password: string): Profile {
    void email;
    void _password;
    throw new Error('Password login is disabled. Use the Continue as role screen.');
  },
  signOut() {
    store.setCurrentUser(null);
  },

  // Profiles
  getProfiles(): Profile[] {
    const profiles = getItem<Profile[]>(STORAGE_KEYS.profiles, []);
    const missingDemoProfiles = DEMO_PROFILES.filter(demo => !profiles.some(profile => profile.id === demo.id));
    return [...profiles, ...missingDemoProfiles];
  },
  getProfileByUsername(username: string): Profile | undefined {
    return store.getProfiles().find(p => p.username === username || p.passport_slug === username);
  },
  getProfileById(id: string): Profile | undefined {
    return store.getProfiles().find(p => p.id === id);
  },

  // Events
  getEvents(): Event[] {
    return getItem<Event[]>(STORAGE_KEYS.events, []);
  },
  getPublishedEvents(): Event[] {
    return sortUpcomingEvents(store.getEvents().filter(isActivePublishedEvent));
  },
  getPastPublishedEvents(): Event[] {
    return sortPastEvents(store.getEvents().filter(e => e.status === 'published' && isPastEvent(e.date)));
  },
  getEventBySlug(slug: string): Event | undefined {
    return store.getEvents().find(e => e.slug === slug);
  },
  getEventById(id: string): Event | undefined {
    return store.getEvents().find(e => e.id === id);
  },
  getOrganizerEvents(organizerId: string): Event[] {
    return store.getEvents().filter(e => e.organizer_id === organizerId);
  },
  createEvent(event: Omit<Event, 'id' | 'created_at'>): Event {
    const events = store.getEvents();
    const newEvent: Event = { ...event, id: genId(), created_at: new Date().toISOString() };
    events.push(newEvent);
    setItem(STORAGE_KEYS.events, events);
    return newEvent;
  },
  upsertEvent(event: Event): Event {
    const events = store.getEvents();
    const idx = events.findIndex(existing => existing.id === event.id);
    if (idx === -1) {
      events.push(event);
    } else {
      events[idx] = { ...events[idx], ...event };
    }
    setItem(STORAGE_KEYS.events, events);
    return event;
  },
  updateEvent(id: string, updates: Partial<Event>): Event | undefined {
    const events = store.getEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return undefined;
    events[idx] = { ...events[idx], ...updates };
    setItem(STORAGE_KEYS.events, events);
    return events[idx];
  },

  // Registrations
  getRegistrations(): Registration[] {
    const registrations = getItem<Registration[]>(STORAGE_KEYS.registrations, []);
    return registrations.map((registration) => ({
      ...registration,
      status: (registration.status as string) === 'registered' ? 'approved' : registration.status,
      form_answers: registration.form_answers || {},
      reviewed_by: registration.reviewed_by || null,
      reviewed_at: registration.reviewed_at || null,
      rejection_reason: registration.rejection_reason || null,
    }));
  },
  getEventRegistrations(eventId: string): Registration[] {
    const regs = store.getRegistrations().filter(r => r.event_id === eventId);
    const profiles = store.getProfiles();
    return regs.map(r => ({ ...r, participant: profiles.find(p => p.id === r.participant_id) }));
  },
  getParticipantRegistrations(participantId: string): Registration[] {
    return store.getRegistrations().filter(r => r.participant_id === participantId);
  },
  getRegistrationByCode(code: string): Registration | undefined {
    return store.getRegistrations().find(r => r.registration_code === code);
  },
  createRegistration(reg: Omit<Registration, 'id' | 'registered_at'>): Registration {
    const regs = store.getRegistrations();
    const exists = regs.find(r => r.event_id === reg.event_id && r.participant_id === reg.participant_id);
    if (exists) throw new Error('Already registered for this event');
    const newReg: Registration = {
      ...reg,
      registration_code: reg.status === 'approved' || reg.status === 'attended' ? reg.registration_code || generateRegistrationCode() : null,
      form_answers: reg.form_answers || {},
      reviewed_by: reg.reviewed_by || null,
      reviewed_at: reg.reviewed_at || null,
      rejection_reason: reg.rejection_reason || null,
      id: genId(),
      registered_at: new Date().toISOString()
    };
    regs.push(newReg);
    setItem(STORAGE_KEYS.registrations, regs);
    return newReg;
  },
  updateRegistration(id: string, updates: Partial<Registration>) {
    const regs = store.getRegistrations();
    const idx = regs.findIndex(r => r.id === id);
    if (idx !== -1) { regs[idx] = { ...regs[idx], ...updates }; setItem(STORAGE_KEYS.registrations, regs); }
  },
  approveRegistration(id: string, reviewedBy: string): Registration | undefined {
    const regs = store.getRegistrations();
    const idx = regs.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    let code = regs[idx].registration_code || generateRegistrationCode();
    while (regs.some(r => r.id !== id && r.registration_code === code)) code = generateRegistrationCode();
    regs[idx] = {
      ...regs[idx],
      status: 'approved',
      registration_code: code,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    };
    setItem(STORAGE_KEYS.registrations, regs);
    return regs[idx];
  },
  rejectRegistration(id: string, reviewedBy: string, reason: string): Registration | undefined {
    const regs = store.getRegistrations();
    const idx = regs.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    regs[idx] = {
      ...regs[idx],
      status: 'rejected',
      registration_code: null,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    };
    setItem(STORAGE_KEYS.registrations, regs);
    return regs[idx];
  },

  // Attendance
  getAttendance(): Attendance[] {
    return getItem<Attendance[]>(STORAGE_KEYS.attendance, []);
  },
  createAttendance(attendance: Omit<Attendance, 'id' | 'checked_in_at'>): Attendance {
    const rows = store.getAttendance();
    const existing = rows.find(row => row.registration_id === attendance.registration_id);
    if (existing) return existing;
    const row: Attendance = { ...attendance, id: genId(), checked_in_at: new Date().toISOString() };
    rows.push(row);
    setItem(STORAGE_KEYS.attendance, rows);
    return row;
  },

  // Registration Form Fields
  getEventFormFields(eventId: string): EventFormField[] {
    const fields = getItem<EventFormField[]>(STORAGE_KEYS.eventFormFields, []).filter(field => field.event_id === eventId);
    return fields.length > 0 ? fields.sort((a, b) => a.sort_order - b.sort_order) : defaultFormFields(eventId);
  },
  getCustomEventFormFields(eventId: string): EventFormField[] {
    return getItem<EventFormField[]>(STORAGE_KEYS.eventFormFields, [])
      .filter(field => field.event_id === eventId)
      .sort((a, b) => a.sort_order - b.sort_order);
  },
  saveEventFormFields(eventId: string, fields: Array<Omit<EventFormField, 'id' | 'event_id' | 'created_at'>>) {
    const allFields = getItem<EventFormField[]>(STORAGE_KEYS.eventFormFields, []).filter(field => field.event_id !== eventId);
    const nextFields: EventFormField[] = fields.map((field, index) => ({
      ...field,
      id: genId(),
      event_id: eventId,
      sort_order: index,
      options: field.options || [],
      created_at: new Date().toISOString(),
    }));
    setItem(STORAGE_KEYS.eventFormFields, [...allFields, ...nextFields]);
    return nextFields;
  },

  // Volunteer Roles
  getVolunteerRoles(): VolunteerRole[] {
    return getItem<VolunteerRole[]>(STORAGE_KEYS.volunteerRoles, []);
  },
  getEventVolunteerRoles(eventId: string): VolunteerRole[] {
    return store.getVolunteerRoles().filter(vr => vr.event_id === eventId);
  },
  createVolunteerRole(role: Omit<VolunteerRole, 'id'>): VolunteerRole {
    const roles = store.getVolunteerRoles();
    const newRole: VolunteerRole = { ...role, id: genId() };
    roles.push(newRole);
    setItem(STORAGE_KEYS.volunteerRoles, roles);
    return newRole;
  },

  // Volunteer Applications
  getVolunteerApplications(): VolunteerApplication[] {
    return getItem<VolunteerApplication[]>(STORAGE_KEYS.volunteerApplications, []).map(app => ({
      ...app,
      role_requested: app.role_requested || app.role?.role_name || 'General Volunteer',
      skills: app.skills || [],
      availability: app.availability || '',
      reason: app.reason || '',
    }));
  },
  getEventVolunteerApplications(eventId: string): VolunteerApplication[] {
    const apps = store.getVolunteerApplications().filter(a => a.event_id === eventId);
    const profiles = store.getProfiles();
    const roles = store.getVolunteerRoles();
    return apps.map(a => ({
      ...a,
      volunteer: profiles.find(p => p.id === a.volunteer_id),
      role: roles.find(r => r.id === a.role_id)
    }));
  },
  getVolunteerApplicationsByUser(volunteerId: string): VolunteerApplication[] {
    const apps = store.getVolunteerApplications().filter(a => a.volunteer_id === volunteerId);
    const events = store.getEvents();
    const roles = store.getVolunteerRoles();
    return apps.map(a => ({ ...a, event: events.find(e => e.id === a.event_id), role: a.role || roles.find(r => r.id === a.role_id) }));
  },
  createVolunteerApplication(app: Omit<VolunteerApplication, 'id' | 'applied_at'>): VolunteerApplication {
    const apps = store.getVolunteerApplications();
    const requestedRole = (app.role_requested || app.role?.role_name || 'General Volunteer').trim().toLowerCase();
    const duplicate = apps.find(existing =>
      existing.event_id === app.event_id
      && existing.volunteer_id === app.volunteer_id
      && (existing.role_requested || existing.role?.role_name || 'General Volunteer').trim().toLowerCase() === requestedRole
    );
    if (duplicate) throw new Error('You already applied for this volunteer role.');
    const newApp: VolunteerApplication = { ...app, id: genId(), applied_at: new Date().toISOString() };
    apps.push(newApp);
    setItem(STORAGE_KEYS.volunteerApplications, apps);
    return newApp;
  },
  updateVolunteerApplication(id: string, updates: Partial<VolunteerApplication>) {
    const apps = store.getVolunteerApplications();
    const idx = apps.findIndex(a => a.id === id);
    if (idx !== -1) { apps[idx] = { ...apps[idx], ...updates }; setItem(STORAGE_KEYS.volunteerApplications, apps); }
  },

  // Volunteer Tasks
  getVolunteerTasks(): VolunteerTask[] {
    return getItem<VolunteerTask[]>(STORAGE_KEYS.volunteerTasks, []).map(task => ({
      ...task,
      volunteer_id: task.volunteer_id || task.assigned_to,
      assigned_to: task.assigned_to || task.volunteer_id,
      status: task.status === 'todo' ? 'assigned' : task.status,
      task_role: task.task_role || 'Volunteer',
      skills_earned: task.skills_earned || task.skills_gained || [],
      skills_gained: task.skills_gained || task.skills_earned || [],
      start_time: task.start_time || '',
      end_time: task.end_time || '',
    }));
  },
  getEventVolunteerTasks(eventId: string): VolunteerTask[] {
    const tasks = store.getVolunteerTasks().filter(t => t.event_id === eventId);
    const profiles = store.getProfiles();
    return tasks.map(t => ({ ...t, assignee: profiles.find(p => p.id === t.assigned_to) }));
  },
  getVolunteerTasksByUser(volunteerId: string): VolunteerTask[] {
    const tasks = store.getVolunteerTasks().filter(t => t.assigned_to === volunteerId);
    const events = store.getEvents();
    return tasks.map(t => ({ ...t, event: events.find(e => e.id === t.event_id) }));
  },
  createVolunteerTask(task: Omit<VolunteerTask, 'id' | 'created_at'>): VolunteerTask {
    const tasks = store.getVolunteerTasks();
    const newTask: VolunteerTask = {
      ...task,
      volunteer_id: task.volunteer_id || task.assigned_to,
      assigned_to: task.assigned_to || task.volunteer_id,
      status: task.status === 'todo' ? 'assigned' : task.status,
      skills_earned: task.skills_earned || task.skills_gained || [],
      skills_gained: task.skills_gained || task.skills_earned || [],
      id: genId(),
      created_at: new Date().toISOString()
    };
    tasks.push(newTask);
    setItem(STORAGE_KEYS.volunteerTasks, tasks);
    return newTask;
  },
  updateVolunteerTask(id: string, updates: Partial<VolunteerTask>) {
    const tasks = store.getVolunteerTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const nextUpdates: Partial<VolunteerTask> = {
        ...updates,
        skills_earned: updates.skills_earned || updates.skills_gained || tasks[idx].skills_earned,
        skills_gained: updates.skills_gained || updates.skills_earned || tasks[idx].skills_gained,
      };
      if (updates.status) nextUpdates.status = updates.status === 'todo' ? 'assigned' : updates.status;
      tasks[idx] = { ...tasks[idx], ...nextUpdates };
      setItem(STORAGE_KEYS.volunteerTasks, tasks);
    }
  },

  // Sponsor Packages
  getSponsorPackages(): SponsorPackage[] {
    return getItem<SponsorPackage[]>(STORAGE_KEYS.sponsorPackages, []);
  },
  getEventSponsorPackages(eventId: string): SponsorPackage[] {
    return store.getSponsorPackages().filter(sp => sp.event_id === eventId);
  },
  createSponsorPackage(pkg: Omit<SponsorPackage, 'id'>): SponsorPackage {
    const pkgs = store.getSponsorPackages();
    const newPkg: SponsorPackage = { ...pkg, id: genId() };
    pkgs.push(newPkg);
    setItem(STORAGE_KEYS.sponsorPackages, pkgs);
    return newPkg;
  },

  // Sponsor Interests
  getSponsorInterests(): SponsorInterest[] {
    return getItem<SponsorInterest[]>(STORAGE_KEYS.sponsorInterests, []);
  },
  getEventSponsorInterests(eventId: string): SponsorInterest[] {
    const interests = store.getSponsorInterests().filter(si => si.event_id === eventId);
    const profiles = store.getProfiles();
    const packages = store.getSponsorPackages();
    return interests.map(si => ({
      ...si,
      sponsor: profiles.find(p => p.id === si.sponsor_id),
      package: packages.find(pk => pk.id === si.package_id)
    }));
  },
  getSponsorInterestsBySponsor(sponsorId: string): SponsorInterest[] {
    const interests = store.getSponsorInterests().filter(si => si.sponsor_id === sponsorId);
    const events = store.getEvents();
    return interests.map(si => ({ ...si, event: events.find(e => e.id === si.event_id) }));
  },
  createSponsorInterest(interest: Omit<SponsorInterest, 'id' | 'created_at'>): SponsorInterest {
    const interests = store.getSponsorInterests();
    const newInterest: SponsorInterest = { ...interest, id: genId(), created_at: new Date().toISOString() };
    interests.push(newInterest);
    setItem(STORAGE_KEYS.sponsorInterests, interests);
    return newInterest;
  },
  updateSponsorInterest(id: string, updates: Partial<SponsorInterest>) {
    const interests = store.getSponsorInterests();
    const idx = interests.findIndex(si => si.id === id);
    if (idx !== -1) { interests[idx] = { ...interests[idx], ...updates }; setItem(STORAGE_KEYS.sponsorInterests, interests); }
  },

  // Budget Items
  getBudgetItems(): BudgetItem[] {
    return getItem<BudgetItem[]>(STORAGE_KEYS.budgetItems, []);
  },
  getEventBudgetItems(eventId: string): BudgetItem[] {
    return store.getBudgetItems().filter(b => b.event_id === eventId);
  },
  createBudgetItem(item: Omit<BudgetItem, 'id' | 'created_at'>): BudgetItem {
    const items = store.getBudgetItems();
    const newItem: BudgetItem = { ...item, id: genId(), created_at: new Date().toISOString() };
    items.push(newItem);
    setItem(STORAGE_KEYS.budgetItems, items);
    return newItem;
  },
  deleteBudgetItem(id: string) {
    const items = store.getBudgetItems().filter(i => i.id !== id);
    setItem(STORAGE_KEYS.budgetItems, items);
  },

  // Certificates
  getCertificates(): Certificate[] {
    return getItem<Certificate[]>(STORAGE_KEYS.certificates, []);
  },
  getEventCertificates(eventId: string): Certificate[] {
    const certs = store.getCertificates().filter(c => c.event_id === eventId);
    const profiles = store.getProfiles();
    return certs.map(c => ({ ...c, user: profiles.find(p => p.id === c.user_id) }));
  },
  getUserCertificates(userId: string): Certificate[] {
    const certs = store.getCertificates().filter(c => c.user_id === userId);
    const events = store.getEvents();
    return certs.map(c => ({ ...c, event: events.find(e => e.id === c.event_id) }));
  },
  getCertificateByCode(code: string): Certificate | undefined {
    return store.getCertificates().find(c => c.certificate_code === code);
  },
  createCertificate(cert: Omit<Certificate, 'id' | 'issued_at'>): Certificate {
    const certs = store.getCertificates();
    const newCert: Certificate = { ...cert, id: genId(), issued_at: new Date().toISOString() };
    certs.push(newCert);
    setItem(STORAGE_KEYS.certificates, certs);
    return newCert;
  },

  // Passport Records
  getPassportRecords(): PassportRecord[] {
    return getItem<PassportRecord[]>(STORAGE_KEYS.passportRecords, []);
  },
  getUserPassportRecords(userId: string): PassportRecord[] {
    const records = store.getPassportRecords().filter(pr => pr.user_id === userId);
    const events = store.getEvents();
    return records.map(r => ({ ...r, event: events.find(e => e.id === r.event_id) }));
  },
  getPassportRecordsByUsername(username: string): PassportRecord[] {
    const profile = store.getProfileByUsername(username);
    if (!profile) return [];
    return store.getUserPassportRecords(profile.id);
  },
  createPassportRecord(record: Omit<PassportRecord, 'id' | 'created_at'>): PassportRecord {
    const records = store.getPassportRecords();
    const duplicate = records.find(existing =>
      existing.user_id === record.user_id
      && existing.event_id === record.event_id
      && existing.record_type === record.record_type
      && existing.title === record.title
    );
    if (duplicate) return duplicate;
    const newRecord: PassportRecord = { ...record, id: genId(), created_at: new Date().toISOString() };
    records.push(newRecord);
    setItem(STORAGE_KEYS.passportRecords, records);
    return newRecord;
  },

  // Stats
  getOrganizerStats(organizerId: string) {
    const events = store.getOrganizerEvents(organizerId);
    const eventIds = events.map(e => e.id);
    const allRegs = store.getRegistrations().filter(r => eventIds.includes(r.event_id));
    const attended = allRegs.filter(r => r.status === 'attended');
    const allTasks = store.getVolunteerTasks().filter(t => eventIds.includes(t.event_id));
    const allInterests = store.getSponsorInterests().filter(si => eventIds.includes(si.event_id));
    const allCerts = store.getCertificates().filter(c => eventIds.includes(c.event_id));
    const allBudgets = store.getBudgetItems().filter(b => eventIds.includes(b.event_id));
    const income = allBudgets.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);
    const expense = allBudgets.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
    return {
      totalEvents: events.length,
      totalRegistrations: allRegs.length,
      totalAttendance: attended.length,
      totalVolunteers: allTasks.length,
      totalSponsorLeads: allInterests.length,
      totalCertificates: allCerts.length,
      budgetBalance: income - expense,
    };
  },
  getParticipantStats(participantId: string) {
    const regs = store.getRegistrations().filter(r => r.participant_id === participantId);
    const certs = store.getCertificates().filter(c => c.user_id === participantId);
    const records = store.getPassportRecords().filter(pr => pr.user_id === participantId);
    return {
      registeredEvents: regs.length,
      upcomingEvents: regs.filter(r => r.status === 'pending' || r.status === 'approved').length,
      certificates: certs.length,
      proofRecords: records.length,
    };
  },
  getVolunteerStats(volunteerId: string) {
    const apps = store.getVolunteerApplications().filter(a => a.volunteer_id === volunteerId);
    const tasks = store.getVolunteerTasks().filter(t => t.assigned_to === volunteerId);
    const completed = tasks.filter(t => t.status === 'completed');
    const totalHours = completed.reduce((s, t) => s + (t.hours || 0), 0);
    const allSkills = new Set<string>();
    completed.forEach(t => (t.skills_earned || t.skills_gained || []).forEach(s => allSkills.add(s)));
    const proofRecords = store.getPassportRecords().filter(pr => pr.user_id === volunteerId && (pr.record_type === 'volunteer_task' || pr.record_type === 'volunteer'));
    return {
      applications: apps.length,
      approvedApplications: apps.filter(a => a.status === 'approved').length,
      assignedTasks: tasks.filter(t => t.status !== 'completed').length,
      completedHours: totalHours,
      skillsEarned: allSkills.size,
      proofRecords: proofRecords.length,
    };
  },
  getSponsorStats(sponsorId: string) {
    const interests = store.getSponsorInterests().filter(si => si.sponsor_id === sponsorId);
    const events = store.getPublishedEvents();
    return {
      matchingEvents: events.length,
      submittedInterests: interests.length,
      confirmedPartnerships: interests.filter(i => i.status === 'confirmed').length,
    };
  },
};

export default store;

export type UserRole = 'organizer' | 'participant' | 'volunteer' | 'sponsor';

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  passport_slug?: string;
  created_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  date: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  city?: string;
  poster_url?: string | null;
  max_participants: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  participant_id: string;
  participant?: Profile;
  registration_code?: string | null;
  qr_code_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'attended' | 'cancelled';
  form_answers?: Record<string, string | string[] | boolean>;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  registered_at: string;
}

export interface EventFormField {
  id: string;
  event_id: string;
  label: string;
  field_type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'select' | 'checkbox';
  required: boolean;
  options: string[];
  sort_order: number;
  created_at: string;
}

export interface Attendance {
  id: string;
  event_id: string;
  registration_id: string;
  participant_id: string;
  checked_in_by?: string;
  checked_in_at: string;
  status: 'present' | 'absent';
}

export interface VolunteerRole {
  id: string;
  event_id: string;
  role_name: string;
  description?: string;
  required_count: number;
  skills?: string[];
}

export interface VolunteerApplication {
  id: string;
  event_id: string;
  volunteer_id: string;
  volunteer?: Profile;
  role_id?: string;
  role?: VolunteerRole;
  role_requested?: string;
  skills?: string[];
  availability?: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  applied_at: string;
}

export interface VolunteerTask {
  id: string;
  event_id: string;
  volunteer_id?: string;
  assigned_to?: string;
  assignee?: Profile;
  event?: Event;
  title: string;
  description?: string;
  task_role?: string;
  start_time?: string;
  end_time?: string;
  status: 'assigned' | 'todo' | 'in_progress' | 'completed';
  hours: number;
  skills_earned?: string[];
  skills_gained?: string[];
  completed_at?: string;
  created_at: string;
}

export interface SponsorPackage {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  amount: number;
  benefits?: string[];
  visibility_level: 'standard' | 'premium' | 'platinum';
}

export interface SponsorInterest {
  id: string;
  event_id: string;
  sponsor_id: string;
  sponsor?: Profile;
  package_id?: string;
  package?: SponsorPackage;
  event?: Event;
  company_name?: string;
  message?: string;
  status: 'new' | 'contacted' | 'confirmed' | 'rejected';
  created_at: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  category?: string;
  notes?: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  event_id: string;
  event?: Event;
  user_id: string;
  user?: Profile;
  certificate_code: string;
  role: string;
  pdf_url?: string;
  issued_at: string;
}

export interface PassportRecord {
  id: string;
  user_id: string;
  event_id: string;
  event?: Event;
  record_type: 'attendance' | 'certificate' | 'volunteer' | 'volunteer_task';
  title: string;
  description?: string;
  skills?: string[];
  hours: number;
  certificate_id?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface SponsorPitchInput {
  eventId: string;
  sponsorType: string;
  companyName: string;
  contactName: string;
}

export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  totalVolunteers: number;
  totalSponsorLeads: number;
  totalCertificates: number;
  budgetBalance: number;
}

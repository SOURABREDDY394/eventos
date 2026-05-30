import type { Profile, Event, Registration, VolunteerApplication, VolunteerTask, SponsorPackage, SponsorInterest, BudgetItem, Certificate, PassportRecord, VolunteerRole } from '@/types';

export const seedProfiles: Profile[] = [
  { id: 'u1', full_name: 'Sourab Reddy', username: 'sourabreddy', email: 'sourab@example.com', role: 'participant', avatar_url: '/images/avatar-sourab.jpg', bio: 'AI enthusiast and hackathon lover', passport_slug: 'sourabreddy', created_at: '2025-10-01T00:00:00Z' },
  { id: 'u2', full_name: 'Priya Sharma', username: 'priyasharma', email: 'priya@example.com', role: 'organizer', avatar_url: '/images/avatar-priya.jpg', bio: 'Event organizer at Tech Campus', passport_slug: 'priyasharma', created_at: '2025-09-15T00:00:00Z' },
  { id: 'u3', full_name: 'Arjun Patel', username: 'arjunpatel', email: 'arjun@example.com', role: 'volunteer', avatar_url: '/images/avatar-arjun.jpg', bio: 'Web developer and community builder', passport_slug: 'arjunpatel', created_at: '2025-11-01T00:00:00Z' },
  { id: 'u4', full_name: 'Neha Gupta', username: 'nehagupta', email: 'neha@example.com', role: 'participant', avatar_url: '/images/avatar-neha.jpg', bio: 'Data science student', passport_slug: 'nehagupta', created_at: '2025-10-15T00:00:00Z' },
  { id: 'u5', full_name: 'Karthik Iyer', username: 'karthikiyer', email: 'karthik@example.com', role: 'sponsor', avatar_url: '/images/avatar-karthik.jpg', bio: 'Sponsorship lead at CloudTech Corp', passport_slug: 'karthikiyer', created_at: '2025-08-01T00:00:00Z' },
  { id: 'u6', full_name: 'Ravi Kumar', username: 'ravikumar', email: 'ravi@example.com', role: 'participant', passport_slug: 'ravikumar', created_at: '2025-11-10T00:00:00Z' },
  { id: 'u7', full_name: 'Ananya Rao', username: 'ananyarao', email: 'ananya@example.com', role: 'volunteer', passport_slug: 'ananyarao', created_at: '2025-09-20T00:00:00Z' },
  { id: 'u8', full_name: 'Vikram Singh', username: 'vikramsingh', email: 'vikram@example.com', role: 'organizer', passport_slug: 'vikramsingh', created_at: '2025-07-01T00:00:00Z' },
];

export const seedEvents: Event[] = [
  { id: 'e1', organizer_id: 'u2', title: 'AI Workshop 2026', slug: 'ai-workshop-2026', description: 'A comprehensive 3-day workshop on Artificial Intelligence covering machine learning fundamentals, deep learning, neural networks, and practical AI applications. Perfect for students and professionals looking to dive into AI.', category: 'Technology', date: '2026-06-10', start_time: '09:00', end_time: '17:00', venue: 'Tech Campus Auditorium', city: 'Bengaluru', poster_url: null, max_participants: 200, status: 'published', created_at: '2026-01-01T00:00:00Z' },
  { id: 'e2', organizer_id: 'u2', title: 'HackFest 3.0', slug: 'hackfest-3-0', description: '48 hours of innovation, coding, and creativity. Build amazing projects, win prizes, and connect with fellow developers. Themes include AI, sustainability, fintech, and edtech.', category: 'Hackathon', date: '2026-06-28', start_time: '10:00', end_time: '10:00', venue: 'Innovation Hub', city: 'Bengaluru', poster_url: null, max_participants: 150, status: 'published', created_at: '2026-01-15T00:00:00Z' },
  { id: 'e3', organizer_id: 'u8', title: 'Web Dev Bootcamp', slug: 'web-dev-bootcamp', description: 'From Zero to Full Stack in 3 days. Learn HTML, CSS, JavaScript, React, and Node.js. Hands-on projects with mentorship from industry experts.', category: 'Education', date: '2026-05-10', start_time: '09:30', end_time: '16:30', venue: 'Learning Center', city: 'Hyderabad', poster_url: null, max_participants: 100, status: 'published', created_at: '2026-02-01T00:00:00Z' },
];

export const seedVolunteerRoles: VolunteerRole[] = [
  { id: 'vr1', event_id: 'e1', role_name: 'Registration Desk', description: 'Manage participant check-ins and registration', required_count: 4, skills: ['Communication', 'Organization'] },
  { id: 'vr2', event_id: 'e1', role_name: 'Technical Support', description: 'Assist with AV equipment and technical issues', required_count: 3, skills: ['Technical', 'Problem Solving'] },
  { id: 'vr3', event_id: 'e2', role_name: 'Mentor', description: 'Guide teams during the hackathon', required_count: 6, skills: ['Coding', 'Leadership', 'Mentoring'] },
  { id: 'vr4', event_id: 'e2', role_name: 'Logistics', description: 'Manage food, swag, and venue setup', required_count: 5, skills: ['Logistics', 'Teamwork'] },
  { id: 'vr5', event_id: 'e3', role_name: 'Teaching Assistant', description: 'Help participants with coding exercises', required_count: 4, skills: ['Teaching', 'Coding', 'Patience'] },
];

export const seedRegistrations: Registration[] = [
  { id: 'r1', event_id: 'e1', participant_id: 'u1', registration_code: 'EVOS-AB12CD', status: 'attended', form_answers: {}, reviewed_at: '2026-02-02T00:00:00Z', registered_at: '2026-02-01T00:00:00Z' },
  { id: 'r2', event_id: 'e1', participant_id: 'u4', registration_code: 'EVOS-EF34GH', status: 'attended', form_answers: {}, reviewed_at: '2026-02-06T00:00:00Z', registered_at: '2026-02-05T00:00:00Z' },
  { id: 'r3', event_id: 'e1', participant_id: 'u6', registration_code: 'EVOS-IJ56KL', status: 'approved', form_answers: {}, reviewed_at: '2026-02-11T00:00:00Z', registered_at: '2026-02-10T00:00:00Z' },
  { id: 'r4', event_id: 'e2', participant_id: 'u1', registration_code: 'EVOS-MN78OP', status: 'attended', form_answers: {}, reviewed_at: '2026-03-02T00:00:00Z', registered_at: '2026-03-01T00:00:00Z' },
  { id: 'r5', event_id: 'e2', participant_id: 'u4', registration_code: 'EVOS-QR90ST', status: 'approved', form_answers: {}, reviewed_at: '2026-03-06T00:00:00Z', registered_at: '2026-03-05T00:00:00Z' },
  { id: 'r6', event_id: 'e2', participant_id: 'u6', registration_code: 'EVOS-UV12WX', status: 'approved', form_answers: {}, reviewed_at: '2026-03-09T00:00:00Z', registered_at: '2026-03-08T00:00:00Z' },
  { id: 'r7', event_id: 'e3', participant_id: 'u4', registration_code: 'EVOS-YZ34AB', status: 'attended', form_answers: {}, reviewed_at: '2026-04-02T00:00:00Z', registered_at: '2026-04-01T00:00:00Z' },
  { id: 'r8', event_id: 'e3', participant_id: 'u6', registration_code: 'EVOS-CD56EF', status: 'approved', form_answers: {}, reviewed_at: '2026-04-06T00:00:00Z', registered_at: '2026-04-05T00:00:00Z' },
  { id: 'r9', event_id: 'e1', participant_id: 'u3', registration_code: 'EVOS-GH78IJ', status: 'attended', form_answers: {}, reviewed_at: '2026-02-04T00:00:00Z', registered_at: '2026-02-03T00:00:00Z' },
  { id: 'r10', event_id: 'e2', participant_id: 'u3', registration_code: 'EVOS-KL90MN', status: 'attended', form_answers: {}, reviewed_at: '2026-03-03T00:00:00Z', registered_at: '2026-03-02T00:00:00Z' },
];

export const seedVolunteerApplications: VolunteerApplication[] = [
  { id: 'va1', event_id: 'e1', volunteer_id: 'u3', role_id: 'vr2', status: 'approved', reason: 'I have experience with AV systems and technical troubleshooting', applied_at: '2026-01-20T00:00:00Z' },
  { id: 'va2', event_id: 'e1', volunteer_id: 'u7', role_id: 'vr1', status: 'approved', reason: 'Love meeting new people and organizing', applied_at: '2026-01-22T00:00:00Z' },
  { id: 'va3', event_id: 'e2', volunteer_id: 'u3', role_id: 'vr3', status: 'approved', reason: 'Full-stack developer with 2 years experience', applied_at: '2026-02-15T00:00:00Z' },
  { id: 'va4', event_id: 'e2', volunteer_id: 'u7', role_id: 'vr4', status: 'pending', reason: 'Great at logistics and coordination', applied_at: '2026-02-20T00:00:00Z' },
];

export const seedVolunteerTasks: VolunteerTask[] = [
  { id: 'vt1', event_id: 'e1', assigned_to: 'u3', title: 'Setup Audio Systems', description: 'Install and test all microphones and speakers in the main auditorium', status: 'completed', hours: 4, skills_gained: ['Audio Engineering', 'Technical Setup'], completed_at: '2026-03-14T00:00:00Z', created_at: '2026-03-10T00:00:00Z' },
  { id: 'vt2', event_id: 'e1', assigned_to: 'u3', title: 'Livestream Setup', description: 'Configure livestream for remote participants', status: 'completed', hours: 3, skills_gained: ['Livestreaming', 'OBS Studio'], completed_at: '2026-03-15T00:00:00Z', created_at: '2026-03-10T00:00:00Z' },
  { id: 'vt3', event_id: 'e1', assigned_to: 'u7', title: 'Registration Desk Management', description: 'Manage participant check-in and distribute badges', status: 'completed', hours: 6, skills_gained: ['Communication', 'Crowd Management'], completed_at: '2026-03-15T00:00:00Z', created_at: '2026-03-10T00:00:00Z' },
  { id: 'vt4', event_id: 'e2', assigned_to: 'u3', title: 'Team Mentoring - AI Track', description: 'Mentor 3 teams working on AI/ML projects', status: 'completed', hours: 8, skills_gained: ['Mentoring', 'AI/ML', 'Leadership'], completed_at: '2026-04-23T00:00:00Z', created_at: '2026-04-20T00:00:00Z' },
  { id: 'vt5', event_id: 'e2', assigned_to: 'u7', title: 'Swag Distribution', description: 'Organize and distribute participant swag bags', status: 'todo', hours: 3, skills_gained: ['Logistics'], created_at: '2026-04-20T00:00:00Z' },
  { id: 'vt6', event_id: 'e1', assigned_to: 'u3', title: 'Troubleshoot WiFi Issues', description: 'Help participants with connectivity problems', status: 'in_progress', hours: 2, skills_gained: ['Networking'], created_at: '2026-03-14T00:00:00Z' },
];

export const seedSponsorPackages: SponsorPackage[] = [
  { id: 'sp1', event_id: 'e1', title: 'Gold Sponsor', description: 'Premium visibility with logo on all materials', amount: 50000, benefits: ['Logo on all posters', 'Booth space', 'Speaking slot', 'Certificate of appreciation'], visibility_level: 'premium' },
  { id: 'sp2', event_id: 'e1', title: 'Silver Sponsor', description: 'Good visibility with digital presence', amount: 25000, benefits: ['Logo on digital materials', 'Mention during event', 'Social media shoutout'], visibility_level: 'standard' },
  { id: 'sp3', event_id: 'e2', title: 'Platinum Sponsor', description: 'Maximum visibility and engagement', amount: 100000, benefits: ['Title sponsor branding', 'VIP booth', 'Keynote speaking opportunity', 'Access to participant resumes', 'Custom swag inclusion'], visibility_level: 'platinum' },
  { id: 'sp4', event_id: 'e2', title: 'Gold Sponsor', description: 'High visibility branding', amount: 50000, benefits: ['Logo on hackathon swag', 'Mentor booth', 'Recruitment access'], visibility_level: 'premium' },
  { id: 'sp5', event_id: 'e3', title: 'Education Partner', description: 'Support education initiatives', amount: 30000, benefits: ['Course material branding', 'Mentorship slots', 'Job board access'], visibility_level: 'standard' },
];

export const seedSponsorInterests: SponsorInterest[] = [
  { id: 'si1', event_id: 'e1', sponsor_id: 'u5', package_id: 'sp1', company_name: 'CloudTech Corp', message: 'We would love to sponsor the AI Workshop. Our company is heavily invested in AI research.', status: 'contacted', created_at: '2026-01-25T00:00:00Z' },
  { id: 'si2', event_id: 'e2', sponsor_id: 'u5', package_id: 'sp3', company_name: 'CloudTech Corp', message: 'HackFest aligns perfectly with our developer relations goals.', status: 'new', created_at: '2026-02-25T00:00:00Z' },
  { id: 'si3', event_id: 'e1', sponsor_id: 'u5', package_id: 'sp2', company_name: 'CloudTech Corp', message: 'Interested in Silver tier for broader reach.', status: 'confirmed', created_at: '2026-01-30T00:00:00Z' },
  { id: 'si4', event_id: 'e3', sponsor_id: 'u5', package_id: 'sp5', company_name: 'CloudTech Corp', message: 'Supporting web dev education is important to us.', status: 'new', created_at: '2026-03-15T00:00:00Z' },
];

export const seedBudgetItems: BudgetItem[] = [
  { id: 'b1', event_id: 'e1', type: 'income', title: 'CloudTech Gold Sponsorship', amount: 50000, category: 'Sponsorship', notes: 'Confirmed Gold sponsor', created_at: '2026-01-25T00:00:00Z' },
  { id: 'b2', event_id: 'e1', type: 'income', title: 'CloudTech Silver Sponsorship', amount: 25000, category: 'Sponsorship', notes: 'Silver tier confirmed', created_at: '2026-01-30T00:00:00Z' },
  { id: 'b3', event_id: 'e1', type: 'income', title: 'Registration Fees', amount: 15000, category: 'Registration', notes: 'Early bird registrations', created_at: '2026-02-15T00:00:00Z' },
  { id: 'b4', event_id: 'e1', type: 'expense', title: 'Venue Rental', amount: 30000, category: 'Venue', notes: 'Auditorium 3-day rental', created_at: '2026-01-05T00:00:00Z' },
  { id: 'b5', event_id: 'e1', type: 'expense', title: 'Catering', amount: 15000, category: 'Food', notes: 'Lunch and snacks for 3 days', created_at: '2026-01-10T00:00:00Z' },
  { id: 'b6', event_id: 'e1', type: 'expense', title: 'Speaker Fees', amount: 20000, category: 'Speakers', notes: 'Keynote speakers honorarium', created_at: '2026-01-15T00:00:00Z' },
  { id: 'b7', event_id: 'e1', type: 'expense', title: 'Swag & Certificates', amount: 8000, category: 'Materials', notes: 'T-shirts, badges, certificates', created_at: '2026-02-01T00:00:00Z' },
  { id: 'b8', event_id: 'e1', type: 'expense', title: 'AV Equipment', amount: 12000, category: 'Equipment', notes: 'Projectors, mics, livestream setup', created_at: '2026-02-05T00:00:00Z' },
  { id: 'b9', event_id: 'e2', type: 'income', title: 'CloudTech Platinum Sponsorship', amount: 100000, category: 'Sponsorship', notes: 'Title sponsor for HackFest', created_at: '2026-02-28T00:00:00Z' },
  { id: 'b10', event_id: 'e2', type: 'income', title: 'Registration Fees', amount: 20000, category: 'Registration', notes: 'Team registration fees', created_at: '2026-03-10T00:00:00Z' },
  { id: 'b11', event_id: 'e2', type: 'expense', title: 'Venue & Infrastructure', amount: 40000, category: 'Venue', notes: '48-hour venue access', created_at: '2026-02-10T00:00:00Z' },
  { id: 'b12', event_id: 'e2', type: 'expense', title: 'Food & Beverages', amount: 25000, category: 'Food', notes: 'Meals for 48 hours', created_at: '2026-02-15T00:00:00Z' },
  { id: 'b13', event_id: 'e2', type: 'expense', title: 'Prizes', amount: 30000, category: 'Prizes', notes: 'Cash prizes and gadgets', created_at: '2026-03-01T00:00:00Z' },
  { id: 'b14', event_id: 'e2', type: 'expense', title: 'Swag', amount: 15000, category: 'Materials', notes: 'T-shirts, stickers, notebooks', created_at: '2026-03-05T00:00:00Z' },
  { id: 'b15', event_id: 'e3', type: 'income', title: 'Education Partner', amount: 30000, category: 'Sponsorship', notes: 'Education partner confirmed', created_at: '2026-03-20T00:00:00Z' },
];

export const seedCertificates: Certificate[] = [
  { id: 'c1', event_id: 'e1', user_id: 'u1', certificate_code: 'CERT-AB12CD-EFGH', role: 'Participant', issued_at: '2026-03-17T00:00:00Z' },
  { id: 'c2', event_id: 'e1', user_id: 'u3', certificate_code: 'CERT-IJ34KL-MNOP', role: 'Volunteer', issued_at: '2026-03-17T00:00:00Z' },
  { id: 'c3', event_id: 'e1', user_id: 'u7', certificate_code: 'CERT-QR56ST-UVWX', role: 'Volunteer', issued_at: '2026-03-17T00:00:00Z' },
  { id: 'c4', event_id: 'e2', user_id: 'u1', certificate_code: 'CERT-YZ78AB-CDEF', role: 'Participant', issued_at: '2026-04-25T00:00:00Z' },
  { id: 'c5', event_id: 'e2', user_id: 'u3', certificate_code: 'CERT-GH90IJ-KLMN', role: 'Volunteer - Mentor', issued_at: '2026-04-25T00:00:00Z' },
];

export const seedPassportRecords: PassportRecord[] = [
  { id: 'pr1', user_id: 'u1', event_id: 'e1', record_type: 'attendance', title: 'AI Workshop 2026', description: 'Attended as Participant', skills: ['Machine Learning', 'AI Fundamentals'], hours: 24, verified_at: '2026-03-15T00:00:00Z', created_at: '2026-03-15T00:00:00Z' },
  { id: 'pr2', user_id: 'u1', event_id: 'e1', record_type: 'certificate', title: 'AI Workshop 2026 Certificate', description: 'Certificate of Participation', certificate_id: 'CERT-AB12CD-EFGH', skills: ['AI', 'Machine Learning'], hours: 0, verified_at: '2026-03-17T00:00:00Z', created_at: '2026-03-17T00:00:00Z' },
  { id: 'pr3', user_id: 'u1', event_id: 'e2', record_type: 'attendance', title: 'HackFest 3.0', description: 'Participated in 48-hour hackathon', skills: ['Problem Solving', 'Teamwork', 'Coding'], hours: 48, verified_at: '2026-04-22T00:00:00Z', created_at: '2026-04-22T00:00:00Z' },
  { id: 'pr4', user_id: 'u1', event_id: 'e2', record_type: 'certificate', title: 'HackFest 3.0 Certificate', description: 'Certificate of Participation', certificate_id: 'CERT-YZ78AB-CDEF', skills: ['Hackathon', 'Innovation'], hours: 0, verified_at: '2026-04-25T00:00:00Z', created_at: '2026-04-25T00:00:00Z' },
  { id: 'pr5', user_id: 'u3', event_id: 'e1', record_type: 'volunteer', title: 'AI Workshop 2026 - Technical Support', description: 'Volunteer - Technical Support Role', skills: ['Audio Engineering', 'Technical Setup', 'Livestreaming', 'Networking'], hours: 9, verified_at: '2026-03-17T00:00:00Z', created_at: '2026-03-17T00:00:00Z' },
  { id: 'pr6', user_id: 'u3', event_id: 'e1', record_type: 'certificate', title: 'AI Workshop 2026 - Volunteer Certificate', description: 'Certificate of Appreciation - Volunteer', certificate_id: 'CERT-IJ34KL-MNOP', skills: ['Volunteering', 'Technical Support'], hours: 0, verified_at: '2026-03-17T00:00:00Z', created_at: '2026-03-17T00:00:00Z' },
  { id: 'pr7', user_id: 'u3', event_id: 'e2', record_type: 'volunteer', title: 'HackFest 3.0 - Mentor', description: 'Volunteer Mentor - AI Track', skills: ['Mentoring', 'AI/ML', 'Leadership'], hours: 8, verified_at: '2026-04-25T00:00:00Z', created_at: '2026-04-25T00:00:00Z' },
  { id: 'pr8', user_id: 'u7', event_id: 'e1', record_type: 'volunteer', title: 'AI Workshop 2026 - Registration', description: 'Volunteer - Registration Desk', skills: ['Communication', 'Crowd Management'], hours: 6, verified_at: '2026-03-17T00:00:00Z', created_at: '2026-03-17T00:00:00Z' },
];

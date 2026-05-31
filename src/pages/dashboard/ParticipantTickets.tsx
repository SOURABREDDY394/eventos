import { Link } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { Ticket, Calendar, MapPin, Clock, CheckCircle, XCircle, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Registration } from '@/types';

const statusOrder: Registration['status'][] = ['pending', 'approved', 'rejected', 'attended', 'cancelled'];

const statusLabels: Record<Registration['status'], string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  attended: 'Attended',
  cancelled: 'Cancelled',
};

function statusClasses(status: Registration['status']) {
  if (status === 'pending') return 'bg-amber-500/20 text-amber-300';
  if (status === 'approved') return 'bg-blue-500/20 text-blue-300';
  if (status === 'attended') return 'bg-emerald-500/20 text-emerald-300';
  if (status === 'rejected') return 'bg-red-500/20 text-red-300';
  return 'bg-white/10 text-white/40';
}

export default function ParticipantTickets() {
  const user = store.getCurrentUser();
  const registrations = user ? store.getParticipantRegistrations(user.id) : [];
  const events = store.getEvents();

  return (
    <DashboardLayout title="My Tickets">
      {registrations.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Ticket className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No registrations yet. Browse events to apply!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {statusOrder.map((status) => {
            const group = registrations.filter(registration => registration.status === status);
            if (group.length === 0) return null;

            return (
              <section key={status}>
                <h2 className="text-sm font-semibold text-white mb-3">{statusLabels[status]}</h2>
                <div className="grid gap-4">
                  {group.map((reg) => {
                    const event = events.find(e => e.id === reg.event_id);
                    if (!event) return null;
                    const hasTicket = (reg.status === 'approved' || reg.status === 'attended') && Boolean(reg.registration_code);

                    return (
                      <div key={reg.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white mb-1">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-white/30">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue}, {event.city}</span>
                          </div>

                          <span className={`text-[10px] px-2 py-0.5 rounded-full mt-3 inline-flex items-center gap-1 ${statusClasses(reg.status)}`}>
                            {reg.status === 'pending' && <Clock className="w-3 h-3" />}
                            {(reg.status === 'approved' || reg.status === 'attended') && <CheckCircle className="w-3 h-3" />}
                            {reg.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {statusLabels[reg.status]}
                          </span>

                          {reg.status === 'pending' && (
                            <p className="text-xs text-white/35 mt-3">Waiting for organizer approval. QR ticket will appear after approval.</p>
                          )}
                          {reg.status === 'rejected' && (
                            <p className="text-xs text-red-200/80 mt-3">{reg.rejection_reason || 'This registration was rejected.'}</p>
                          )}
                          {reg.status === 'attended' && (
                            <p className="text-xs text-emerald-200/80 mt-3">Attendance verified. Certificate eligibility may be available from the organizer.</p>
                          )}
                          {hasTicket && (
                            <p className="mono-text text-xs text-[#E49B3A] mt-3">{reg.registration_code}</p>
                          )}
                          {reg.status === 'attended' && (
                            <Link to={`/proof/participant/${reg.id}`} className="workspace-chip mt-3 inline-flex">
                              <Shield className="w-3 h-3" /> View Proof Engine record
                            </Link>
                          )}
                        </div>

                        {hasTicket ? (
                          <div className="flex-shrink-0 bg-white p-2 rounded-lg self-start">
                            <QRCodeSVG value={reg.registration_code || ''} size={100} bgColor="#ffffff" fgColor="#030303" />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:w-[116px] flex items-center justify-center">
                            <p className="text-[10px] text-center text-white/25">No QR until approved</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

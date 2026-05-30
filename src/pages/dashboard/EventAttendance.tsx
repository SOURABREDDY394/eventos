import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { isPastEvent } from '@/lib/eventLifecycle';
import { QrCode, CheckCircle, AlertCircle, Camera, CameraOff, Search, UserCheck } from 'lucide-react';
import type { Registration } from '@/types';

// BarcodeDetector is available in Chromium browsers; typed loosely here.
type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
};
declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats: string[] }) => BarcodeDetectorLike;
  }
}

export default function EventAttendance() {
  const { id } = useParams<{ id: string }>();
  const event = store.getEventById(id || '');
  const [code, setCode] = useState('');
  const [query, setQuery] = useState('');
  const [handledBy, setHandledBy] = useState('organizer');
  const [version, setVersion] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const registrations = event ? store.getEventRegistrations(event.id) : [];
  const approvedVolunteers = useMemo(
    () => (event ? store.getEventVolunteerApplications(event.id).filter(a => a.status === 'approved') : []),
    [event, version],
  );

  const stopScan = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  // Clean up the camera when leaving the page.
  useEffect(() => () => stopScan(), []);

  if (!event) return <DashboardLayout title="Check-In"><p className="text-white/40">Event not found</p></DashboardLayout>;

  const attended = registrations.filter(r => r.status === 'attended');
  const approved = registrations.filter(r => r.status === 'approved');
  const attendanceClosed = isPastEvent(event.date);

  const handledByName = () => {
    if (handledBy === 'organizer') return '';
    return approvedVolunteers.find(v => v.volunteer_id === handledBy)?.volunteer?.full_name || '';
  };

  const doCheckIn = (reg: Registration, method: 'manual' | 'qr') => {
    store.checkInRegistration(reg, {
      method,
      handledById: handledBy === 'organizer' ? undefined : handledBy,
      handledByName: handledByName(),
    });
    setMessage({ text: `Checked in: ${reg.participant?.full_name || reg.registration_code}`, type: 'success' });
    setCode('');
    setVersion(v => v + 1);
  };

  const verifyCode = (raw: string): boolean => {
    setMessage(null);
    if (attendanceClosed) { setMessage({ text: 'Check-in is closed for this event.', type: 'error' }); return false; }
    const value = raw.trim().toUpperCase();
    if (!value) return false;
    const reg = store.getRegistrationByCode(value);
    if (!reg) { setMessage({ text: 'Invalid registration code', type: 'error' }); return false; }
    if (reg.event_id !== event.id) { setMessage({ text: 'Code belongs to a different event', type: 'error' }); return false; }
    if (reg.status === 'pending') { setMessage({ text: 'This registration is still pending approval.', type: 'error' }); return false; }
    if (reg.status === 'rejected') { setMessage({ text: 'This registration was rejected.', type: 'error' }); return false; }
    if (reg.status === 'attended') { setMessage({ text: 'Already checked in', type: 'error' }); return false; }
    if (reg.status !== 'approved') { setMessage({ text: 'Only approved registrations can be checked in.', type: 'error' }); return false; }
    doCheckIn(store.getEventRegistrations(event.id).find(r => r.id === reg.id) || reg, 'manual');
    return true;
  };

  const startScan = async () => {
    setScanError('');
    if (!window.BarcodeDetector) {
      setScanError('Live QR scanning is not supported in this browser. Use manual code entry below.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const tick = async () => {
        if (!streamRef.current) return;
        try {
          const codes = await detector.detect(video);
          if (codes.length) {
            const ok = verifyCode(codes[0].rawValue);
            if (ok) { stopScan(); return; }
          }
        } catch { /* keep scanning */ }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setScanError('Could not access the camera. Check permissions or use manual entry.');
      setScanning(false);
    }
  };

  const filteredApproved = approved.filter(r => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (r.participant?.full_name || '').toLowerCase().includes(q) || (r.registration_code || '').toLowerCase().includes(q);
  });

  return (
    <DashboardLayout title="Event Check-In">
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          {/* Scanner + manual entry */}
          <div className="glass-card rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-6 h-6 text-[#E49B3A]" />
              <h2 className="text-base font-semibold text-white">Scan QR or Enter Code</h2>
            </div>

            <div className="rounded-lg overflow-hidden bg-black/40 border border-white/10 mb-3 aspect-video flex items-center justify-center relative">
              <video ref={videoRef} className={`w-full h-full object-cover ${scanning ? '' : 'hidden'}`} muted playsInline />
              {!scanning && (
                <div className="text-center px-4 py-8">
                  <Camera className="w-10 h-10 text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/40">Camera preview appears here while scanning.</p>
                </div>
              )}
              {scanning && <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200">Scanning…</span>}
            </div>

            <div className="flex gap-2 mb-3">
              {!scanning ? (
                <button onClick={startScan} disabled={attendanceClosed} className="gold-btn flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                  <Camera className="w-4 h-4" /> Start QR Scan
                </button>
              ) : (
                <button onClick={stopScan} className="ghost-btn rounded-full flex-1 flex items-center justify-center gap-2">
                  <CameraOff className="w-4 h-4" /> Stop Scan
                </button>
              )}
            </div>
            {scanError && <p className="text-xs text-amber-400 mb-3">{scanError}</p>}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') verifyCode(code); }}
                disabled={attendanceClosed}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-base text-white mono-text placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50"
                placeholder="EVOS-XXXXXX" />
              <button onClick={() => verifyCode(code)} disabled={attendanceClosed} className="gold-btn disabled:opacity-50 whitespace-nowrap">Verify & Check In</button>
            </div>

            <div className="mt-3">
              <label className="text-[11px] text-white/40 mb-1 block">Check-in handled by</label>
              <select value={handledBy} onChange={e => setHandledBy(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50">
                <option value="organizer" className="bg-[#1a1a1a]">Organizer (me)</option>
                {approvedVolunteers.map(v => (
                  <option key={v.id} value={v.volunteer_id} className="bg-[#1a1a1a]">
                    {v.volunteer?.full_name || 'Volunteer'} — earns {15} pts / check-in
                  </option>
                ))}
              </select>
            </div>

            {attendanceClosed && <p className="text-xs text-white/35 mt-3">Check-in is closed for this event.</p>}
            {message && (
              <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xl font-bold text-white">{registrations.length}</p>
              <p className="text-[10px] text-white/30">Total</p>
            </div>
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xl font-bold text-emerald-400">{attended.length}</p>
              <p className="text-[10px] text-white/30">Checked In</p>
            </div>
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xl font-bold text-blue-400">{approved.length}</p>
              <p className="text-[10px] text-white/30">Awaiting</p>
            </div>
          </div>
        </div>

        {/* Approved list with one-tap check-in + checked-in list */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Approved — Tap to Check In ({approved.length})</h3>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name or code"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50" />
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {approved.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">No approved participants awaiting check-in.</p>
              ) : filteredApproved.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">No matches for “{query}”.</p>
              ) : filteredApproved.map((reg) => (
                <div key={reg.id} className="glass-card rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-medium text-blue-400">
                    {reg.participant?.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{reg.participant?.full_name || 'Unknown'}</p>
                    <p className="text-[10px] mono-text text-white/30">{reg.registration_code}</p>
                  </div>
                  <button onClick={() => doCheckIn(reg, 'manual')} disabled={attendanceClosed}
                    className="text-[11px] px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center gap-1 disabled:opacity-40">
                    <UserCheck className="w-3.5 h-3.5" /> Check In
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Checked-in Attendees ({attended.length})</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {attended.length === 0 && <p className="text-sm text-white/30 text-center py-8">No check-ins yet</p>}
              {attended.map((reg) => (
                <div key={reg.id} className="glass-card rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{reg.participant?.full_name || 'Unknown'}</p>
                    <p className="text-[10px] mono-text text-white/30">{reg.registration_code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

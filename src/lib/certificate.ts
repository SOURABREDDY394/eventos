import { qrToDataUrl } from '@/lib/qr';

// Feature 2 — shared downloadable certificate generator.
// Renders a premium certificate (participant name, event, date, organizer) with
// an embedded QR that links to the public verification page, then downloads PNG.

export interface CertificateData {
  participantName: string;
  eventName: string;
  date: string;          // human-readable event/issue date
  organizerName: string;
  code: string;
  role?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function downloadCertificate(data: CertificateData): Promise<void> {
  const W = 1000;
  const H = 700;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#FFFCF3';
  ctx.fillRect(0, 0, W, H);

  // Decorative borders (olive/gold premium look matching the app theme)
  ctx.strokeStyle = '#52670F';
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.strokeStyle = '#C9D4A8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // Top accent
  ctx.fillStyle = '#6A7D1A';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EVENTOS · CERTIFICATE OF PARTICIPATION', W / 2, 110);

  // Title
  ctx.fillStyle = '#14150F';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('Certificate of Achievement', W / 2, 165);

  ctx.fillStyle = '#5E6256';
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText('This certificate is proudly presented to', W / 2, 230);

  // Recipient name
  ctx.fillStyle = '#52670F';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText(data.participantName || 'Participant', W / 2, 295);

  // Divider
  ctx.strokeStyle = '#C9D4A8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 180, 315);
  ctx.lineTo(W / 2 + 180, 315);
  ctx.stroke();

  ctx.fillStyle = '#5E6256';
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText(`for ${data.role || 'participation'} in`, W / 2, 360);

  // Event name
  ctx.fillStyle = '#14150F';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText(data.eventName || 'Event', W / 2, 405);

  // Date + organizer
  ctx.fillStyle = '#5E6256';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText(`Date: ${data.date}`, W / 2, 450);
  ctx.fillText(`Organized by ${data.organizerName || 'EventOS'}`, W / 2, 478);

  // Signature line (left)
  ctx.strokeStyle = '#14150F';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, 590);
  ctx.lineTo(340, 590);
  ctx.stroke();
  ctx.fillStyle = '#14150F';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText(data.organizerName || 'Organizer', 240, 612);
  ctx.fillStyle = '#5E6256';
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('Organizer', 240, 632);

  // Certificate code (center bottom)
  ctx.fillStyle = '#52670F';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText(data.code, W / 2, 600);
  ctx.fillStyle = '#9aa08f';
  ctx.font = '11px Arial, sans-serif';
  ctx.fillText(`Verify at /verify/certificate/${data.code}`, W / 2, 622);

  // QR code (right) linking to verification
  try {
    const verifyUrl = `${window.location.origin}/verify/certificate/${data.code}`;
    const qr = await qrToDataUrl(verifyUrl, 120);
    const qrImg = await loadImage(qr);
    ctx.drawImage(qrImg, W - 250, 540, 96, 96);
    ctx.fillStyle = '#5E6256';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Scan to verify', W - 202, 652);
  } catch {
    // QR is a nice-to-have; the certificate is still valid without it.
  }

  const link = document.createElement('a');
  link.download = `certificate-${data.code}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

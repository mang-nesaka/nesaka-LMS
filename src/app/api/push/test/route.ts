import { getSessionUserId } from '@/lib/auth';
import { isWebPushConfigured, sendPushToUsers } from '@/lib/webPush';

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: 'Sesi login tidak valid.' }, { status: 401 });
  if (!isWebPushConfigured()) {
    return Response.json({ error: 'Konfigurasi push notification belum tersedia.' }, { status: 503 });
  }

  const sentCount = await sendPushToUsers([userId], {
    title: 'Tes notifikasi LMS Nesaka',
    body: 'Notifikasi sudah terhubung ke perangkat ini.',
    url: '/dashboard',
  });

  if (sentCount === 0) {
    return Response.json({ error: 'Langganan perangkat tidak ditemukan.' }, { status: 404 });
  }

  return Response.json({ success: true });
}
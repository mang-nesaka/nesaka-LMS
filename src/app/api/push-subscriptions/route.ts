import { getSessionUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: 'Sesi login tidak valid.' }, { status: 401 });

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return Response.json({ error: 'Konfigurasi push notification belum tersedia.' }, { status: 503 });
  }

  return Response.json({ publicKey });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: 'Sesi login tidak valid.' }, { status: 401 });

  let body: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Data langganan tidak valid.' }, { status: 400 });
  }

  if (
    typeof body.endpoint !== 'string' ||
    body.endpoint.length > 4096 ||
    typeof body.keys?.p256dh !== 'string' ||
    body.keys.p256dh.length > 200 ||
    typeof body.keys.auth !== 'string' ||
    body.keys.auth.length > 100
  ) {
    return Response.json({ error: 'Data langganan tidak lengkap.' }, { status: 400 });
  }

  try {
    const endpoint = new URL(body.endpoint);
    const hostname = endpoint.hostname.toLowerCase();
    const allowedHost = hostname === 'fcm.googleapis.com' ||
      hostname === 'web.push.apple.com' ||
      hostname.endsWith('.push.services.mozilla.com') ||
      hostname.endsWith('.notify.windows.com');
    if (endpoint.protocol !== 'https:' || !allowedHost) throw new Error('Invalid push endpoint');
  } catch {
    return Response.json({ error: 'Endpoint push tidak valid.' }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: body.endpoint },
    create: {
      userId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    },
    update: {
      userId,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    },
  });

  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: 'Sesi login tidak valid.' }, { status: 401 });

  let body: { endpoint?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Data langganan tidak valid.' }, { status: 400 });
  }

  if (typeof body.endpoint !== 'string') {
    return Response.json({ error: 'Endpoint push tidak valid.' }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint: body.endpoint } });
  return Response.json({ success: true });
}
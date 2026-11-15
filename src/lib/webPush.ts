import { sendNotification, setVapidDetails } from 'web-push';
import { prisma } from '@/lib/prisma';

interface PushMessage {
  title: string;
  body: string;
  url: string;
}

export function isWebPushConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT,
  );
}

export async function sendPushToUsers(userIds: string[], message: PushMessage) {
  if (!isWebPushConfigured() || userIds.length === 0) return 0;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return 0;

  setVapidDetails(subject, publicKey, privateKey);
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: { in: [...new Set(userIds)] } },
  });
  const payload = JSON.stringify(message);

  const results = await Promise.allSettled(subscriptions.map(async (subscription) => {
    try {
      await sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      }, payload);
      return true;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.deleteMany({ where: { id: subscription.id } });
        return false;
      }
      console.error('Gagal mengirim push notification.', error);
      return false;
    }
  }));

  return results.filter((result) => result.status === 'fulfilled' && result.value).length;
}
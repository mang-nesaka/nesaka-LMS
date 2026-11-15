"use client";

import { Bell, BellOff, BellRing } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

function isPushSupported() {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;
}

function subscribeToPushSupport() {
  return () => {};
}

function decodeApplicationServerKey(value: string) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export default function PushNotificationControl() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const supported = useSyncExternalStore(subscribeToPushSupport, isPushSupported, () => false);

  useEffect(() => {
    if (!supported) return;

    void navigator.serviceWorker.getRegistration('/').then(async (registration) => {
      const subscription = await registration?.pushManager.getSubscription();
      setEnabled(Boolean(subscription));
    });
  }, [supported]);

  async function enableNotifications() {
    setBusy(true);
    setStatus('');
    try {
      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission;
      if (permission !== 'granted') throw new Error('Izin notifikasi tidak diberikan.');

      const keyResponse = await fetch('/api/push-subscriptions');
      const keyData = await keyResponse.json();
      if (!keyResponse.ok) throw new Error(keyData.error || 'Konfigurasi notifikasi belum tersedia.');

      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeApplicationServerKey(keyData.publicKey),
      });
      const response = await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Langganan notifikasi gagal disimpan.');

      setEnabled(true);
      setStatus('Notifikasi aktif di perangkat ini.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Notifikasi gagal diaktifkan.');
    } finally {
      setBusy(false);
    }
  }

  async function disableNotifications() {
    setBusy(true);
    setStatus('');
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch('/api/push-subscriptions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setEnabled(false);
      setStatus('Notifikasi dinonaktifkan di perangkat ini.');
    } catch {
      setStatus('Notifikasi gagal dinonaktifkan.');
    } finally {
      setBusy(false);
    }
  }

  async function sendTestNotification() {
    setBusy(true);
    setStatus('');
    try {
      const response = await fetch('/api/push/test', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Tes notifikasi gagal dikirim.');
      setStatus('Notifikasi tes dikirim.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Tes notifikasi gagal dikirim.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {enabled ? (
        <>
          <button
            type="button"
            onClick={sendTestNotification}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
            aria-label="Kirim tes notifikasi"
            title="Kirim tes notifikasi"
          >
            <BellRing className="h-4 w-4" />
            <span className="hidden sm:inline">Tes notifikasi</span>
          </button>
          <button
            type="button"
            onClick={disableNotifications}
            disabled={busy}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Nonaktifkan notifikasi di perangkat ini"
            title="Nonaktifkan notifikasi"
          >
            <BellOff className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={enableNotifications}
          disabled={busy || !supported}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
          aria-label={supported ? 'Aktifkan notifikasi' : 'Notifikasi tidak didukung browser ini'}
          title={supported ? 'Aktifkan notifikasi' : 'Notifikasi tidak didukung browser ini'}
        >
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifikasi</span>
        </button>
      )}
      {status && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-[60] max-w-[calc(100vw-2rem)] rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg"
        >
          {status}
        </div>
      )}
    </div>
  );
}
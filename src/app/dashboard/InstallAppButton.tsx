"use client";

import { Download, X } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function subscribeToStandaloneMode(onChange: () => void) {
  const mediaQuery = window.matchMedia('(display-mode: standalone)');
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [appWasInstalled, setAppWasInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const isInstalled = useSyncExternalStore(subscribeToStandaloneMode, isStandaloneMode, () => false);
  const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setAppWasInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (choice.outcome === 'accepted') setAppWasInstalled(true);
  }

  if (isInstalled || appWasInstalled) return null;

  return (
    <>
      <button
        type="button"
        onClick={installApp}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
        aria-label="Pasang LMS Nesaka di perangkat ini"
        title="Pasang LMS Nesaka di perangkat ini"
      >
        <Download className="h-4 w-4" />
        <span>Pasang</span>
      </button>
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onClick={() => setShowInstructions(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-title"
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 id="install-title" className="text-base font-bold text-slate-900">Pasang LMS Nesaka</h2>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {isIos
                ? 'Buka menu Bagikan di browser, lalu pilih Tambahkan ke Layar Utama.'
                : 'Buka menu browser, lalu pilih Instal aplikasi atau Tambahkan ke layar utama.'}
            </p>
          </section>
        </div>
      )}
    </>
  );
}
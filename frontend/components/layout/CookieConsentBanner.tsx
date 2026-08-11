"use client"

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  personalization: boolean;
};

type CookieConsent = {
  version: 1;
  choice: 'accepted' | 'refused' | 'custom';
  preferences: CookiePreferences;
  updatedAt: string;
};

const COOKIE_CONSENT_STORAGE_KEY = 'frilo.cookie-consent.v1';

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  personalization: false,
};

const ACCEPTED_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: true,
  personalization: true,
};

const PREFERENCE_ITEMS = [
  {
    key: 'necessary',
    title: 'Cookies nécessaires',
    description: 'Indispensables au fonctionnement, à la sécurité et à la mémorisation de votre choix.',
    locked: true,
  },
  {
    key: 'analytics',
    title: 'Mesure d’audience',
    description: 'Aide FRILO à comprendre les pages consultées pour améliorer le service.',
    locked: false,
  },
  {
    key: 'personalization',
    title: 'Personnalisation',
    description: 'Permet de conserver certains choix de navigation ou de présentation.',
    locked: false,
  },
] as const;

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function saveConsent(choice: CookieConsent['choice'], preferences: CookiePreferences) {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  const payload: CookieConsent = {
    version: 1,
    choice,
    preferences,
    updatedAt: new Date().toISOString(),
  };

  storage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
}

function hasExistingConsent() {
  try {
    const storage = getBrowserStorage();
    if (!storage) {
      return false;
    }

    const raw = storage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    return parsed.version === 1 && Boolean(parsed.choice);
  } catch {
    return false;
  }
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(() => !hasExistingConsent());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  if (!visible) {
    return null;
  }

  const acceptAll = () => {
    saveConsent('accepted', ACCEPTED_PREFERENCES);
    setVisible(false);
  };

  const refuseAll = () => {
    saveConsent('refused', DEFAULT_PREFERENCES);
    setVisible(false);
  };

  const saveCustom = () => {
    saveConsent('custom', preferences);
    setVisible(false);
  };

  const updatePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') {
      return;
    }

    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <section
      aria-label="Préférences de cookies"
      className={cn(
        "fixed inset-x-0 bottom-0 z-[60] flex max-h-[52vh] max-h-[52dvh] flex-col overflow-hidden border-t border-black bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 text-black md:px-6 md:pb-4 md:pt-4",
        settingsOpen && "max-h-[82vh] max-h-[82dvh]"
      )}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[1360px] flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-4">
        <div className="min-h-0 max-w-4xl overflow-y-auto pr-1 overscroll-contain">
          <p className="text-pretty text-[13px] leading-5 text-slate-900 md:text-sm md:leading-6">
            FRILO utilise des cookies nécessaires et, avec votre accord, des cookies de mesure et de personnalisation. Vous pouvez accepter, refuser ou gérer vos choix. Voir nos{' '}
            <Link href="/mentions-legales" className="font-semibold underline underline-offset-4">
              mentions légales
            </Link>{' '}
            et nos{' '}
            <Link href="/cgu" className="font-semibold underline underline-offset-4">
              CGU / CGV
            </Link>
            .
          </p>

          {settingsOpen && (
            <div className="mt-3 grid border border-slate-200 bg-slate-50 md:grid-cols-3">
              {PREFERENCE_ITEMS.map((item) => {
                const active = preferences[item.key];

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => updatePreference(item.key)}
                    disabled={item.locked}
                    className={cn(
                      "flex min-h-[96px] flex-col border-b border-slate-200 p-3 text-left last:border-b-0 md:min-h-[104px] md:border-b-0 md:border-r md:last:border-r-0",
                      item.locked ? "cursor-not-allowed bg-white" : "bg-white transition-colors hover:bg-slate-100"
                    )}
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className="text-sm font-black text-black">{item.title}</span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 flex h-6 w-10 shrink-0 items-center rounded-full border p-0.5 transition-colors",
                          active ? "border-black bg-black" : "border-slate-300 bg-white"
                        )}
                      >
                        <span
                          className={cn(
                            "h-4 w-4 rounded-full bg-white transition-transform",
                            active ? "translate-x-4" : "bg-slate-300"
                          )}
                        />
                      </span>
                    </span>
                    <span className="mt-2 text-xs leading-5 text-slate-600">{item.description}</span>
                    {item.locked && <span className="mt-auto pt-2 text-xs font-black text-slate-500">Toujours actif</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-1.5 border-t border-slate-200 pt-2 sm:grid-cols-[auto_auto_auto] sm:items-center md:gap-2 lg:justify-end lg:border-t-0 lg:pt-0">
          <button
            type="button"
            onClick={acceptAll}
            className="inline-flex min-h-9 items-center justify-center bg-[#333333] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:min-h-11 md:px-6"
          >
            Accepter
          </button>
          <button
            type="button"
            onClick={refuseAll}
            className="inline-flex min-h-9 items-center justify-center bg-[#333333] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:min-h-11 md:px-6"
          >
            Tout refuser
          </button>
          {settingsOpen ? (
            <button
              type="button"
              onClick={saveCustom}
              className="col-span-2 inline-flex min-h-9 items-center justify-center border border-black px-5 text-xs font-semibold uppercase tracking-[0.08em] text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:col-span-1 md:min-h-11 md:px-6"
            >
              Enregistrer
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="col-span-2 inline-flex min-h-8 items-center justify-center px-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#333333] underline underline-offset-4 transition-colors hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:col-span-1 md:min-h-11"
            >
              Gérer les paramètres
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

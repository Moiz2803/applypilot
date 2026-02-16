'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '../../lib/store';
import type { ParseResumeError, ParseResumeSuccess } from '../../lib/types';

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function OnboardingPage() {
  const {
    profile,
    preferences,
    onboarding,
    setOnboardingStep,
    completeOnboardingStep,
    upsertProfile,
    setPreferences,
    setResumeText,
    extensionInstalledHint,
    setExtensionInstalledHint,
  } = useAppStore();

  const [message, setMessage] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const completion = useMemo(() => Math.round((onboarding.completedSteps.length / 4) * 100), [onboarding.completedSteps]);

  const uploadResume = async (file: File) => {
    setUploading(true);
    setMessage('Parsing resume...');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/parse-resume', { method: 'POST', body: formData });
    const payload = (await response.json()) as ParseResumeSuccess | ParseResumeError;

    if (!response.ok || 'error' in payload) {
      const err = payload as ParseResumeError;
      setMessage(`${err.error} ${err.hint}`.trim());
      setUploading(false);
      return;
    }

    setResumeText(payload.text);
    completeOnboardingStep(2);
    setMessage(`Resume parsed using ${payload.meta.parser.toUpperCase()} (${payload.meta.chars} chars).`);
    setUploading(false);
  };

  return (
    <main className="space-y-5">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <p className="text-sm text-slate-600">Completion: {completion}%</p>
        <div className="mt-2 h-2 rounded bg-slate-100">
          <div className="h-2 rounded bg-teal" style={{ width: `${completion}%` }} />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((step) => (
          <button
            key={step}
            className={`rounded border px-3 py-2 text-sm ${onboarding.currentStep === step ? 'border-teal bg-teal/5' : 'border-slate-300 bg-white'}`}
            onClick={() => setOnboardingStep(step as 1 | 2 | 3 | 4)}
          >
            Step {step} {onboarding.completedSteps.includes(step) ? '?' : ''}
          </button>
        ))}
      </section>

      {onboarding.currentStep === 1 && (
        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Step 1: Basic profile</h2>
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Full name"
            value={profile.fullName}
            onChange={(e) => upsertProfile({ fullName: e.target.value })}
          />
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Email"
            value={profile.email}
            onChange={(e) => upsertProfile({ email: e.target.value })}
          />
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Phone"
            value={profile.phone}
            onChange={(e) => upsertProfile({ phone: e.target.value })}
          />
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Location"
            value={profile.location}
            onChange={(e) => upsertProfile({ location: e.target.value })}
          />
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="LinkedIn URL"
            value={profile.links.linkedIn}
            onChange={(e) => upsertProfile({ links: { linkedIn: e.target.value } })}
          />
          <button
            className="rounded bg-ink px-4 py-2 text-white"
            onClick={() => {
              completeOnboardingStep(1);
              setOnboardingStep(2);
            }}
          >
            Save and Continue
          </button>
        </section>
      )}

      {onboarding.currentStep === 2 && (
        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Step 2: Resume upload and parsing</h2>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void uploadResume(file);
              }
            }}
          />
          {uploading && <p className="text-sm text-slate-600">Parsing...</p>}
          <p className="text-xs text-slate-600">If PDF fails, upload OCRed PDF, DOCX, or TXT.</p>
          <button
            className="rounded bg-ink px-4 py-2 text-white"
            onClick={() => {
              completeOnboardingStep(2);
              setOnboardingStep(3);
            }}
          >
            Continue
          </button>
        </section>
      )}

      {onboarding.currentStep === 3 && (
        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Step 3: Preferences</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={preferences.visaNeeded}
              onChange={(e) => setPreferences({ visaNeeded: e.target.checked })}
            />
            I need visa sponsorship support
          </label>
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Target roles (comma separated)"
            value={preferences.targetRoles.join(', ')}
            onChange={(e) => setPreferences({ targetRoles: splitCsv(e.target.value) })}
          />
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Target locations (comma separated)"
            value={preferences.targetLocations.join(', ')}
            onChange={(e) => setPreferences({ targetLocations: splitCsv(e.target.value) })}
          />
          <button
            className="rounded bg-ink px-4 py-2 text-white"
            onClick={() => {
              completeOnboardingStep(3);
              setOnboardingStep(4);
            }}
          >
            Save and Continue
          </button>
        </section>
      )}

      {onboarding.currentStep === 4 && (
        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Step 4: Install extension</h2>
          <p className="text-sm text-slate-700">
            Load extension from <code>apps/extension/dist</code> in Chrome Developer Mode. The copilot provides
            compatibility detection, preview autofill, and quick save/applied actions.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={extensionInstalledHint}
              onChange={(e) => setExtensionInstalledHint(e.target.checked)}
            />
            I installed the extension locally
          </label>
          <div className="flex gap-2">
            <button
              className="rounded bg-ink px-4 py-2 text-white"
              onClick={() => {
                completeOnboardingStep(4);
                setMessage('Onboarding completed.');
              }}
            >
              Finish Onboarding
            </button>
            <Link href="/dashboard" className="rounded border border-slate-300 px-4 py-2">
              Go to Dashboard
            </Link>
          </div>
        </section>
      )}

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </main>
  );
}

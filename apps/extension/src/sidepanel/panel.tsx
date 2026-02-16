import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  CircleX,
  ClipboardList,
  Link as LinkIcon,
  Save,
  WandSparkles,
} from 'lucide-react';
import { canRunAutofillAction, getFeatureAccess, scoreATS, scoreJobMatch } from '@visa-ats/shared';
import { ScoreRing } from '@visa-ats/ui';
import { useEffect, useMemo, useState } from 'react';
import type {
  AutofillFieldPreview,
  CandidateProfile,
  ExtractedJob,
  JobTrackingPayload,
  PortalDetectionResult,
} from '../shared/types';

const defaultProfile: CandidateProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  linkedIn: '',
  website: '',
  city: '',
  resumeText: '',
};

interface ToastItem {
  id: string;
  tone: 'success' | 'error' | 'info';
  message: string;
}

function monthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
}

async function queryActiveTab<T>(message: object): Promise<T> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;

  if (!tabId) {
    throw new Error('No active tab found.');
  }

  return (await chrome.tabs.sendMessage(tabId, message)) as T;
}

function visaValue(level: 'High' | 'Medium' | 'Low') {
  if (level === 'High') return 85;
  if (level === 'Medium') return 58;
  return 28;
}

export function SidePanelApp() {
  const [compat, setCompat] = useState<PortalDetectionResult | null>(null);
  const [job, setJob] = useState<ExtractedJob | null>(null);
  const [profile, setProfile] = useState<CandidateProfile>(defaultProfile);
  const [tier, setTier] = useState<'free' | 'pro' | 'pro_plus' | 'elite'>('free');
  const [autofillActionsThisMonth, setAutofillActionsThisMonth] = useState(0);
  const [usageMonth, setUsageMonth] = useState(monthKey());
  const [preview, setPreview] = useState<AutofillFieldPreview[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);

  const access = getFeatureAccess(tier);

  const analysis = useMemo(() => {
    if (!job || !profile.resumeText) {
      return null;
    }

    return {
      ats: scoreATS({ resumeText: profile.resumeText, jobDescription: job.description }),
      match: scoreJobMatch(profile.resumeText, job.description),
    };
  }, [job, profile.resumeText]);

  const usageState = useMemo(
    () => ({ tier, atsScansThisMonth: 0, jobAnalysesThisMonth: 0, autofillActionsThisMonth }),
    [tier, autofillActionsThisMonth],
  );

  const pushToast = (message: string, tone: ToastItem['tone'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 2600);
  };

  const syncStorage = async (next: CandidateProfile) => {
    setProfile(next);
    await chrome.storage.local.set({ candidateProfile: next, tier, autofillActionsThisMonth, usageMonth });
  };

  const loadStored = async () => {
    const saved = await chrome.storage.local.get(['candidateProfile', 'tier', 'autofillActionsThisMonth', 'usageMonth']);

    if (saved.candidateProfile) setProfile(saved.candidateProfile as CandidateProfile);
    if (saved.tier === 'free' || saved.tier === 'pro' || saved.tier === 'pro_plus' || saved.tier === 'elite') {
      setTier(saved.tier);
    }

    const month = monthKey();
    const storedMonth = typeof saved.usageMonth === 'string' ? saved.usageMonth : month;
    if (storedMonth !== month) {
      setUsageMonth(month);
      setAutofillActionsThisMonth(0);
      await chrome.storage.local.set({ usageMonth: month, autofillActionsThisMonth: 0 });
    } else {
      setUsageMonth(storedMonth);
      setAutofillActionsThisMonth(Number(saved.autofillActionsThisMonth ?? 0));
    }
  };

  const detectCompatibility = async () => {
    try {
      setCompat(await queryActiveTab<PortalDetectionResult>({ type: 'GET_PORTAL_COMPAT' }));
    } catch {
      setCompat({ portal: 'unknown', compatible: false, reasons: ['Unable to detect portal'], hostname: 'n/a' });
    }
  };

  const extract = async () => {
    try {
      const extracted = await queryActiveTab<ExtractedJob>({ type: 'EXTRACT_JOB' });
      setJob(extracted);
      pushToast('Job extracted.', 'success');
    } catch {
      pushToast('Failed to extract job from page.', 'error');
    }
  };

  const previewAutofill = async () => {
    try {
      const result = await queryActiveTab<{ preview: AutofillFieldPreview[] }>({ type: 'PREVIEW_AUTOFILL', profile });
      setPreview(result.preview);
      pushToast('Preview ready. Review fields below.', 'info');
    } catch {
      pushToast('Unable to build autofill preview.', 'error');
    }
  };

  const applyAutofill = async () => {
    if (!canRunAutofillAction(usageState)) {
      pushToast('Autofill locked on current tier.', 'error');
      return;
    }

    try {
      const result = await queryActiveTab<{ results: Array<{ label: string; success: boolean }> }>({
        type: 'APPLY_AUTOFILL',
        preview,
      });
      const failed = result.results.filter((entry) => !entry.success).length;
      const next = autofillActionsThisMonth + 1;
      setAutofillActionsThisMonth(next);
      await chrome.storage.local.set({ autofillActionsThisMonth: next, usageMonth, tier, candidateProfile: profile });
      pushToast(`Autofill complete. ${failed} fallback fields copied.`, failed > 0 ? 'info' : 'success');
    } catch {
      pushToast('Autofill failed.', 'error');
    }
  };

  const trackJob = async (status: 'saved' | 'applied') => {
    try {
      const payload = await queryActiveTab<JobTrackingPayload>({ type: 'GET_JOB_TRACKING_PAYLOAD', status });
      const existing = await chrome.storage.local.get(['trackedJobs']);
      const tracked = Array.isArray(existing.trackedJobs) ? (existing.trackedJobs as JobTrackingPayload[]) : [];
      await chrome.storage.local.set({ trackedJobs: [payload, ...tracked] });
      pushToast(status === 'applied' ? 'Marked applied.' : 'Job saved.', 'success');
    } catch {
      pushToast('Failed to update tracker.', 'error');
    }
  };

  const copyKeywords = async () => {
    const keywords = (analysis?.match.missingKeywords ?? []).join(', ');
    if (!keywords) {
      pushToast('No missing keywords to copy.', 'info');
      return;
    }

    try {
      await navigator.clipboard.writeText(keywords);
      pushToast('Keywords copied to clipboard.', 'success');
    } catch {
      pushToast('Unable to copy keywords.', 'error');
    }
  };

  useEffect(() => {
    void loadStored();
    void detectCompatibility();
    void extract();
  }, []);

  return (
    <div className="ap-shell">
      <section className="ap-hero">
        <div className="ap-hero-head">
          <div className="ap-brand">
            <img src="src/assets/icon48.png" alt="ApplyPilot" className="ap-logo" />
            <div>
              <p className="ap-name">ApplyPilot</p>
              <p className="ap-tag">Smarter applications. Faster offers.</p>
            </div>
          </div>
          <span className={`ap-chip ${compat?.compatible ? 'ap-chip-ok' : 'ap-chip-idle'}`}>
            {compat?.compatible ? `${compat.portal.toUpperCase()} compatible` : 'Ready'}
          </span>
        </div>

        {!analysis && <p className="ap-muted">Add resume text in profile fields to unlock Job Match, Visa, and ATS scores.</p>}
        {analysis && (
          <div className="ap-score-grid">
            <ScoreRing value={analysis.match.matchScore} size={116} label="Job Match" />
            <ScoreRing value={visaValue(analysis.match.visaFriendliness.level)} size={96} label={`Visa ${analysis.match.visaFriendliness.level}`} />
            <ScoreRing value={analysis.ats.score} size={96} label="ATS Score" />
          </div>
        )}
      </section>

      <section className="ap-panel">
        <div className="ap-panel-head">
          <h3>What you&apos;re missing</h3>
          <div className="ap-inline-actions">
            <button onClick={() => void copyKeywords()}>Copy keywords</button>
            <button onClick={() => void chrome.tabs.create({ url: 'http://localhost:3000/resume-tailor' })}>Tailor resume</button>
          </div>
        </div>
        <div className="ap-chip-wrap">
          {(analysis?.match.missingKeywords ?? []).slice(0, 12).map((keyword) => (
            <span key={keyword} className="ap-keyword">{keyword}</span>
          ))}
          {!analysis?.match.missingKeywords.length && <p className="ap-muted">No keyword gaps detected.</p>}
        </div>
      </section>

      <section className="ap-panel">
        <h3>Actions</h3>
        <div className="ap-primary-actions">
          <button className="ap-btn-primary" onClick={() => void previewAutofill()}>
            <ClipboardList className="h-4 w-4" /> Preview Autofill
          </button>
          <button className="ap-btn-secondary" onClick={() => void applyAutofill()}>
            <BriefcaseBusiness className="h-4 w-4" /> Autofill Now
          </button>
        </div>
        <div className="ap-mini-actions">
          <button onClick={() => void trackJob('saved')}><Save className="h-3.5 w-3.5" /> Save Job</button>
          <button onClick={() => void trackJob('applied')}><CircleCheck className="h-3.5 w-3.5" /> Mark Applied</button>
        </div>
        <p className="ap-muted">Assistive only. Never auto-submits and never fills passwords.</p>
      </section>

      <section className="ap-panel">
        <button className="ap-accordion" onClick={() => setJobOpen((open) => !open)}>
          <span>Job summary</span>
          {jobOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {jobOpen && (
          <div className="ap-fields">
            {job ? (
              <>
                <p className="ap-title">{job.title}</p>
                <p className="ap-muted">{job.company}</p>
                <p className="ap-muted">Portal: {job.portal}</p>
              </>
            ) : (
              <p className="ap-muted">No job extracted yet.</p>
            )}
          </div>
        )}
      </section>

      <section className="ap-panel">
        <button className="ap-accordion" onClick={() => setProfileOpen((open) => !open)}>
          <span>Profile quick fields</span>
          {profileOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {profileOpen && (
          <div className="ap-fields">
            <label>
              Tier
              <select
                value={tier}
                onChange={(e) => {
                  const next = e.target.value as 'free' | 'pro' | 'pro_plus' | 'elite';
                  setTier(next);
                  void chrome.storage.local.set({ tier: next });
                }}
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="pro_plus">Pro+</option>
                <option value="elite">Elite</option>
              </select>
            </label>
            <label>
              Email
              <input value={profile.email || ''} onChange={(e) => void syncStorage({ ...profile, email: e.target.value })} />
            </label>
            <label>
              Phone
              <input value={profile.phone || ''} onChange={(e) => void syncStorage({ ...profile, phone: e.target.value })} />
            </label>
            <label>
              Resume text
              <textarea rows={3} value={profile.resumeText || ''} onChange={(e) => void syncStorage({ ...profile, resumeText: e.target.value })} />
            </label>
            <p className="ap-muted">
              Autofill {access.canAutofill ? 'enabled' : 'locked'} | Usage {autofillActionsThisMonth}/
              {Number.isFinite(access.autofillLimit) ? access.autofillLimit : 'Unlimited'}
            </p>
          </div>
        )}
      </section>

      {preview.length > 0 && (
        <section className="ap-panel">
          <h3>Autofill preview</h3>
          <div className="ap-preview-list">
            {preview.map((entry, idx) => (
              <label key={entry.key} className="ap-preview-row">
                <input
                  type="checkbox"
                  checked={entry.enabled}
                  onChange={(e) => {
                    const next = [...preview];
                    next[idx] = { ...entry, enabled: e.target.checked };
                    setPreview(next);
                  }}
                />
                <span>{entry.label}</span>
                <span className="ap-muted">{entry.value}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      <div className="ap-toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`ap-toast ap-toast-${toast.tone}`}>
            {toast.tone === 'error' ? <CircleX className="h-4 w-4" /> : <CircleCheck className="h-4 w-4" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <a className="ap-footer-link" href="http://localhost:3000/resume-tailor" target="_blank" rel="noreferrer">
        <WandSparkles className="h-4 w-4" /> Tailor resume in web app
      </a>
      <a className="ap-footer-link ap-footer-subtle" href="http://localhost:3000/dashboard" target="_blank" rel="noreferrer">
        <LinkIcon className="h-4 w-4" /> Open ApplyPilot dashboard
      </a>
    </div>
  );
}

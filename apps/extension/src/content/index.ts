import { applyAutofill, buildAutofillPreview } from './autofill';
import { mountCompatibilityBadge, removeCompatibilityBadge } from './compatBadge';
import { detectPortal } from './portalDetect';
import type {
  CandidateProfile,
  ExtractedJob,
  AutofillFieldPreview,
  JobTrackingPayload,
  PortalDetectionResult,
} from '../shared/types';

let cachedDetection: PortalDetectionResult = detectPortal(document, window.location);

function extractByPortal(portal: PortalDetectionResult['portal']): string {
  const selectorsByPortal: Record<string, string[]> = {
    workday: ['[data-automation-id="jobPostingDescription"]', '[data-automation-id="jobPostingDescription"] *'],
    greenhouse: ['#content .section-wrapper', '#job_description', '#application .content'],
    lever: ['.posting-page .section-wrapper', '.main .section', '[data-qa="job-description"]'],
    icims: ['#jobDescriptionText', '.iCIMS_Expandable_Text', '#icims_content'],
    taleo: ['#requisitionDescriptionInterface', '.contentlinepanel', '#careerSection'],
  };

  const selectors = selectorsByPortal[portal] ?? [];
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const content = element?.textContent?.trim();
    if (content && content.length > 120) {
      return content;
    }
  }

  return document.body?.innerText?.slice(0, 12000) ?? '';
}

function extractJobDescription(): ExtractedJob {
  cachedDetection = detectPortal(document, window.location);

  const titleCandidates = [
    document.querySelector('h1')?.textContent,
    document.querySelector('[data-test="job-title"]')?.textContent,
    document.querySelector('[data-automation-id="jobPostingHeader"]')?.textContent,
  ];

  const companyCandidates = [
    document.querySelector('[data-test="job-company"]')?.textContent,
    document.querySelector('.company')?.textContent,
    document.querySelector('[data-automation-id="company"]')?.textContent,
  ];

  return {
    title: titleCandidates.find(Boolean)?.trim() || 'Unknown role',
    company: companyCandidates.find(Boolean)?.trim() || 'Unknown company',
    description: extractByPortal(cachedDetection.portal),
    portal: cachedDetection.portal,
  };
}

function getJobTrackingPayload(status: 'saved' | 'applied'): JobTrackingPayload {
  const extracted = extractJobDescription();

  return {
    company: extracted.company,
    role: extracted.title,
    jobUrl: window.location.href,
    portal: extracted.portal,
    status,
    appliedViaExtension: status === 'applied',
    source: 'extension',
  };
}

function syncCompatibilityBadge() {
  cachedDetection = detectPortal(document, window.location);
  if (cachedDetection.compatible) {
    mountCompatibilityBadge();
  } else {
    removeCompatibilityBadge();
  }
}

syncCompatibilityBadge();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'GET_PORTAL_COMPAT') {
    cachedDetection = detectPortal(document, window.location);
    sendResponse(cachedDetection);
    return true;
  }

  if (message?.type === 'EXTRACT_JOB') {
    sendResponse(extractJobDescription());
    return true;
  }

  if (message?.type === 'PREVIEW_AUTOFILL') {
    const profile = message.profile as CandidateProfile;
    const preview = buildAutofillPreview(profile);
    sendResponse({ preview });
    return true;
  }

  if (message?.type === 'APPLY_AUTOFILL') {
    const preview = message.preview as AutofillFieldPreview[];
    const results = applyAutofill(preview);
    sendResponse({ results, submitted: false });
    return true;
  }

  if (message?.type === 'GET_JOB_TRACKING_PAYLOAD') {
    const status = message.status === 'applied' ? 'applied' : 'saved';
    sendResponse(getJobTrackingPayload(status));
    return true;
  }

  return false;
});

export type PortalType = 'workday' | 'greenhouse' | 'lever' | 'icims' | 'taleo' | 'unknown';

export interface PortalDetectionResult {
  portal: PortalType;
  compatible: boolean;
  reasons: string[];
  hostname: string;
}

export interface CandidateProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  website?: string;
  city?: string;
  resumeText?: string;
}

export type AutofillFieldType = 'text' | 'textarea' | 'select' | 'radio';

export interface AutofillFieldPreview {
  key: string;
  label: string;
  value: string;
  enabled: boolean;
  fieldType: AutofillFieldType;
  sourceKey: keyof CandidateProfile;
  selectorHint: string;
  confidence: number;
}

export interface ExtractedJob {
  title: string;
  company: string;
  description: string;
  portal: PortalType;
}

export interface ExtensionUsageState {
  tier: 'free' | 'pro' | 'pro_plus' | 'elite';
  autofillActionsThisMonth: number;
  usageMonthKey: string;
}

export interface JobTrackingPayload {
  company: string;
  role: string;
  jobUrl: string;
  portal: PortalType;
  status: 'saved' | 'applied';
  appliedViaExtension: boolean;
  source: 'extension';
}

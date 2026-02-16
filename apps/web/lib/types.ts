export type Tier = 'free' | 'pro' | 'pro_plus' | 'elite';

export type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export interface ProfileLinks {
  linkedIn: string;
  github: string;
  website: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  links: ProfileLinks;
}

export interface UserPreferences {
  visaNeeded: boolean;
  targetRoles: string[];
  targetLocations: string[];
  skillTags: string[];
}

export interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4;
  completedSteps: number[];
  completedAt?: string;
}

export interface JobRecord {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  source: 'web' | 'extension';
  appliedViaExtension: boolean;
  jobUrl?: string;
  portal?: string;
  notes?: string;
  appliedDate?: string;
  interviewDate?: string;
  rejectionDate?: string;
  offerDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisRecord {
  id: string;
  createdAt: string;
  source: 'web' | 'extension';
  matchScore: number;
  missingKeywords: string[];
  company?: string;
  role?: string;
}

export interface AppState {
  tier: Tier;
  resumeText: string;
  profile: UserProfile;
  preferences: UserPreferences;
  onboarding: OnboardingState;
  extensionInstalledHint: boolean;
  atsScansThisMonth: number;
  jobAnalysesThisMonth: number;
  autofillActionsThisMonth: number;
  jobs: JobRecord[];
  recentAnalyses: AnalysisRecord[];
}

export interface ParseResumeSuccess {
  text: string;
  meta: {
    parser: 'pdf' | 'docx' | 'txt';
    pages?: number;
    chars: number;
  };
}

export interface ParseResumeError {
  error: string;
  code: 'BAD_REQUEST' | 'UNSUPPORTED_FILE' | 'FILE_TOO_LARGE' | 'PARSE_FAILED';
  hint: string;
}

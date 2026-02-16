export type PlanTier = 'free' | 'pro' | 'pro_plus' | 'elite';

export interface UsageState {
  atsScansThisMonth: number;
  jobAnalysesThisMonth: number;
  autofillActionsThisMonth: number;
  tier: PlanTier;
}

export const LIMITS = {
  free: {
    scans: 10,
    autofillActions: 0,
    canAutofill: false,
    canRewrite: false,
    canResumeTailor: false,
    canInterviewPrep: false,
    canVisaRadar: false,
    canAnalytics: false,
  },
  pro: {
    scans: Number.POSITIVE_INFINITY,
    autofillActions: Number.POSITIVE_INFINITY,
    canAutofill: true,
    canRewrite: false,
    canResumeTailor: false,
    canInterviewPrep: false,
    canVisaRadar: false,
    canAnalytics: false,
  },
  pro_plus: {
    scans: Number.POSITIVE_INFINITY,
    autofillActions: Number.POSITIVE_INFINITY,
    canAutofill: true,
    canRewrite: true,
    canResumeTailor: true,
    canInterviewPrep: true,
    canVisaRadar: false,
    canAnalytics: false,
  },
  elite: {
    scans: Number.POSITIVE_INFINITY,
    autofillActions: Number.POSITIVE_INFINITY,
    canAutofill: true,
    canRewrite: true,
    canResumeTailor: true,
    canInterviewPrep: true,
    canVisaRadar: true,
    canAnalytics: true,
  },
};

export function canRunAtsScan(state: UsageState): boolean {
  return state.tier !== 'free' || state.atsScansThisMonth < LIMITS.free.scans;
}

export function canRunJobAnalysis(state: UsageState): boolean {
  return state.tier !== 'free' || state.jobAnalysesThisMonth < LIMITS.free.scans;
}

export function canRunAutofillAction(state: UsageState): boolean {
  const access = LIMITS[state.tier];
  if (!access.canAutofill) {
    return false;
  }

  return state.tier !== 'free' || state.autofillActionsThisMonth < LIMITS.free.autofillActions;
}

export function getFeatureAccess(tier: PlanTier) {
  const current = LIMITS[tier];

  return {
    canAutofill: current.canAutofill,
    canRewrite: current.canRewrite,
    canResumeTailor: current.canResumeTailor,
    canInterviewPrep: current.canInterviewPrep,
    canVisaRadar: current.canVisaRadar,
    canAnalytics: current.canAnalytics,
    autofillLimit: current.autofillActions,
    scanLimit: current.scans,
  };
}

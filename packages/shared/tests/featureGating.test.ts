import { describe, expect, it } from 'vitest';
import {
  canRunAtsScan,
  canRunAutofillAction,
  canRunJobAnalysis,
  getFeatureAccess,
} from '../src/featureGating';

describe('featureGating', () => {
  it('enforces free limits for scan-gated features', () => {
    const freeMaxed = {
      tier: 'free' as const,
      atsScansThisMonth: 10,
      jobAnalysesThisMonth: 10,
      autofillActionsThisMonth: 0,
    };

    expect(canRunAtsScan(freeMaxed)).toBe(false);
    expect(canRunJobAnalysis(freeMaxed)).toBe(false);
    expect(canRunAutofillAction(freeMaxed)).toBe(false);
  });

  it('allows pro unlimited scans/autofill but keeps advanced features for higher tiers', () => {
    const proState = {
      tier: 'pro' as const,
      atsScansThisMonth: 999,
      jobAnalysesThisMonth: 999,
      autofillActionsThisMonth: 999,
    };

    expect(canRunAtsScan(proState)).toBe(true);
    expect(canRunJobAnalysis(proState)).toBe(true);
    expect(canRunAutofillAction(proState)).toBe(true);
    expect(getFeatureAccess('pro').canResumeTailor).toBe(false);
    expect(getFeatureAccess('pro_plus').canInterviewPrep).toBe(true);
    expect(getFeatureAccess('elite').canVisaRadar).toBe(true);
  });
});

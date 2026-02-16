'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AnalysisRecord,
  AppState,
  JobRecord,
  JobStatus,
  ProfileLinks,
  Tier,
  UserPreferences,
  UserProfile,
} from './types';

type ProfilePatch = Omit<Partial<UserProfile>, 'links'> & {
  links?: Partial<ProfileLinks>;
};

interface Store extends AppState {
  setTier: (tier: Tier) => void;
  setResumeText: (resumeText: string) => void;
  upsertProfile: (profilePatch: ProfilePatch) => void;
  setPreferences: (patch: Partial<UserPreferences>) => void;
  completeOnboardingStep: (step: number) => void;
  setOnboardingStep: (step: 1 | 2 | 3 | 4) => void;
  setExtensionInstalledHint: (installed: boolean) => void;
  incrementAtsScans: () => void;
  incrementJobAnalyses: () => void;
  incrementAutofillActions: () => void;
  addSkillTags: (tags: string[]) => void;
  addRecentAnalysis: (analysis: Omit<AnalysisRecord, 'id' | 'createdAt'>) => void;
  addJob: (job: Omit<JobRecord, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateJob: (id: string, patch: Partial<JobRecord>) => void;
  transitionJobStatus: (id: string, status: JobStatus) => void;
  removeJob: (id: string) => void;
}

const defaultProfile: UserProfile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  links: {
    linkedIn: '',
    github: '',
    website: '',
  },
};

const defaultPreferences: UserPreferences = {
  visaNeeded: true,
  targetRoles: [],
  targetLocations: [],
  skillTags: [],
};

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      tier: 'free',
      resumeText: '',
      profile: defaultProfile,
      preferences: defaultPreferences,
      onboarding: {
        currentStep: 1,
        completedSteps: [],
      },
      extensionInstalledHint: false,
      atsScansThisMonth: 0,
      jobAnalysesThisMonth: 0,
      autofillActionsThisMonth: 0,
      jobs: [],
      recentAnalyses: [],
      setTier: (tier) => set({ tier }),
      setResumeText: (resumeText) => set({ resumeText }),
      upsertProfile: (profilePatch) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...profilePatch,
            links: {
              ...state.profile.links,
              ...(profilePatch.links ?? {}),
            },
          },
        })),
      setPreferences: (patch) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...patch,
          },
        })),
      completeOnboardingStep: (step) =>
        set((state) => {
          const nextCompleted = [...new Set([...state.onboarding.completedSteps, step])];
          const done = [1, 2, 3, 4].every((required) => nextCompleted.includes(required));
          const current = state.onboarding.currentStep;
          const promoted = Math.max(current, step + 1);
          const nextStep: 1 | 2 | 3 | 4 =
            promoted <= 1 ? 1 : promoted === 2 ? 2 : promoted === 3 ? 3 : 4;

          return {
            onboarding: {
              currentStep: nextStep,
              completedSteps: nextCompleted,
              completedAt: done ? new Date().toISOString() : state.onboarding.completedAt,
            },
          };
        }),
      setOnboardingStep: (step) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            currentStep: step,
          },
        })),
      setExtensionInstalledHint: (installed) => set({ extensionInstalledHint: installed }),
      incrementAtsScans: () => set((state) => ({ atsScansThisMonth: state.atsScansThisMonth + 1 })),
      incrementJobAnalyses: () => set((state) => ({ jobAnalysesThisMonth: state.jobAnalysesThisMonth + 1 })),
      incrementAutofillActions: () =>
        set((state) => ({ autofillActionsThisMonth: state.autofillActionsThisMonth + 1 })),
      addSkillTags: (tags) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            skillTags: [...new Set([...state.preferences.skillTags, ...tags.map((tag) => tag.trim()).filter(Boolean)])],
          },
        })),
      addRecentAnalysis: (analysis) =>
        set((state) => ({
          recentAnalyses: [
            {
              ...analysis,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.recentAnalyses,
          ].slice(0, 20),
        })),
      addJob: (job) => {
        const id = crypto.randomUUID();
        set((state) => ({
          jobs: [
            {
              ...job,
              id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state.jobs,
          ],
        }));

        return id;
      },
      updateJob: (id, patch) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...patch, updatedAt: new Date().toISOString() } : job,
          ),
        })),
      transitionJobStatus: (id, status) =>
        set((state) => ({
          jobs: state.jobs.map((job) => {
            if (job.id !== id) return job;

            const now = new Date().toISOString();
            const datePatch: Partial<JobRecord> = {};
            if (status === 'applied' && !job.appliedDate) datePatch.appliedDate = now;
            if (status === 'interview' && !job.interviewDate) datePatch.interviewDate = now;
            if (status === 'rejected' && !job.rejectionDate) datePatch.rejectionDate = now;
            if (status === 'offer' && !job.offerDate) datePatch.offerDate = now;

            return {
              ...job,
              status,
              ...datePatch,
              updatedAt: now,
            };
          }),
        })),
      removeJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
        })),
    }),
    {
      name: 'visa-ats-web-state',
    },
  ),
);

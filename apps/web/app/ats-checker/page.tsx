import { AtsChecker } from '../../components/ats-checker';

export default function AtsCheckerPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">ATS and Keyword Gap Analyzer</h1>
      <p className="text-sm text-slate-700">
        Paste a job description, compare with your resume, and add missing keywords directly to your profile skills.
      </p>
      <AtsChecker />
    </main>
  );
}

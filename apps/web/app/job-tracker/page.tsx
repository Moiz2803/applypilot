'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '../../lib/store';
import type { JobStatus } from '../../lib/types';

const statuses: JobStatus[] = ['saved', 'applied', 'interview', 'offer', 'rejected'];

export default function JobTrackerPage() {
  const { jobs, addJob, transitionJobStatus, updateJob, removeJob } = useAppStore();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JobStatus>('all');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchHit =
        `${job.company} ${job.role} ${job.portal || ''}`.toLowerCase().includes(search.toLowerCase().trim());
      const statusHit = statusFilter === 'all' || job.status === statusFilter;
      return searchHit && statusHit;
    });
  }, [jobs, search, statusFilter]);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Job Tracker</h1>

      <div className="grid gap-2 rounded-xl border border-slate-300 bg-white p-4 md:grid-cols-4">
        <input
          className="rounded border border-slate-300 p-2"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          className="rounded border border-slate-300 p-2"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <button
          className="rounded bg-ink px-4 py-2 text-white"
          onClick={() => {
            if (!company || !role) return;
            addJob({
              company,
              role,
              status: 'saved',
              source: 'web',
              appliedViaExtension: false,
            });
            setCompany('');
            setRole('');
          }}
        >
          Add Job
        </button>
      </div>

      <div className="grid gap-2 rounded-xl border border-slate-300 bg-white p-4 md:grid-cols-2">
        <input
          className="rounded border border-slate-300 p-2"
          placeholder="Search company, role, portal"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded border border-slate-300 p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | JobStatus)}
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filteredJobs.map((job) => (
          <article key={job.id} className="rounded border border-slate-200 bg-white p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">
                {job.company} - {job.role}
              </p>
              <button className="text-xs text-red-600" onClick={() => removeJob(job.id)}>
                Delete
              </button>
            </div>
            <p className="text-slate-600">
              Source: {job.source} {job.appliedViaExtension ? '| Applied via extension' : ''}
            </p>
            <p className="text-slate-600">Portal: {job.portal || 'N/A'}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <select
                className="rounded border border-slate-300 p-1"
                value={job.status}
                onChange={(e) => transitionJobStatus(job.id, e.target.value as JobStatus)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                className="min-w-56 flex-1 rounded border border-slate-300 p-1"
                placeholder="Notes"
                value={job.notes || ''}
                onChange={(e) => updateJob(job.id, { notes: e.target.value })}
              />
            </div>

            <div className="mt-2 grid gap-1 text-xs text-slate-500 md:grid-cols-2">
              <p>Applied: {job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : '-'}</p>
              <p>Interview: {job.interviewDate ? new Date(job.interviewDate).toLocaleDateString() : '-'}</p>
              <p>Rejected: {job.rejectionDate ? new Date(job.rejectionDate).toLocaleDateString() : '-'}</p>
              <p>Offer: {job.offerDate ? new Date(job.offerDate).toLocaleDateString() : '-'}</p>
            </div>

            <p className="mt-1 text-xs text-slate-500">Updated: {new Date(job.updatedAt).toLocaleString()}</p>
          </article>
        ))}
        {filteredJobs.length === 0 && <p className="text-sm text-slate-600">No jobs match the current filters.</p>}
      </div>
    </main>
  );
}

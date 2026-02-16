'use client';

import { UploadCloud, FileCheck2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, Textarea, useToast } from '@visa-ats/ui';
import { useAppStore } from '../../lib/store';
import type { ParseResumeError, ParseResumeSuccess } from '../../lib/types';

export default function ResumePage() {
  const { resumeText, setResumeText } = useAppStore();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setMessage('Parsing file...');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/parse-resume', { method: 'POST', body: formData });
    const payload = (await response.json()) as ParseResumeSuccess | ParseResumeError;

    if (!response.ok || 'error' in payload) {
      const err = payload as ParseResumeError;
      const text = `${err.error} ${err.hint}`.trim();
      setMessage(text);
      pushToast(text, 'error');
      setLoading(false);
      return;
    }

    setResumeText(payload.text ?? '');
    const successText = `Parsed via ${payload.meta.parser.toUpperCase()} (${payload.meta.chars} chars).`;
    setMessage(successText);
    pushToast('Resume parsed successfully.', 'success');
    setLoading(false);
  };

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Resume Upload</h1>
      <Card title="Drag and drop your resume" subtitle="PDF, DOCX, or TXT. Local-first parsing.">
        <div
          className={`rounded-2xl border-2 border-dashed p-8 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              void handleUpload(file);
            }
          }}
        >
          <UploadCloud className="mx-auto mb-2 h-7 w-7 text-blue-600" />
          <p className="text-sm text-slate-700">Drop file here or use file picker.</p>
          <input
            className="mx-auto mt-3 block text-sm"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
          />
          <p className="mt-2 text-xs text-slate-500">If PDF is scanned, upload OCRed PDF or DOCX for better extraction.</p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
          <AlertTriangle className="h-4 w-4" /> Max upload size: 8MB
        </div>
        {loading && <p className="mt-2 text-sm text-slate-600">Parsing in progress...</p>}
        {message && (
          <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
            <FileCheck2 className="h-4 w-4" /> {message}
          </p>
        )}
      </Card>

      <Card title="Resume Text" subtitle="Edit manually if needed.">
        <Textarea className="h-96" value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
        <div className="mt-3">
          <Button variant="ghost" onClick={() => pushToast('Resume text saved locally.', 'info')}>Save locally</Button>
        </div>
      </Card>
    </main>
  );
}

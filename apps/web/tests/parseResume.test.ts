import { describe, expect, it } from 'vitest';
import { MAX_RESUME_FILE_BYTES, parseResumeBuffer, ResumeParseError } from '../lib/parseResume';

describe('parseResumeBuffer', () => {
  it('parses txt payloads', async () => {
    const buf = Buffer.from('EXPERIENCE\nBuilt React apps\nSKILLS\nTypeScript');
    const result = await parseResumeBuffer(buf, 'resume.txt', buf.length);

    expect(result.meta.parser).toBe('txt');
    expect(result.text).toContain('EXPERIENCE');
  });

  it('rejects oversized files', async () => {
    const buf = Buffer.from('x');

    await expect(parseResumeBuffer(buf, 'resume.txt', MAX_RESUME_FILE_BYTES + 1)).rejects.toMatchObject({
      code: 'FILE_TOO_LARGE',
    } as Partial<ResumeParseError>);
  });

  it('rejects unsupported file types', async () => {
    const buf = Buffer.from('hello');

    await expect(parseResumeBuffer(buf, 'resume.rtf', buf.length)).rejects.toMatchObject({
      code: 'UNSUPPORTED_FILE',
    } as Partial<ResumeParseError>);
  });
});

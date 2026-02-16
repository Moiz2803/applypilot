import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import type { ParseResumeSuccess } from './types';

export const MAX_RESUME_FILE_BYTES = 8 * 1024 * 1024;

export class ResumeParseError extends Error {
  code: 'BAD_REQUEST' | 'UNSUPPORTED_FILE' | 'FILE_TOO_LARGE' | 'PARSE_FAILED';
  hint: string;

  constructor(
    code: 'BAD_REQUEST' | 'UNSUPPORTED_FILE' | 'FILE_TOO_LARGE' | 'PARSE_FAILED',
    message: string,
    hint: string,
  ) {
    super(message);
    this.code = code;
    this.hint = hint;
  }
}

function normalizeExtractedText(text: string): string {
  return text.split(String.fromCharCode(0)).join('').replace(/\\s+\\n/g, '\\n').trim();
}

export async function parseResumeBuffer(
  buffer: Buffer,
  filename: string,
  sizeBytes: number,
): Promise<ParseResumeSuccess> {
  const lower = filename.toLowerCase();

  if (sizeBytes > MAX_RESUME_FILE_BYTES) {
    throw new ResumeParseError(
      'FILE_TOO_LARGE',
      `File exceeds ${Math.floor(MAX_RESUME_FILE_BYTES / (1024 * 1024))}MB upload limit.`,
      'Upload a file under 8MB or export a lighter PDF/DOCX copy.',
    );
  }

  if (!lower.endsWith('.pdf') && !lower.endsWith('.docx') && !lower.endsWith('.txt')) {
    throw new ResumeParseError(
      'UNSUPPORTED_FILE',
      'Unsupported file type. Use PDF, DOCX, or TXT.',
      'Convert your resume to PDF, DOCX, or TXT and retry.',
    );
  }

  if (lower.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    const text = normalizeExtractedText(result.value);

    if (!text) {
      throw new ResumeParseError(
        'PARSE_FAILED',
        'DOCX parsing produced empty text.',
        'Ensure your DOCX contains selectable text and try again.',
      );
    }

    return {
      text,
      meta: {
        parser: 'docx',
        chars: text.length,
      },
    };
  }

  if (lower.endsWith('.pdf')) {
    try {
      const parsed = await pdfParse(buffer);
      const text = normalizeExtractedText(parsed.text || '');
      if (!text || text.length < 40) {
        throw new ResumeParseError(
          'PARSE_FAILED',
          'No selectable text detected in PDF.',
          'This PDF may be scanned. Try an OCR-processed PDF or DOCX upload.',
        );
      }

      return {
        text,
        meta: {
          parser: 'pdf',
          pages: parsed.numpages,
          chars: text.length,
        },
      };
    } catch (error) {
      if (error instanceof ResumeParseError) {
        throw error;
      }

      throw new ResumeParseError(
        'PARSE_FAILED',
        'Failed to parse PDF text.',
        'Try a different PDF or upload DOCX/TXT. Scanned PDFs require OCR text.',
      );
    }
  }

  const text = normalizeExtractedText(buffer.toString('utf-8'));
  if (!text) {
    throw new ResumeParseError(
      'PARSE_FAILED',
      'TXT file appears empty.',
      'Verify file contents and encoding, then upload again.',
    );
  }

  return {
    text,
    meta: {
      parser: 'txt',
      chars: text.length,
    },
  };
}

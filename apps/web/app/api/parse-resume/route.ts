import { NextResponse } from 'next/server';
import { parseResumeBuffer, ResumeParseError } from '../../../lib/parseResume';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: 'Missing file upload.',
          code: 'BAD_REQUEST',
          hint: 'Attach a resume file in PDF, DOCX, or TXT format.',
        },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const parsed = await parseResumeBuffer(bytes, file.name, file.size);

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof ResumeParseError) {
      const status = error.code === 'FILE_TOO_LARGE' || error.code === 'UNSUPPORTED_FILE' ? 400 : 422;
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status },
      );
    }

    return NextResponse.json(
      {
        error: 'Unexpected parse failure.',
        code: 'PARSE_FAILED',
        hint: 'Try DOCX/TXT fallback and retry.',
      },
      { status: 500 },
    );
  }
}

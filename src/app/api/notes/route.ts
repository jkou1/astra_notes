import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type CreateNoteBody = {
  title: string;
  content: string;
  category?: string | null;
  tags?: string[];
  encryption_enabled?: boolean;
};

function makeError(status: number, detail: string, requestId: string) {
  return NextResponse.json(
    { status_code: status, detail, request_id: requestId },
    { status }
  );
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = (await req.json()) as Partial<CreateNoteBody> | undefined;
    if (!body) return makeError(400, 'Missing request body', requestId);

    const { title, content, category, tags, encryption_enabled } = body;

    if (typeof title !== 'string' || title.trim().length === 0) {
      return makeError(400, 'Title is required', requestId);
    }
    if (title.length < 1 || title.length > 500) {
      return makeError(400, 'Title must be 1-500 characters', requestId);
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return makeError(400, 'Content must not be empty', requestId);
    }

    // Global non-ASCII rejection per project policy
    const nonAscii = /[^\x00-\x7F]/.test(title + '\n' + content);
    if (nonAscii) {
      return makeError(400, 'Non-ASCII characters are not allowed', requestId);
    }

    // basic tags validation
    if (tags && !Array.isArray(tags)) {
      return makeError(400, 'Tags must be an array of strings', requestId);
    }

    // Persist note metadata and (if present) CRDT blob placeholder
    // NOTE: `Note` and `NoteBlob` Prisma models must exist in schema.prisma
    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        category: category ?? null,
        tags: tags ?? [],
        encryptionEnabled: !!encryption_enabled,
      },
    });

    // If we store a plain representation, create a NoteBlob record (optional)
    await prisma.noteBlob.create({
      data: {
        noteId: note.id,
        // for now store a plain-text snapshot; real CRDT persistence happens via separate endpoints/providers
        contentPlain: content,
        wordCount: content.split(/\s+/).filter(Boolean).length,
        lineCount: content.split(/\n/).length,
        characterCount: content.length,
      },
    });

    return NextResponse.json({ item: note, request_id: requestId }, { status: 201 });
  } catch (err) {
    // don't leak internals to clients
    // eslint-disable-next-line no-console
    console.error('POST /api/notes error', err, { requestId });
    return makeError(500, 'Internal server error', requestId);
  }
}

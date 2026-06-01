import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateCreateNoteBody } from './validation';

function makeError(status: number, detail: string, requestId: string) {
  return NextResponse.json(
    { status_code: status, detail, request_id: requestId },
    { status }
  );
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const result = validateCreateNoteBody(await req.json().catch(() => null));
    if (!result.ok) {
      return makeError(result.status, result.detail, requestId);
    }

    const { title, content, category, tags, encryption_enabled } = result.data;

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

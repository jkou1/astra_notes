import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

type NoteRouteProps = {
  params: {
    id: string;
  };
};

type UpdateNoteBody = {
  content?: unknown;
  crdt_blob?: unknown;
};

function makeError(status: number, detail: string, requestId: string) {
  return NextResponse.json({ status_code: status, detail, request_id: requestId }, { status });
}

function countWords(content: string) {
  return content.split(/\s+/).filter(Boolean).length;
}

function countLines(content: string) {
  return content.length === 0 ? 0 : content.split(/\n/).length;
}

function validateBase64(value: string) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    return null;
  }

  try {
    return Buffer.from(value, 'base64');
  } catch {
    return null;
  }
}

export async function PATCH(req: Request, { params }: NoteRouteProps) {
  const requestId = crypto.randomUUID();

  try {
    const body = (await req.json().catch(() => null)) as UpdateNoteBody | null;

    if (!body || typeof body !== 'object') {
      return makeError(400, 'Missing request body', requestId);
    }

    if (typeof body.content !== 'string') {
      return makeError(400, 'Content is required', requestId);
    }

    if (body.content.trim().length === 0) {
      return makeError(400, 'Content must not be empty', requestId);
    }

    if (/[^\x00-\x7F]/.test(body.content)) {
      return makeError(400, 'Non-ASCII characters are not allowed', requestId);
    }

    if (typeof body.crdt_blob !== 'string' || body.crdt_blob.length === 0) {
      return makeError(400, 'CRDT blob is required', requestId);
    }

    const content = body.content;
    const crdtBlob = validateBase64(body.crdt_blob);

    if (!crdtBlob) {
      return makeError(400, 'CRDT blob must be base64 encoded', requestId);
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!note) {
      return makeError(404, 'Note not found', requestId);
    }

    const syncedAt = new Date();
    const updatedBlob = await prisma.$transaction(async (transaction) => {
      await transaction.note.update({
        where: { id: params.id },
        data: {
          updatedAt: syncedAt,
        },
      });

      return transaction.noteBlob.upsert({
        where: {
          noteId: params.id,
        },
        create: {
          noteId: params.id,
          crdtBlob,
          contentPlain: content,
          wordCount: countWords(content),
          lineCount: countLines(content),
          characterCount: content.length,
          lastSyncedAt: syncedAt,
        },
        update: {
          crdtBlob,
          contentPlain: content,
          wordCount: countWords(content),
          lineCount: countLines(content),
          characterCount: content.length,
          lastSyncedAt: syncedAt,
        },
        select: {
          contentPlain: true,
          wordCount: true,
          lineCount: true,
          characterCount: true,
          lastSyncedAt: true,
        },
      });
    });

    return NextResponse.json({ item: updatedBlob, request_id: requestId });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('PATCH /api/notes/[id] error', err, { requestId, noteId: params.id });
    return makeError(500, 'Internal server error', requestId);
  }
}

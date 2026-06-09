import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/notes/route';
import { DELETE, PATCH } from '@/app/api/notes/[id]/route';

type NoteStatus = 'ACTIVE' | 'DELETED';

type StoredNote = {
  id: string;
  title: string;
  category: string | null;
  tags: string[];
  encryptionEnabled: boolean;
  status: NoteStatus;
  createdAt: Date;
  updatedAt: Date;
};

type StoredBlob = {
  noteId: string;
  crdtBlob: Buffer;
  contentPlain: string;
  wordCount: number;
  lineCount: number;
  characterCount: number;
  lastSyncedAt?: Date;
};

type ActivityLog = {
  noteId: string;
  action: 'DELETED';
  metadata: {
    deletedAt: string;
  };
};

type NoteCreateArgs = {
  data: {
    title: string;
    category: string | null;
    tags: string[];
    encryptionEnabled: boolean;
  };
};

type NoteFindUniqueArgs = {
  where: {
    id: string;
  };
};

type NoteUpdateArgs = {
  where: {
    id: string;
  };
  data: Partial<Pick<StoredNote, 'status' | 'updatedAt'>>;
};

type NoteBlobCreateArgs = {
  data: StoredBlob;
};

type NoteBlobUpsertArgs = {
  where: {
    noteId: string;
  };
  create: StoredBlob;
  update: StoredBlob;
};

type ActivityCreateArgs = {
  data: ActivityLog;
};

const harness = vi.hoisted(() => {
  const notes = new Map<string, StoredNote>();
  const blobs = new Map<string, StoredBlob>();
  const activities: ActivityLog[] = [];

  const prismaMock = {
    $transaction: vi.fn(),
    note: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    noteBlob: {
      create: vi.fn(),
      upsert: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  };

  return {
    activities,
    blobs,
    notes,
    prismaMock,
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: harness.prismaMock,
}));

function jsonRequest(url: string, method: 'POST' | 'PATCH', body: unknown) {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('notes route integration lifecycle', () => {
  beforeEach(() => {
    harness.notes.clear();
    harness.blobs.clear();
    harness.activities.length = 0;

    harness.prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof harness.prismaMock) => Promise<unknown>) => {
      return callback(harness.prismaMock);
    });

    harness.prismaMock.note.create.mockImplementation(async ({ data }: NoteCreateArgs) => {
      const now = new Date('2026-06-08T12:00:00.000Z');
      const note: StoredNote = {
        id: `note-${harness.notes.size + 1}`,
        title: data.title,
        category: data.category,
        tags: data.tags,
        encryptionEnabled: data.encryptionEnabled,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      };

      harness.notes.set(note.id, note);
      return note;
    });

    harness.prismaMock.note.findUnique.mockImplementation(async ({ where }: NoteFindUniqueArgs) => {
      return harness.notes.get(where.id) ?? null;
    });

    harness.prismaMock.note.update.mockImplementation(async ({ where, data }: NoteUpdateArgs) => {
      const note = harness.notes.get(where.id);
      if (!note) {
        throw new Error(`Missing note ${where.id}`);
      }

      const updatedNote: StoredNote = {
        ...note,
        ...data,
      };
      harness.notes.set(where.id, updatedNote);
      return updatedNote;
    });

    harness.prismaMock.noteBlob.create.mockImplementation(async ({ data }: NoteBlobCreateArgs) => {
      harness.blobs.set(data.noteId, data);
      return data;
    });

    harness.prismaMock.noteBlob.upsert.mockImplementation(async ({ where, create, update }: NoteBlobUpsertArgs) => {
      const nextBlob = harness.blobs.has(where.noteId) ? update : create;
      harness.blobs.set(where.noteId, nextBlob);
      return {
        contentPlain: nextBlob.contentPlain,
        wordCount: nextBlob.wordCount,
        lineCount: nextBlob.lineCount,
        characterCount: nextBlob.characterCount,
        lastSyncedAt: nextBlob.lastSyncedAt,
      };
    });

    harness.prismaMock.activityLog.create.mockImplementation(async ({ data }: ActivityCreateArgs) => {
      harness.activities.push(data);
      return data;
    });

    vi.stubGlobal('crypto', {
      randomUUID: () => 'integration-request-id',
    } as Crypto);
  });

  it('creates, syncs, and soft-deletes a note with CRDT state', async () => {
    const initialBlob = Buffer.from('initial-yjs-state').toString('base64');
    const updatedBlob = Buffer.from('updated-yjs-state').toString('base64');

    const createResponse = await POST(
      jsonRequest('http://localhost/api/notes', 'POST', {
        title: '  Integration draft  ',
        content: 'Hello collaborators',
        crdt_blob: initialBlob,
        category: 'workspace',
        tags: ['sync', 'notes'],
        encryption_enabled: true,
      })
    );

    expect(createResponse.status).toBe(201);
    const createPayload = (await createResponse.json()) as {
      item: {
        id: string;
        title: string;
      };
      request_id: string;
    };
    expect(createPayload.request_id).toBe('integration-request-id');
    expect(createPayload.item.title).toBe('Integration draft');

    const noteId = createPayload.item.id;
    expect(harness.blobs.get(noteId)).toMatchObject({
      contentPlain: 'Hello collaborators',
      wordCount: 2,
      lineCount: 1,
      characterCount: 19,
    });
    expect(harness.blobs.get(noteId)?.crdtBlob).toEqual(Buffer.from(initialBlob, 'base64'));

    const patchResponse = await PATCH(
      jsonRequest(`http://localhost/api/notes/${noteId}`, 'PATCH', {
        content: 'Hello collaborators\nShip fast',
        crdt_blob: updatedBlob,
      }),
      { params: { id: noteId } }
    );

    expect(patchResponse.status).toBe(200);
    const patchPayload = (await patchResponse.json()) as {
      item: {
        contentPlain: string;
        wordCount: number;
        lineCount: number;
        characterCount: number;
      };
    };
    expect(patchPayload.item).toMatchObject({
      contentPlain: 'Hello collaborators\nShip fast',
      wordCount: 4,
      lineCount: 2,
      characterCount: 29,
    });
    expect(harness.blobs.get(noteId)?.crdtBlob).toEqual(Buffer.from(updatedBlob, 'base64'));

    const deleteResponse = await DELETE(new Request(`http://localhost/api/notes/${noteId}`, { method: 'DELETE' }), {
      params: { id: noteId },
    });

    expect(deleteResponse.status).toBe(200);
    expect(harness.notes.get(noteId)?.status).toBe('DELETED');
    expect(harness.activities).toHaveLength(1);
    expect(harness.activities[0]).toMatchObject({
      noteId,
      action: 'DELETED',
    });

    const deletedPatchResponse = await PATCH(
      jsonRequest(`http://localhost/api/notes/${noteId}`, 'PATCH', {
        content: 'Should not sync',
        crdt_blob: updatedBlob,
      }),
      { params: { id: noteId } }
    );

    expect(deletedPatchResponse.status).toBe(404);
  });
});

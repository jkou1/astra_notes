import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, PATCH } from './route';

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  note: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  noteBlob: {
    upsert: vi.fn(),
  },
  activityLog: {
    create: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('PATCH /api/notes/[id]', () => {
  beforeEach(() => {
    prismaMock.$transaction.mockReset();
    prismaMock.note.findUnique.mockReset();
    prismaMock.note.update.mockReset();
    prismaMock.noteBlob.upsert.mockReset();
    prismaMock.activityLog.create.mockReset();
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-request-id',
    } as Crypto);
  });

  it('persists plain text stats and a CRDT blob', async () => {
    const syncedAt = new Date('2026-06-05T00:00:00.000Z');
    prismaMock.note.findUnique.mockResolvedValue({ id: 'note-1', status: 'ACTIVE' });
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock as never);
    });
    prismaMock.noteBlob.upsert.mockResolvedValue({
      contentPlain: 'Hello from Yjs',
      wordCount: 3,
      lineCount: 1,
      characterCount: 14,
      lastSyncedAt: syncedAt,
    });

    const response = await PATCH(
      new Request('http://localhost/api/notes/note-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          content: 'Hello from Yjs',
          crdt_blob: Buffer.from('encoded-yjs-state').toString('base64'),
        }),
      }),
      { params: { id: 'note-1' } }
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      item: { contentPlain: string; wordCount: number; characterCount: number };
      request_id: string;
    };

    expect(payload.request_id).toBe('test-request-id');
    expect(payload.item).toMatchObject({
      contentPlain: 'Hello from Yjs',
      wordCount: 3,
      characterCount: 14,
    });
    expect(prismaMock.note.update).toHaveBeenCalledWith({
      where: { id: 'note-1' },
      data: { updatedAt: expect.any(Date) },
    });
    expect(prismaMock.noteBlob.upsert).toHaveBeenCalledWith({
      where: {
        noteId: 'note-1',
      },
      create: {
        noteId: 'note-1',
        crdtBlob: Buffer.from('encoded-yjs-state'),
        contentPlain: 'Hello from Yjs',
        wordCount: 3,
        lineCount: 1,
        characterCount: 14,
        lastSyncedAt: expect.any(Date),
      },
      update: {
        crdtBlob: Buffer.from('encoded-yjs-state'),
        contentPlain: 'Hello from Yjs',
        wordCount: 3,
        lineCount: 1,
        characterCount: 14,
        lastSyncedAt: expect.any(Date),
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

  it('returns 404 when the note does not exist', async () => {
    prismaMock.note.findUnique.mockResolvedValue(null);

    const response = await PATCH(
      new Request('http://localhost/api/notes/missing-note', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          content: 'Hello from Yjs',
          crdt_blob: Buffer.from('encoded-yjs-state').toString('base64'),
        }),
      }),
      { params: { id: 'missing-note' } }
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      status_code: 404,
      detail: 'Note not found',
      request_id: 'test-request-id',
    });
    expect(prismaMock.noteBlob.upsert).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/notes/[id]', () => {
  beforeEach(() => {
    prismaMock.$transaction.mockReset();
    prismaMock.note.findUnique.mockReset();
    prismaMock.note.update.mockReset();
    prismaMock.noteBlob.upsert.mockReset();
    prismaMock.activityLog.create.mockReset();
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-request-id',
    } as Crypto);
  });

  it('soft-deletes a note and records activity', async () => {
    const deletedAt = new Date('2026-06-05T00:00:00.000Z');
    prismaMock.note.findUnique.mockResolvedValue({ id: 'note-1', status: 'ACTIVE' });
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock as never);
    });
    prismaMock.note.update.mockResolvedValue({
      id: 'note-1',
      status: 'DELETED',
      updatedAt: deletedAt,
    });
    prismaMock.activityLog.create.mockResolvedValue({ id: 'activity-1' });

    const response = await DELETE(new Request('http://localhost/api/notes/note-1', { method: 'DELETE' }), {
      params: { id: 'note-1' },
    });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      item: { id: string; status: string };
      request_id: string;
    };

    expect(payload).toMatchObject({
      item: {
        id: 'note-1',
        status: 'DELETED',
      },
      request_id: 'test-request-id',
    });
    expect(prismaMock.note.update).toHaveBeenCalledWith({
      where: { id: 'note-1' },
      data: {
        status: 'DELETED',
        updatedAt: expect.any(Date),
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });
    expect(prismaMock.activityLog.create).toHaveBeenCalledWith({
      data: {
        noteId: 'note-1',
        action: 'DELETED',
        metadata: {
          deletedAt: expect.any(String),
        },
      },
    });
  });

  it('returns 404 when the note is already deleted', async () => {
    prismaMock.note.findUnique.mockResolvedValue({ id: 'note-1', status: 'DELETED' });

    const response = await DELETE(new Request('http://localhost/api/notes/note-1', { method: 'DELETE' }), {
      params: { id: 'note-1' },
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      status_code: 404,
      detail: 'Note not found',
      request_id: 'test-request-id',
    });
    expect(prismaMock.note.update).not.toHaveBeenCalled();
    expect(prismaMock.activityLog.create).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  note: {
    create: vi.fn(),
  },
  noteBlob: {
    create: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('POST /api/notes', () => {
  const encodedCrdtBlob = Buffer.from('encoded-yjs-state').toString('base64');

  beforeEach(() => {
    prismaMock.$transaction.mockReset();
    prismaMock.note.create.mockReset();
    prismaMock.noteBlob.create.mockReset();
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-request-id',
    } as Crypto);
  });

  it('creates a note and note blob for valid input', async () => {
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock as never);
    });

    prismaMock.note.create.mockResolvedValue({
      id: 'note-1',
      title: 'Draft one',
      category: null,
      tags: [],
      encryptionEnabled: false,
      createdAt: new Date('2026-05-31T00:00:00.000Z'),
      updatedAt: new Date('2026-05-31T00:00:00.000Z'),
    });
    prismaMock.noteBlob.create.mockResolvedValue({ id: 'blob-1' });

    const response = await POST(
      new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Draft one',
          content: 'Hello world',
          crdt_blob: encodedCrdtBlob,
          category: 'general',
          tags: ['alpha'],
          encryption_enabled: true,
        }),
      })
    );

    expect(response.status).toBe(201);
    const payload = (await response.json()) as {
      item: { id: string; title: string; encryptionEnabled: boolean };
      request_id: string;
    };

    expect(payload.request_id).toBe('test-request-id');
    expect(payload.item).toMatchObject({
      id: 'note-1',
      title: 'Draft one',
      category: null,
      tags: [],
      encryptionEnabled: false,
    });
    expect(prismaMock.note.create).toHaveBeenCalledWith({
      data: {
        title: 'Draft one',
        category: 'general',
        tags: ['alpha'],
        encryptionEnabled: true,
      },
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.noteBlob.create).toHaveBeenCalledWith({
      data: {
        noteId: 'note-1',
        crdtBlob: Buffer.from(encodedCrdtBlob, 'base64'),
        contentPlain: 'Hello world',
        wordCount: 2,
        lineCount: 1,
        characterCount: 11,
      },
    });
  });

  it('rejects invalid non-ascii content', async () => {
    const response = await POST(
      new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Café',
          content: 'Hello world',
          crdt_blob: encodedCrdtBlob,
        }),
      })
    );

    expect(response.status).toBe(400);
    const payload = (await response.json()) as {
      status_code: number;
      detail: string;
      request_id: string;
    };

    expect(payload).toEqual({
      status_code: 400,
      detail: 'Non-ASCII characters are not allowed',
      request_id: 'test-request-id',
    });
    expect(prismaMock.note.create).not.toHaveBeenCalled();
    expect(prismaMock.noteBlob.create).not.toHaveBeenCalled();
  });
});

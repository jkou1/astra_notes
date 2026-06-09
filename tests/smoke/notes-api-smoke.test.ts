import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/notes/route';
import { DELETE, PATCH } from '@/app/api/notes/[id]/route';

const prismaMock = vi.hoisted(() => ({
  note: {
    findUnique: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('notes API smoke coverage', () => {
  beforeEach(() => {
    prismaMock.note.findUnique.mockReset();
    vi.stubGlobal('crypto', {
      randomUUID: () => 'smoke-request-id',
    } as Crypto);
  });

  it('exports App Router mutating handlers', () => {
    expect(POST).toEqual(expect.any(Function));
    expect(PATCH).toEqual(expect.any(Function));
    expect(DELETE).toEqual(expect.any(Function));
  });

  it('returns a JSON error for malformed create requests', async () => {
    const response = await POST(
      new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      })
    );

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({
      status_code: 400,
      detail: 'Missing request body',
      request_id: 'smoke-request-id',
    });
  });

  it('returns a JSON error when a note detail request has no body', async () => {
    const response = await PATCH(new Request('http://localhost/api/notes/note-1', { method: 'PATCH' }), {
      params: { id: 'note-1' },
    });

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({
      status_code: 400,
      detail: 'Missing request body',
      request_id: 'smoke-request-id',
    });
    expect(prismaMock.note.findUnique).not.toHaveBeenCalled();
  });
});

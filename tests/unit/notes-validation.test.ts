import { describe, expect, it } from 'vitest';

import { validateCreateNoteBody } from '@/app/api/notes/validation';

describe('notes validation unit coverage', () => {
  it('normalizes optional fields for a valid create payload', () => {
    const crdtBlob = Buffer.from('unit-yjs-state').toString('base64');

    const result = validateCreateNoteBody({
      title: '  Sprint notes  ',
      content: 'First line\nSecond line',
      crdt_blob: crdtBlob,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        title: 'Sprint notes',
        content: 'First line\nSecond line',
        crdt_blob: crdtBlob,
        category: null,
        tags: [],
        encryption_enabled: undefined,
      });
    }
  });

  it('rejects a malformed CRDT blob before persistence', () => {
    const result = validateCreateNoteBody({
      title: 'Draft',
      content: 'Plain text',
      crdt_blob: 'not base64!',
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      detail: 'CRDT blob must be base64 encoded',
    });
  });

  it('rejects non-array tags', () => {
    const result = validateCreateNoteBody({
      title: 'Draft',
      content: 'Plain text',
      crdt_blob: Buffer.from('unit-yjs-state').toString('base64'),
      tags: 'alpha',
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      detail: 'Tags must be an array of strings',
    });
  });
});

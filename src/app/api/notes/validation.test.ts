import { describe, expect, it } from 'vitest';
import { validateCreateNoteBody } from './validation';

describe('validateCreateNoteBody', () => {
  it('accepts a valid ASCII note payload', () => {
    const result = validateCreateNoteBody({
      title: 'Draft one',
      content: 'Hello world',
      crdt_blob: Buffer.from('encoded-yjs-state').toString('base64'),
      category: 'general',
      tags: ['alpha', 'beta'],
      encryption_enabled: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        title: 'Draft one',
        content: 'Hello world',
        crdt_blob: Buffer.from('encoded-yjs-state').toString('base64'),
        category: 'general',
        tags: ['alpha', 'beta'],
        encryption_enabled: false,
      });
    }
  });

  it('rejects notes with non-ASCII characters', () => {
    const result = validateCreateNoteBody({
      title: 'Café',
      content: 'Plain text',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.detail).toBe('Non-ASCII characters are not allowed');
    }
  });
});

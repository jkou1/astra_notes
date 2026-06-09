export type CreateNoteBody = {
  title: string;
  content: string;
  crdt_blob: string;
  category?: string | null;
  tags?: string[];
  encryption_enabled?: boolean;
};

export type ValidationResult =
  | { ok: true; data: CreateNoteBody }
  | { ok: false; status: number; detail: string };

export function validateCreateNoteBody(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, detail: 'Missing request body' };
  }

  const candidate = body as Partial<CreateNoteBody>;
  const { title, content, crdt_blob, category, tags, encryption_enabled } = candidate;

  if (typeof title !== 'string' || title.trim().length === 0) {
    return { ok: false, status: 400, detail: 'Title is required' };
  }

  if (title.length < 1 || title.length > 500) {
    return { ok: false, status: 400, detail: 'Title must be 1-500 characters' };
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    return { ok: false, status: 400, detail: 'Content must not be empty' };
  }

  if (/[^\x00-\x7F]/.test(title + '\n' + content)) {
    return { ok: false, status: 400, detail: 'Non-ASCII characters are not allowed' };
  }

  if (typeof crdt_blob !== 'string' || crdt_blob.length === 0) {
    return { ok: false, status: 400, detail: 'CRDT blob is required' };
  }

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(crdt_blob)) {
    return { ok: false, status: 400, detail: 'CRDT blob must be base64 encoded' };
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    return { ok: false, status: 400, detail: 'Tags must be an array of strings' };
  }

  return {
    ok: true,
    data: {
      title: title.trim(),
      content,
      crdt_blob,
      category: category ?? null,
      tags: tags ?? [],
      encryption_enabled,
    },
  };
}

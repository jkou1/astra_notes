import { notFound } from 'next/navigation';

import { NoteRoomRouteDialog } from '@/components/note-room-route-dialog';
import { prisma } from '@/lib/prisma';

type NotePageProps = {
  params: {
    id: string;
  };
};

export const dynamic = 'force-dynamic';

export default async function NotePage({ params }: NotePageProps) {
  const { id } = params;
  const note = await prisma.note.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      category: true,
      tags: true,
      encryptionEnabled: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      blob: {
        select: {
          crdtBlob: true,
          contentPlain: true,
          wordCount: true,
          lineCount: true,
          characterCount: true,
        },
      },
    },
  });

  if (!note || note.status === 'DELETED') {
    notFound();
  }

  return (
    <NoteRoomRouteDialog
      note={{
        id: note.id,
        title: note.title,
        category: note.category,
        tags: note.tags,
        encryptionEnabled: note.encryptionEnabled,
        createdAtLabel: note.createdAt.toLocaleDateString(),
        updatedAtLabel: note.updatedAt.toLocaleDateString(),
        contentPlain: note.blob?.contentPlain ?? '',
        crdtBase64: note.blob?.crdtBlob ? Buffer.from(note.blob.crdtBlob).toString('base64') : null,
        wordCount: note.blob?.wordCount ?? 0,
        lineCount: note.blob?.lineCount ?? 0,
      }}
    />
  );
}

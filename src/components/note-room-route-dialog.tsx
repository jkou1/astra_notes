'use client';

import { useRouter } from 'next/navigation';

import { NoteRoomDialog, type NoteRoomDialogNote } from '@/components/note-room-dialog';

type NoteRoomRouteDialogProps = {
  note: NoteRoomDialogNote;
};

export function NoteRoomRouteDialog({ note }: NoteRoomRouteDialogProps) {
  const router = useRouter();

  return <NoteRoomDialog note={note} onClose={() => router.push('/')} />;
}

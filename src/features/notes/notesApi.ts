import { supabase } from '../../lib/supabase';
import { Note, NoteType } from './types';

export interface NewNoteInput {
  book_id: string;
  type: NoteType;
  content: string;
  page_number: number | null;
  tags: string[] | null;
}

export async function createNote(input: NewNoteInput): Promise<Note> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('You must be logged in to add a note.');
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({ ...input, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Note;
}

export async function getNotesForBook(bookId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('book_id', bookId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Note[];
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw new Error(error.message);
}
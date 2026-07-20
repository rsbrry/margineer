export type NoteType = 'quote' | 'note' | 'character';

export interface Note {
  id: string;
  user_id: string;
  book_id: string;
  type: NoteType;
  content: string;
  page_number: number | null;
  tags: string[] | null;
  created_at: string;
}
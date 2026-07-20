// src/types/database.ts

export type BookStatus = 'wishlist' | 'reading' | 'completed';
export type NoteType = 'quote' | 'note' | 'character';

export interface Book {
  id: string; // uuid
  user_id: string; // foreign key to Users
  title: string;
  author: string;
  cover_image_url: string;
  total_pages: number;
  current_page: number;
  status: BookStatus;
  isbn: string | null;
  created_at: string; // timestamps come back as strings in JavaScript
}

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

export interface Vocabulary {
  id: string;
  user_id: string;
  book_id: string | null;
  word: string;
  definition: string;
  context_sentence: string | null;
  next_quiz_date: string;
  mastery_level: number; // defaults to 0
  created_at: string;
}
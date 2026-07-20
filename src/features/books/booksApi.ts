import { supabase } from '../../lib/supabase';
import { Book, BookStatus } from './types';

export interface NewBookInput {
  title: string;
  author: string | null;
  cover_image_url: string | null;
  total_pages: number | null;
  isbn: string | null;
  status: BookStatus;
}

export async function createBook(input: NewBookInput): Promise<Book> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('You must be logged in to add a book.');
  }

  const { data, error } = await supabase
    .from('books')
    .insert({
      ...input,
      user_id: userData.user.id,
      current_page: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Book;
}

export async function getBooks(): Promise<Book[]> {
  // No need to filter by user_id manually — RLS already restricts
  // this query to the logged-in user's rows only.
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Book[];
}

export async function updateBookProgress(
  bookId: string,
  currentPage: number
): Promise<Book> {
  const { data, error } = await supabase
    .from('books')
    .update({ current_page: currentPage })
    .eq('id', bookId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Book;
}

export async function updateBookStatus(
  bookId: string,
  status: BookStatus
): Promise<Book> {
  const { data, error } = await supabase
    .from('books')
    .update({ status })
    .eq('id', bookId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Book;
}
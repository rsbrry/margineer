import { GoogleBooksResult } from './types';

// Google Books' "volumes" search endpoint. No API key is required for
// basic search — it's rate-limited per IP instead. If we start hitting
// limits later, we can add a key via .env at that point.
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function lookupBookByIsbn(isbn: string): Promise<GoogleBooksResult | null> {
  const response = await fetch(`${GOOGLE_BOOKS_API}?q=isbn:${isbn}`);

  if (!response.ok) {
    throw new Error(`Google Books API error: ${response.status}`);
  }

  const data = await response.json();

  // totalItems is 0 when no book matches this ISBN — not an error,
  // just "nothing found," so we return null rather than throwing.
  if (!data.items || data.items.length === 0) {
    return null;
  }

  const volumeInfo = data.items[0].volumeInfo;

  return {
    title: volumeInfo.title ?? '',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : null,
    coverImageUrl: volumeInfo.imageLinks?.thumbnail ?? null,
    totalPages: volumeInfo.pageCount ?? null,
    isbn,
  };
}
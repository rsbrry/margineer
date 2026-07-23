import { GoogleBooksResult } from './types';

// Open Library's Books API -- free, no key, no rate-limit tier to
// worry about. "jscmd=data" gives us a richer object (cover, page
// count, authors) than the default response shape.
const OPEN_LIBRARY_API = 'https://openlibrary.org/api/books';

export async function lookupBookByIsbn(isbn: string): Promise<GoogleBooksResult | null> {
  const url = `${OPEN_LIBRARY_API}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status}`);
  }

  const data = await response.json();
  const entry = data[`ISBN:${isbn}`];

  // Open Library returns an empty object (not a 404) when nothing
  // matches -- so "no entry under this key" means "not found."
  if (!entry) {
    return null;
  }

  return {
    title: entry.title ?? '',
    author: entry.authors ? entry.authors.map((a: any) => a.name).join(', ') : null,
    coverImageUrl: entry.cover?.medium ?? entry.cover?.large ?? null,
    totalPages: entry.number_of_pages ?? null,
    isbn,
  };
}
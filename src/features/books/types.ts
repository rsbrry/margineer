export type BookStatus = 'wishlist' | 'reading' | 'completed';

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  total_pages: number | null;
  current_page: number;
  status: BookStatus;
  isbn: string | null;
  created_at: string;
}

// Shape returned by our Google Books lookup — a subset of what we
// need to prefill the Add Book form, not the full Google API response.
export interface GoogleBooksResult {
  title: string;
  author: string | null;
  coverImageUrl: string | null;
  totalPages: number | null;
  isbn: string | null;
}
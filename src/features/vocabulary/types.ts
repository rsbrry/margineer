export interface VocabularyWord {
  id: string;
  user_id: string;
  book_id: string | null;
  page_number: number | null;
  word: string;
  definition: string | null;
  context_sentence: string | null;
  next_daily_quiz: string;
  mastery_level: number;
  excluded_from_quiz: boolean;
  created_at: string;
}

// Returned by queries that embed the related book's title, for
// display on the quiz card.
export interface VocabularyWordWithBook extends VocabularyWord {
  books: { title: string } | null;
}
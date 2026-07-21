export interface VocabularyWord {
  id: string;
  user_id: string;
  book_id: string | null;
  word: string;
  definition: string | null;
  context_sentence: string | null;
  next_quiz_date: string;
  mastery_level: number;
  excluded_from_quiz: boolean;
  created_at: string;
}
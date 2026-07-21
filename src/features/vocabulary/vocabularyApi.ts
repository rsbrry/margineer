import { supabase } from '../../lib/supabase';
import { VocabularyWord, VocabularyWordWithBook } from './types';
import { applyDailyQuizResult, todayMidnightISO, tomorrowMidnightISO } from './srs';

export interface NewVocabWordInput {
  book_id: string | null;
  page_number: number | null;
  word: string;
  definition: string | null;
  context_sentence: string | null;
}

export async function createVocabWord(input: NewVocabWordInput): Promise<VocabularyWord> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('You must be logged in to save a word.');
  }

  const { data, error } = await supabase
    .from('vocabulary')
    .insert({
      ...input,
      user_id: userData.user.id,
      next_daily_quiz: tomorrowMidnightISO(),
      mastery_level: 0,
      excluded_from_quiz: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as VocabularyWord;
}

export async function getAllVocabWords(): Promise<VocabularyWord[]> {
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as VocabularyWord[];
}

// Words due today (or overdue), not permanently excluded. Whether
// this list is empty is exactly what decides Daily vs Practice mode --
// no separate "already did today" flag is needed, since answering a
// word during a Daily Quiz pushes its next_daily_quiz into the future.
export async function getDailyDueWords(): Promise<VocabularyWordWithBook[]> {
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*, books(title)')
    .eq('excluded_from_quiz', false)
    .lte('next_daily_quiz', todayMidnightISO())
    .order('next_daily_quiz', { ascending: true });

  if (error) throw new Error(error.message);
  return data as unknown as VocabularyWordWithBook[];
}

// Practice pool: any non-excluded word regardless of schedule, since
// Practice Quiz never reads or writes next_daily_quiz.
export async function getPracticeWordPool(): Promise<VocabularyWordWithBook[]> {
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*, books(title)')
    .eq('excluded_from_quiz', false);

  if (error) throw new Error(error.message);
  return data as unknown as VocabularyWordWithBook[];
}

export async function setExcludedFromQuiz(
  wordId: string,
  excluded: boolean
): Promise<VocabularyWord> {
  const { data, error } = await supabase
    .from('vocabulary')
    .update({ excluded_from_quiz: excluded })
    .eq('id', wordId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as VocabularyWord;
}

// The only place mastery_level / next_daily_quiz change -- called
// exclusively from Daily Quiz answers, never from Practice Quiz.
export async function recordDailyQuizResult(
  wordId: string,
  currentMastery: number,
  correct: boolean
): Promise<VocabularyWord> {
  const { newMastery, nextDailyQuiz } = applyDailyQuizResult(currentMastery, correct);

  const { data, error } = await supabase
    .from('vocabulary')
    .update({ mastery_level: newMastery, next_daily_quiz: nextDailyQuiz })
    .eq('id', wordId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as VocabularyWord;
}
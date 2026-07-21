import { supabase } from '../../lib/supabase';
import { VocabularyWord } from './types';
import { applyQuizResult } from './srs';

export interface NewVocabWordInput {
  book_id: string | null;
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
      next_quiz_date: new Date().toISOString(),
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

// Words due for review right now, excluding any the user has
// permanently opted out of. Capped at 20 per session so a huge
// backlog doesn't turn into an unbounded quiz.
export async function getDueQuizWords(): Promise<VocabularyWord[]> {
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('excluded_from_quiz', false)
    .lte('next_quiz_date', new Date().toISOString())
    .order('next_quiz_date', { ascending: true })
    .limit(20);

  if (error) throw new Error(error.message);
  return data as VocabularyWord[];
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

// Records a quiz answer: computes the new mastery_level + next_quiz_date
// via the SRS logic, then persists both in one update.
export async function recordQuizResult(
  wordId: string,
  currentMastery: number,
  correct: boolean
): Promise<VocabularyWord> {
  const { newMastery, nextQuizDate } = applyQuizResult(currentMastery, correct);

  const { data, error } = await supabase
    .from('vocabulary')
    .update({ mastery_level: newMastery, next_quiz_date: nextQuizDate })
    .eq('id', wordId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as VocabularyWord;
}
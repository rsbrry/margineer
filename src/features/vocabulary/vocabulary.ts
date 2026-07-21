import { supabase } from '../../lib/supabase';
import { VocabularyWord } from './types';

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
      // Due immediately so it would show up in a first quiz session --
      // the logic that reschedules this based on recall is Phase 5.
      next_quiz_date: new Date().toISOString(),
      mastery_level: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as VocabularyWord;
}
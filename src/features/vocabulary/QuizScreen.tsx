import { useCallback, useState } from 'react';
import { View, Text, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getDailyDueWords,
  getPracticeWordPool,
  recordDailyQuizResult,
  setExcludedFromQuiz,
} from './vocabularyApi';
import { VocabularyWordWithBook } from './types';

const SIZE_LIMITS: Record<string, number> = { quick: 5, normal: 15, full: 100 };

const SUCCESS_MESSAGES = ['You Nailed it! 🎉', "You're on fire! 🔥", 'Vocabulary champion! 🏆', 'Boom! Got it. 💥', 'Look at you go! ✨'];
const FAIL_MESSAGES = ["Nice try, you'll get it next time!", "Don't give up, practice makes perfect. 💪", 'So close! Try again soon.', 'Every mistake is a step toward mastery.', 'No worries -- onward!'];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizScreen({ route, navigation }: any) {
  const mode: 'daily' | 'practice' = route.params?.mode ?? 'daily';
  const size: string = route.params?.size ?? 'normal';

  const [queue, setQueue] = useState<VocabularyWordWithBook[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [hintExpanded, setHintExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setError(null);
        try {
          let data: VocabularyWordWithBook[];
          if (mode === 'daily') {
            data = await getDailyDueWords();
          } else {
            const pool = await getPracticeWordPool();
            data = shuffle(pool).slice(0, SIZE_LIMITS[size] ?? SIZE_LIMITS.normal);
          }
          if (!cancelled) {
            setQueue(data);
            setIndex(0);
            setRevealed(false);
            setHintExpanded(false);
          }
        } catch (err: any) {
          if (!cancelled) setError(err.message ?? 'Failed to load quiz words.');
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => {
        cancelled = true;
      };
    }, [mode, size])
  );

  const current = queue[index];

  async function handleAnswer(correct: boolean) {
    if (!current) return;
    try {
      // Practice Quiz never calls this -- mastery/schedule only ever
      // change from a Daily Quiz answer.
      if (mode === 'daily') {
        await recordDailyQuizResult(current.id, current.mastery_level, correct);
      }
      const messages = correct ? SUCCESS_MESSAGES : FAIL_MESSAGES;
      setResultMessage(messages[Math.floor(Math.random() * messages.length)]);

      setTimeout(() => {
        setResultMessage(null);
        setRevealed(false);
        setHintExpanded(false);
        setIndex((i) => i + 1);
      }, 2000);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save your answer.');
    }
  }

  async function handleExcludeToggle(value: boolean) {
    if (!current) return;
    setQueue((prev) => prev.map((w, i) => (i === index ? { ...w, excluded_from_quiz: value } : w)));
    try {
      await setExcludedFromQuiz(current.id, value);
    } catch (err: any) {
      setError(err.message ?? 'Failed to update word.');
      setQueue((prev) => prev.map((w, i) => (i === index ? { ...w, excluded_from_quiz: !value } : w)));
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (queue.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-lg font-semibold text-center">
          {mode === 'daily' ? 'No words due for review right now.' : 'No words available to practice.'}
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Check back later, or add more words from your reading.
        </Text>
      </View>
    );
  }

  if (index >= queue.length) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-lg font-semibold text-center">Quiz complete!</Text>
        <Text className="text-gray-500 text-center mt-2">
          You reviewed {queue.length} word{queue.length === 1 ? '' : 's'}.
        </Text>
        <Pressable className="bg-blue-600 rounded-lg p-3 mt-6" onPress={() => navigation.goBack()}>
          <Text className="text-white font-semibold">Done</Text>
        </Pressable>
      </View>
    );
  }

  const bookTitle = current.books?.title ?? null;

  return (
    <View className="flex-1 p-6 justify-center">
      {error && <Text className="text-red-500 mb-4 text-center">{error}</Text>}

      <Text className="text-xs text-gray-400 text-center mb-1">
        {mode === 'daily' ? 'Daily Quiz' : 'Practice Quiz'}
      </Text>
      <Text className="text-xs text-gray-400 text-center mb-2">
        {index + 1} / {queue.length}
      </Text>

      <View className="bg-white rounded-xl border border-gray-200 p-6 min-h-[220px] justify-center relative">
        {(bookTitle || current.page_number) && (
          <View className="absolute top-3 left-0 right-0 flex-row justify-between px-4">
            <Text className="text-xs text-gray-400">{bookTitle ?? ''}</Text>
            <Text className="text-xs text-gray-400">
              {current.page_number ? `p.${current.page_number}` : ''}
            </Text>
          </View>
        )}

        <View className="items-center mt-4">
          <Text className="text-3xl font-bold mb-2">{current.word}</Text>

          {current.context_sentence && (
            <Pressable onPress={() => setHintExpanded((v) => !v)}>
              <Text className="text-blue-500 text-xs mb-3">
                {hintExpanded ? 'Hide hint' : '[context hint]'}
              </Text>
            </Pressable>
          )}
          {hintExpanded && current.context_sentence && (
            <Text className="text-gray-400 italic text-center text-sm mb-3" numberOfLines={4}>
              {current.context_sentence}
            </Text>
          )}

          {!revealed ? (
            <Pressable className="bg-gray-200 rounded-lg px-4 py-2" onPress={() => setRevealed(true)}>
              <Text className="text-gray-800 font-semibold">Reveal Definition</Text>
            </Pressable>
          ) : (
            <Text className="text-gray-700 text-center">
              {current.definition ?? 'No definition saved.'}
            </Text>
          )}
        </View>

        {revealed && !resultMessage && (
          <View className="flex-row items-center justify-center mt-4">
            <Text className="text-gray-500 text-xs mr-2">Stop showing this word in quizzes</Text>
            <Switch value={current.excluded_from_quiz} onValueChange={handleExcludeToggle} />
          </View>
        )}

        {resultMessage && (
          <View className="absolute inset-0 bg-white/95 rounded-xl items-center justify-center">
            <Text className="text-xl font-semibold text-center px-6">{resultMessage}</Text>
          </View>
        )}
      </View>

      {revealed && !resultMessage && (
        <View className="flex-row gap-3 mt-6">
          <Pressable className="flex-1 bg-red-500 rounded-lg p-3.5 items-center" onPress={() => handleAnswer(false)}>
            <Text className="text-white font-semibold">Didn't Know It</Text>
          </Pressable>
          <Pressable className="flex-1 bg-green-600 rounded-lg p-3.5 items-center" onPress={() => handleAnswer(true)}>
            <Text className="text-white font-semibold">Knew It</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
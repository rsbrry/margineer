import { useCallback, useState } from 'react';
import { View, Text, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDueQuizWords, recordQuizResult, setExcludedFromQuiz } from './vocabularyApi';
import { VocabularyWord } from './types';

export default function QuizScreen({ navigation }: any) {
  const [queue, setQueue] = useState<VocabularyWord[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Tracks the just-answered card's excluded state locally so the
  // toggle on the result view reflects any change immediately.
  const [lastExcluded, setLastExcluded] = useState(false);
  const [answered, setAnswered] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setError(null);
        try {
          const data = await getDueQuizWords();
          if (!cancelled) {
            setQueue(data);
            setIndex(0);
            setRevealed(false);
            setAnswered(false);
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
    }, [])
  );

  const current = queue[index];

  async function handleAnswer(correct: boolean) {
    if (!current) return;
    try {
      await recordQuizResult(current.id, current.mastery_level, correct);
      setLastExcluded(current.excluded_from_quiz);
      setAnswered(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save your answer.');
    }
  }

  async function handleExcludeToggle(value: boolean) {
    if (!current) return;
    setLastExcluded(value);
    try {
      await setExcludedFromQuiz(current.id, value);
    } catch (err: any) {
      setError(err.message ?? 'Failed to update word.');
      setLastExcluded(!value);
    }
  }

  function handleNext() {
    setRevealed(false);
    setAnswered(false);
    setIndex((i) => i + 1);
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
          No words due for review right now.
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
        <Pressable
          className="bg-blue-600 rounded-lg p-3 mt-6"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 p-6 justify-center">
      {error && <Text className="text-red-500 mb-4 text-center">{error}</Text>}

      <Text className="text-xs text-gray-400 text-center mb-2">
        {index + 1} / {queue.length}
      </Text>

      <View className="bg-white rounded-xl border border-gray-200 p-6 items-center min-h-[200px] justify-center">
        <Text className="text-3xl font-bold mb-4">{current.word}</Text>

        {!revealed ? (
          <Pressable
            className="bg-gray-200 rounded-lg px-4 py-2"
            onPress={() => setRevealed(true)}
          >
            <Text className="text-gray-800 font-semibold">Reveal Definition</Text>
          </Pressable>
        ) : (
          <>
            <Text className="text-gray-700 text-center mb-2">
              {current.definition ?? 'No definition saved.'}
            </Text>
            {current.context_sentence && (
              <Text className="text-gray-400 italic text-center text-sm" numberOfLines={3}>
                {current.context_sentence}
              </Text>
            )}
          </>
        )}
      </View>

      {revealed && !answered && (
        <View className="flex-row gap-3 mt-6">
          <Pressable
            className="flex-1 bg-red-500 rounded-lg p-3.5 items-center"
            onPress={() => handleAnswer(false)}
          >
            <Text className="text-white font-semibold">Didn't Know It</Text>
          </Pressable>
          <Pressable
            className="flex-1 bg-green-600 rounded-lg p-3.5 items-center"
            onPress={() => handleAnswer(true)}
          >
            <Text className="text-white font-semibold">Knew It</Text>
          </Pressable>
        </View>
      )}

      {answered && (
        <View className="mt-6 items-center">
          <View className="flex-row items-center mb-4">
            <Text className="text-gray-600 mr-2">Stop showing this word in quizzes</Text>
            <Switch value={lastExcluded} onValueChange={handleExcludeToggle} />
          </View>
          <Pressable className="bg-blue-600 rounded-lg px-6 py-3" onPress={handleNext}>
            <Text className="text-white font-semibold">Next</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
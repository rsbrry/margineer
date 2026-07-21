import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Switch, Pressable, ActivityIndicator, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllVocabWords, setExcludedFromQuiz, getDailyDueWords } from './vocabularyApi';
import { msUntilMidnight } from './srs';
import { VocabularyWord } from './types';

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function VocabularyListScreen({ navigation }: any) {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [dailyDueCount, setDailyDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(formatCountdown(msUntilMidnight()));
  const [showSizePicker, setShowSizePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setError(null);
        try {
          const [allWords, dueWords] = await Promise.all([getAllVocabWords(), getDailyDueWords()]);
          if (!cancelled) {
            setWords(allWords);
            setDailyDueCount(dueWords.length);
          }
        } catch (err: any) {
          if (!cancelled) setError(err.message ?? 'Failed to load vocabulary.');
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

  // Only ticks while the Practice Quiz button (i.e. no daily words due) is showing.
  useEffect(() => {
    if (dailyDueCount !== 0) return;
    const interval = setInterval(() => setCountdown(formatCountdown(msUntilMidnight())), 1000);
    return () => clearInterval(interval);
  }, [dailyDueCount]);

  async function handleToggle(word: VocabularyWord, value: boolean) {
    setWords((prev) => prev.map((w) => (w.id === word.id ? { ...w, excluded_from_quiz: value } : w)));
    try {
      await setExcludedFromQuiz(word.id, value);
    } catch (err: any) {
      setError(err.message ?? 'Failed to update word.');
      setWords((prev) => prev.map((w) => (w.id === word.id ? { ...w, excluded_from_quiz: !value } : w)));
    }
  }

  function handlePracticeSize(size: 'quick' | 'normal' | 'full') {
    setShowSizePicker(false);
    navigation.navigate('Quiz', { mode: 'practice', size });
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const hasDailyWords = dailyDueCount > 0;

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Vocabulary</Text>

      <View className="flex-row gap-2 mb-2">
        <Pressable
          className={`flex-1 rounded-lg p-3 items-center ${hasDailyWords ? 'bg-green-600' : 'bg-blue-600'}`}
          onPress={() =>
            hasDailyWords ? navigation.navigate('Quiz', { mode: 'daily' }) : setShowSizePicker(true)
          }
        >
          <Text className="text-white font-semibold">
            {hasDailyWords ? 'Start Daily Quiz' : 'Practice Quiz'}
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-gray-200 rounded-lg p-3 items-center"
          onPress={() => navigation.navigate('AddVocabWord')}
        >
          <Text className="text-gray-800 font-semibold">+ Add Word</Text>
        </Pressable>
      </View>

      {!hasDailyWords && (
        <Text className="text-gray-400 text-xs text-center mb-4">
          Next Daily Quiz ({countdown})
        </Text>
      )}

      {error && <Text className="text-red-500 mb-3">{error}</Text>}

      {words.length === 0 ? (
        <Text className="text-gray-500 text-center mt-12">
          No words saved yet -- scan a page or add one manually to get started.
        </Text>
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-white rounded-lg p-3 mb-3 border border-gray-200 flex-row items-center">
              <View className="flex-1">
                <Text className="font-semibold">{item.word}</Text>
                {item.definition && (
                  <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                    {item.definition}
                  </Text>
                )}
                <Text className="text-xs text-blue-600 mt-1">Mastery: {item.mastery_level}</Text>
              </View>
              <View className="items-center ml-3">
                <Text className="text-xs text-gray-500 mb-1">Skip quizzes</Text>
                <Switch value={item.excluded_from_quiz} onValueChange={(v) => handleToggle(item, v)} />
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showSizePicker} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-xl p-6 w-full">
            <Text className="text-lg font-semibold mb-4 text-center">
              How many words do you want to practice?
            </Text>
            <View className="gap-3">
              <Pressable className="bg-blue-600 rounded-lg p-3 items-center" onPress={() => handlePracticeSize('quick')}>
                <Text className="text-white font-semibold">Quick (5 words)</Text>
              </Pressable>
              <Pressable className="bg-blue-600 rounded-lg p-3 items-center" onPress={() => handlePracticeSize('normal')}>
                <Text className="text-white font-semibold">Normal (15 words)</Text>
              </Pressable>
              <Pressable className="bg-blue-600 rounded-lg p-3 items-center" onPress={() => handlePracticeSize('full')}>
                <Text className="text-white font-semibold">Full (all words)</Text>
              </Pressable>
              <Pressable className="p-3 items-center" onPress={() => setShowSizePicker(false)}>
                <Text className="text-gray-500">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
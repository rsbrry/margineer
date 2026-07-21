import { useCallback, useState } from 'react';
import { View, Text, FlatList, Switch, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllVocabWords, setExcludedFromQuiz } from './vocabularyApi';
import { VocabularyWord } from './types';

export default function VocabularyListScreen() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setError(null);
        try {
          const data = await getAllVocabWords();
          if (!cancelled) setWords(data);
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

  async function handleToggle(word: VocabularyWord, value: boolean) {
    // Optimistic update -- flip the UI immediately, then persist.
    // If the save fails, roll the specific row back.
    setWords((prev) =>
      prev.map((w) => (w.id === word.id ? { ...w, excluded_from_quiz: value } : w))
    );
    try {
      await setExcludedFromQuiz(word.id, value);
    } catch (err: any) {
      setError(err.message ?? 'Failed to update word.');
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, excluded_from_quiz: !value } : w))
      );
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Vocabulary</Text>

      <View className="flex-row gap-2 mb-4">
        <Pressable
            className="flex-1 bg-blue-600 rounded-lg p-3 items-center"
            onPress={() => navigation.navigate('Quiz')}
        >
            <Text className="text-white font-semibold">Start Quiz</Text>
        </Pressable>
        <Pressable
            className="flex-1 bg-gray-200 rounded-lg p-3 items-center"
            onPress={() => navigation.navigate('AddVocabWord')}
        >
            <Text className="text-gray-800 font-semibold">+ Add Word</Text>
        </Pressable>
      </View>

      {error && <Text className="text-red-500 mb-3">{error}</Text>}

      {words.length === 0 ? (
        <Text className="text-gray-500 text-center mt-12">
          No words saved yet -- scan a page and select a word to add one.
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
                <Text className="text-xs text-blue-600 mt-1">
                  Mastery: {item.mastery_level}
                </Text>
              </View>
              <View className="items-center ml-3">
                <Text className="text-xs text-gray-500 mb-1">Skip quizzes</Text>
                <Switch
                  value={item.excluded_from_quiz}
                  onValueChange={(value) => handleToggle(item, value)}
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
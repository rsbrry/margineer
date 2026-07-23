import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
  if (!matches) return [text.trim()].filter(Boolean);
  return matches.map((s) => s.trim()).filter((s) => s.length > 0);
}

function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

function cleanWord(word: string): string {
  return word.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');
}

type Step = 'sentences' | 'confirm' | 'word';

export default function TextSelectionScreen({ route, navigation }: any) {
  const { bookId, extractedText } = route.params;

  const [sentences] = useState(() => splitIntoSentences(extractedText));
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<Step>('sentences');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const orderedSelected = [...selectedIndices].sort((a, b) => a - b);
  const selectedSentenceText = orderedSelected.map((i) => sentences[i]).join(' ');

  function toggleSentence(index: number) {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function handleSaveAsNote() {
    navigation.navigate('AddNote', { bookId, prefillContent: selectedSentenceText });
  }

  function handleWordTap(word: string) {
    const cleaned = cleanWord(word);
    // Tapping the already-selected word again clears the selection,
    // same "toggle off" behavior as the sentence list.
    setSelectedWord((prev) => (prev === word ? null : word));
  }

  function handleSaveAsWord() {
    if (!selectedWord) return;
    navigation.navigate('AddVocabWord', {
      bookId,
      word: cleanWord(selectedWord),
      contextSentence: selectedSentenceText,
    });
  }

  // ---- Step 1: select sentences ----
  if (step === 'sentences') {
    const hasSelection = selectedIndices.size > 0;

    return (
      <View className="flex-1">
        <ScrollView className="flex-1 p-4">
          <Text className="text-sm text-gray-500 mb-4">
            Tap the sentences you want to save. You can select more than one.
          </Text>
          {sentences.map((sentence, index) => {
            const isSelected = selectedIndices.has(index);
            return (
              <Pressable
                key={index}
                onPress={() => toggleSentence(index)}
                className={`p-3 rounded-lg mb-2 border ${
                  isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-200'
                }`}
              >
                <Text className="text-gray-800">{sentence}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="p-4 border-t border-gray-200 bg-white">
          <Pressable
            className={`rounded-lg p-3.5 items-center ${hasSelection ? 'bg-blue-600' : 'bg-gray-300'}`}
            onPress={() => hasSelection && setStep('confirm')}
            disabled={!hasSelection}
          >
            <Text className={hasSelection ? 'text-white font-semibold' : 'text-gray-500 font-semibold'}>
              Next
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---- Step 2: confirm selected sentences, choose destination ----
  if (step === 'confirm') {
    return (
      <View className="flex-1">
        <ScrollView className="flex-1 p-4">
          <Pressable onPress={() => setStep('sentences')} className="mb-4">
            <Text className="text-blue-600">{'< Back to selection'}</Text>
          </Pressable>

          <Text className="text-sm text-gray-500 mb-3">Selected text:</Text>
          {orderedSelected.map((index) => (
            <View key={index} className="bg-blue-50 rounded-lg p-3 mb-2 border border-blue-200">
              <Text className="text-gray-800">{sentences[index]}</Text>
            </View>
          ))}
        </ScrollView>

        <View className="p-4 border-t border-gray-200 bg-white gap-2">
          <Pressable
            className="bg-blue-600 rounded-lg p-3.5 items-center"
            onPress={handleSaveAsNote}
          >
            <Text className="text-white font-semibold">Save as Note/Quote</Text>
          </Pressable>
          <Pressable
            className="bg-gray-200 rounded-lg p-3.5 items-center"
            onPress={() => setStep('word')}
          >
            <Text className="text-gray-800 font-semibold">Select Vocab Word</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---- Step 3: pick a single word from the selected sentences ----
  const words = splitIntoWords(selectedSentenceText);

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 p-4">
        <Pressable onPress={() => setStep('confirm')} className="mb-4">
          <Text className="text-blue-600">{'< Back'}</Text>
        </Pressable>

        <Text className="text-sm text-gray-500 mb-4">Tap the word you want to save.</Text>

        <View className="flex-row flex-wrap gap-2">
          {words.map((word, index) => {
            const isSelected = selectedWord === word;
            return (
              <Pressable
                key={`${word}-${index}`}
                onPress={() => handleWordTap(word)}
                className={`px-3 py-2 rounded-lg border ${
                  isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-200'
                }`}
              >
                <Text className="text-gray-800">{word}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="p-4 border-t border-gray-200 bg-white">
        <Pressable
          className={`rounded-lg p-3.5 items-center ${
            selectedWord ? 'bg-green-600' : 'bg-gray-300'
          }`}
          onPress={handleSaveAsWord}
          disabled={!selectedWord}
        >
          <Text className={selectedWord ? 'text-white font-semibold' : 'text-gray-500 font-semibold'}>
            Save as Vocab Word
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
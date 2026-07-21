import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

export default function TextSelectionScreen({ route, navigation }: any) {
  const { bookId, extractedText } = route.params;

  // Split on whitespace while KEEPING the whitespace as its own tokens
  // (the capturing parens in the regex do this), so we can rejoin a
  // selected range later without losing the original spacing.
  const tokens: string[] = extractedText.split(/(\s+)/);

  const [selStart, setSelStart] = useState<number | null>(null);
  const [selEnd, setSelEnd] = useState<number | null>(null);

  function handleWordPress(index: number) {
    if (selStart === null) {
      setSelStart(index);
      setSelEnd(index);
    } else if (selStart === index && selEnd === index) {
      // Tapping the only selected word again clears the selection.
      setSelStart(null);
      setSelEnd(null);
    } else {
      setSelEnd(index);
    }
  }

  const rangeStart = selStart !== null && selEnd !== null ? Math.min(selStart, selEnd) : null;
  const rangeEnd = selStart !== null && selEnd !== null ? Math.max(selStart, selEnd) : null;
  const hasSelection = rangeStart !== null && rangeEnd !== null;
  const isSingleWord = hasSelection && rangeStart === rangeEnd;

  const selectedText = hasSelection
    ? tokens.slice(rangeStart as number, (rangeEnd as number) + 1).join('').trim()
    : '';

  function handleSaveAsNote() {
    navigation.navigate('AddNote', { bookId, prefillContent: selectedText });
  }

  function handleSaveAsWord() {
    // Real sentence-boundary detection is out of scope for now, so we
    // pass the whole captured block as context and let the vocab
    // screen (and Phase 5's quiz cards) show it as-is.
    navigation.navigate('AddVocabWord', {
      bookId,
      word: selectedText,
      contextSentence: extractedText,
    });
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 p-4">
        <Text className="text-sm text-gray-500 mb-4">
          Tap a word to start a selection, tap another word to extend the range. Tap the same
          single word again to clear.
        </Text>
        <Text className="leading-7">
          {tokens.map((token, index) => {
            if (/^\s+$/.test(token)) {
              return <Text key={index}>{token}</Text>;
            }

            const isSelected =
              hasSelection && index >= (rangeStart as number) && index <= (rangeEnd as number);

            return (
              <Text
                key={index}
                onPress={() => handleWordPress(index)}
                className={isSelected ? 'bg-blue-200' : ''}
              >
                {token}
              </Text>
            );
          })}
        </Text>
      </ScrollView>

      {hasSelection && (
        <View className="p-4 border-t border-gray-200 bg-white">
          <Text className="text-xs text-gray-500 mb-2" numberOfLines={2}>
            Selected: {selectedText}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 bg-blue-600 rounded-lg p-3 items-center"
              onPress={handleSaveAsNote}
            >
              <Text className="text-white font-semibold">Save as Note/Quote</Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-lg p-3 items-center ${
                isSingleWord ? 'bg-green-600' : 'bg-gray-300'
              }`}
              onPress={handleSaveAsWord}
              disabled={!isSingleWord}
            >
              <Text className={isSingleWord ? 'text-white font-semibold' : 'text-gray-500'}>
                Save as Vocab Word
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
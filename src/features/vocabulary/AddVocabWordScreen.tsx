import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { lookupDefinition } from './dictionaryApi';
import { createVocabWord } from './vocabularyApi';

export default function AddVocabWordScreen({ route, navigation }: any) {
  const prefillWord = route.params?.word ?? '';
  const prefillContext = route.params?.contextSentence ?? null;
  const bookId = route.params?.bookId ?? null;

  // If we arrived with a word already (from OCR), it's locked in as
  // read-only text. Otherwise the user types it themselves here.
  const [word, setWord] = useState(prefillWord);
  const [contextSentence, setContextSentence] = useState(prefillContext ?? '');
  const [definition, setDefinition] = useState('');
  const [looking, setLooking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Only auto-lookup when a word arrives prefilled. For manual entry,
  // lookup fires on-demand via a button instead (see handleLookup).
  useEffect(() => {
    if (prefillWord) {
      runLookup(prefillWord);
    }
  }, [prefillWord]);

  async function runLookup(term: string) {
    if (!term.trim()) return;
    setLooking(true);
    setNotice(null);
    try {
      const result = await lookupDefinition(term);
      if (result) {
        setDefinition(result);
      } else {
        setNotice('No definition found automatically -- enter one manually.');
      }
    } catch {
      setNotice('Dictionary lookup failed -- enter a definition manually.');
    } finally {
      setLooking(false);
    }
  }

  async function handleSave() {
    if (!word.trim()) {
      setNotice('Enter a word first.');
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      await createVocabWord({
        book_id: bookId,
        word: word.trim(),
        definition: definition.trim() || null,
        context_sentence: contextSentence.trim() || null,
      });
      navigation.goBack();
    } catch (err: any) {
      setNotice(err.message ?? 'Failed to save word.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 p-6">
      {prefillWord ? (
        <Text className="text-2xl font-bold mb-2">{word}</Text>
      ) : (
        <>
          <Text className="text-sm font-medium mb-1">Word *</Text>
          <View className="flex-row gap-2 mb-4">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg p-3"
              value={word}
              onChangeText={setWord}
              placeholder="Enter a word"
              autoCapitalize="none"
            />
            <Pressable
              className="bg-gray-200 rounded-lg px-4 justify-center"
              onPress={() => runLookup(word)}
              disabled={looking}
            >
              <Text className="text-gray-800 font-semibold">Look Up</Text>
            </Pressable>
          </View>
        </>
      )}

      {!prefillWord && (
        <>
          <Text className="text-sm font-medium mb-1">Context Sentence</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4"
            value={contextSentence}
            onChangeText={setContextSentence}
            placeholder="Optional -- where you saw this word"
            multiline
            numberOfLines={2}
            style={{ textAlignVertical: 'top' }}
          />
        </>
      )}

      {prefillContext && (
        <Text className="text-gray-500 italic mb-4" numberOfLines={3}>
          {prefillContext}
        </Text>
      )}

      <Text className="text-sm font-medium mb-1">Definition</Text>
      {looking ? (
        <ActivityIndicator className="mb-4" />
      ) : (
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4"
          value={definition}
          onChangeText={setDefinition}
          multiline
          numberOfLines={3}
          style={{ textAlignVertical: 'top' }}
          placeholder="Enter a definition..."
        />
      )}

      {notice && <Text className="text-orange-500 mb-4">{notice}</Text>}

      <Pressable
        className="bg-blue-600 rounded-lg p-3.5 items-center"
        onPress={handleSave}
        disabled={saving || looking}
      >
        <Text className="text-white font-semibold">{saving ? 'Saving...' : 'Save Word'}</Text>
      </Pressable>
    </ScrollView>
  );
}
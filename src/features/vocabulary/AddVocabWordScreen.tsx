import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { lookupDefinitions, DefinitionOption } from './dictionaryApi';
import { createVocabWord } from './vocabularyApi';
import { getBooks, getBookById } from '../books/booksApi';
import { Book } from '../books/types';

export default function AddVocabWordScreen({ route, navigation }: any) {
  const prefillWord = route.params?.word ?? '';
  const prefillContext = route.params?.contextSentence ?? null;
  const paramBookId = route.params?.bookId ?? null;

  const [word, setWord] = useState(prefillWord);
  const [contextSentence, setContextSentence] = useState(prefillContext ?? '');
  const [definition, setDefinition] = useState('');
  const [definitionOptions, setDefinitionOptions] = useState<DefinitionOption[]>([]);

  const [bookId, setBookId] = useState<string | null>(paramBookId);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState('');
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);

  const [looking, setLooking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // OCR flow: prefill page number from the book's current_page --
  // the physical page being scanned is usually close to wherever the
  // reader last updated their progress. Still editable if it's off.
  useEffect(() => {
    if (!paramBookId) return;
    let cancelled = false;
    getBookById(paramBookId)
      .then((book) => {
        if (cancelled) return;
        setBookTitle(book.title);
        setPageNumber(book.current_page ? String(book.current_page) : '');
      })
      .catch(() => {
        if (!cancelled) setBookTitle(null);
      });
    return () => {
      cancelled = true;
    };
  }, [paramBookId]);

  // Manual flow: load the user's books for the picker.
  useEffect(() => {
    if (paramBookId) return;
    let cancelled = false;
    getBooks()
      .then((books) => {
        if (!cancelled) setAvailableBooks(books);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [paramBookId]);

  useEffect(() => {
    if (prefillWord) runLookup(prefillWord);
  }, [prefillWord]);

  async function runLookup(term: string) {
    if (!term.trim()) return;
    setLooking(true);
    setNotice(null);
    setDefinitionOptions([]);
    try {
      const options = await lookupDefinitions(term);
      if (options.length === 0) {
        setNotice('No definition found automatically -- enter one manually.');
      } else if (options.length === 1) {
        setDefinition(options[0].definition);
      } else {
        // Multiple senses -- let the user pick rather than guessing.
        setDefinitionOptions(options);
        setNotice('This word has multiple meanings -- pick the one that fits.');
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
        page_number: pageNumber ? parseInt(pageNumber, 10) : null,
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

      <Text className="text-sm font-medium mb-1">Book</Text>
      {paramBookId ? (
        <Text className="border border-gray-200 bg-gray-50 rounded-lg p-3 mb-4 text-gray-700">
          {bookTitle ?? 'Loading...'}
        </Text>
      ) : (
        <View className="border border-gray-300 rounded-lg mb-4">
          <Picker selectedValue={bookId ?? ''} onValueChange={(v) => setBookId(v || null)}>
            <Picker.Item label="None" value="" />
            {availableBooks.map((book) => (
              <Picker.Item key={book.id} label={book.title} value={book.id} />
            ))}
          </Picker>
        </View>
      )}

      <Text className="text-sm font-medium mb-1">Page Number</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        value={pageNumber}
        onChangeText={setPageNumber}
        placeholder="e.g. 42"
        keyboardType="number-pad"
      />

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
          className="border border-gray-300 rounded-lg p-3 mb-2"
          value={definition}
          onChangeText={setDefinition}
          multiline
          numberOfLines={3}
          style={{ textAlignVertical: 'top' }}
          placeholder="Enter a definition..."
        />
      )}

      {definitionOptions.length > 0 && (
        <View className="mb-4">
          {definitionOptions.map((option, i) => (
            <Pressable
              key={i}
              onPress={() => setDefinition(option.definition)}
              className={`border rounded-lg p-3 mb-2 ${
                definition === option.definition
                  ? 'bg-blue-50 border-blue-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className="text-xs text-gray-400 mb-1">{option.partOfSpeech}</Text>
              <Text className="text-gray-800">{option.definition}</Text>
            </Pressable>
          ))}
        </View>
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
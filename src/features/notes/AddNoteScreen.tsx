import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { createNote } from './notesApi';
import { NoteType } from './types';

const typeOptions: { value: NoteType; label: string }[] = [
  { value: 'quote', label: 'Quote' },
  { value: 'note', label: 'Note' },
  { value: 'character', label: 'Character' },
];

export default function AddNoteScreen({ route, navigation }: any) {
  const { bookId } = route.params;

  const [type, setType] = useState<NoteType>('note');
  const [content, setContent] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!content.trim()) {
      setError('Content is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Split comma-separated tags into a trimmed array, dropping
      // empty entries (e.g. from trailing commas or double commas).
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await createNote({
        book_id: bookId,
        type,
        content: content.trim(),
        page_number: pageNumber ? parseInt(pageNumber, 10) : null,
        tags: tags.length > 0 ? tags : null,
      });
      navigation.goBack();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-2xl font-bold mb-6">Add Note</Text>

      <Text className="text-sm font-medium mb-2">Type</Text>
      <View className="flex-row gap-2 mb-4">
        {typeOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setType(option.value)}
            className={`flex-1 p-3 rounded-lg items-center border ${
              type === option.value
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text className={type === option.value ? 'text-white font-semibold' : 'text-gray-700'}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-sm font-medium mb-1">Content *</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        value={content}
        onChangeText={setContent}
        placeholder={
          type === 'quote'
            ? 'Enter the quote...'
            : type === 'character'
            ? 'Character name and details...'
            : 'Your note...'
        }
        multiline
        numberOfLines={4}
        style={{ textAlignVertical: 'top' }}
      />

      <Text className="text-sm font-medium mb-1">Page Number</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        value={pageNumber}
        onChangeText={setPageNumber}
        placeholder="e.g. 42"
        keyboardType="number-pad"
      />

      <Text className="text-sm font-medium mb-1">Tags</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        value={tagsInput}
        onChangeText={setTagsInput}
        placeholder="comma, separated, tags"
      />

      {error && <Text className="text-red-500 mb-4 text-center">{error}</Text>}

      <Pressable
        className="bg-blue-600 rounded-lg p-3.5 items-center"
        onPress={handleSave}
        disabled={saving}
      >
        <Text className="text-white font-semibold">{saving ? 'Saving...' : 'Save Note'}</Text>
      </Pressable>
    </ScrollView>
  );
}
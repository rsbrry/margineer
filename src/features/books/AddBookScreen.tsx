import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image } from 'react-native';
import { createBook } from './booksApi';
import { BookStatus } from './types';

export default function AddBookScreen({ route, navigation }: any) {
  // route.params?.prefill is the GoogleBooksResult passed from the
  // barcode scanner screen — undefined when opened for manual entry.
  const prefill = route.params?.prefill;

  const [title, setTitle] = useState(prefill?.title ?? '');
  const [author, setAuthor] = useState(prefill?.author ?? '');
  const [totalPages, setTotalPages] = useState(
    prefill?.totalPages ? String(prefill.totalPages) : ''
  );
  const [isbn] = useState(prefill?.isbn ?? null);
  const [coverImageUrl] = useState(prefill?.coverImageUrl ?? null);
  const [status, setStatus] = useState<BookStatus>('wishlist');

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createBook({
        title: title.trim(),
        author: author.trim() || null,
        cover_image_url: coverImageUrl,
        // Empty string -> null rather than NaN, since total_pages
        // is nullable and optional on manual entry.
        total_pages: totalPages ? parseInt(totalPages, 10) : null,
        isbn,
        status,
      });
      navigation.navigate('BookList');
    } catch (err: any) {
      setError(err.message ?? 'Failed to save book.');
    } finally {
      setSaving(false);
    }
  }

  const statusOptions: BookStatus[] = ['wishlist', 'reading', 'completed'];

  return (
    <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-2xl font-bold mb-6">Add Book</Text>

      {coverImageUrl && (
        <Image
          source={{ uri: coverImageUrl }}
          className="w-24 h-36 self-center mb-4 rounded"
          resizeMode="cover"
        />
      )}

      <Text className="text-sm font-medium mb-1">Title *</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        value={title}
        onChangeText={setTitle}
        placeholder="Book title"
      />

      <Text className="text-sm font-medium mb-1">Author</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        value={author}
        onChangeText={setAuthor}
        placeholder="Author name"
      />

      <Text className="text-sm font-medium mb-1">Total Pages</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        value={totalPages}
        onChangeText={setTotalPages}
        placeholder="e.g. 320"
        keyboardType="number-pad"
      />

      <Text className="text-sm font-medium mb-2">Status</Text>
      <View className="flex-row gap-2 mb-6">
        {statusOptions.map((option) => (
          <Pressable
            key={option}
            onPress={() => setStatus(option)}
            className={`flex-1 p-3 rounded-lg items-center border ${
              status === option
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text className={status === option ? 'text-white font-semibold' : 'text-gray-700'}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && <Text className="text-red-500 mb-4 text-center">{error}</Text>}

      <Pressable
        className="bg-blue-600 rounded-lg p-3.5 items-center"
        onPress={handleSave}
        disabled={saving}
      >
        <Text className="text-white font-semibold">
          {saving ? 'Saving...' : 'Save Book'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
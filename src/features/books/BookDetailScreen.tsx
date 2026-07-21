import { useCallback, useState } from 'react';
import { View, Text, TextInput, Pressable, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { updateBookProgress, updateBookStatus } from './booksApi';
import { Book, BookStatus } from './types';

export default function BookDetailScreen({ route, navigation }: any) {
  const { bookId } = route.params;

  const [book, setBook] = useState<Book | null>(null);
  const [pageInput, setPageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookId)
          .single();

        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setBook(data as Book);
          setPageInput(String(data.current_page));
        }
        setLoading(false);
      }

      load();
      return () => {
        cancelled = true;
      };
    }, [bookId])
  );

  async function handleUpdateProgress() {
    if (!book) return;
    const page = parseInt(pageInput, 10);
    if (isNaN(page) || page < 0) {
      setError('Enter a valid page number.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateBookProgress(book.id, page);
      setBook(updated);
    } catch (err: any) {
      setError(err.message ?? 'Failed to update progress.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: BookStatus) {
    if (!book) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBookStatus(book.id, status);
      setBook(updated);
    } catch (err: any) {
      setError(err.message ?? 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !book) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const statusOptions: BookStatus[] = ['wishlist', 'reading', 'completed'];

  return (
    <View className="flex-1 p-6">
      <View className="flex-row mb-6">
        {book.cover_image_url ? (
          <Image
            source={{ uri: book.cover_image_url }}
            className="w-20 h-28 rounded mr-4"
            resizeMode="cover"
          />
        ) : (
          <View className="w-20 h-28 rounded mr-4 bg-gray-200" />
        )}
        <View className="flex-1 justify-center">
          <Text className="text-xl font-bold" numberOfLines={2}>
            {book.title}
          </Text>
          {book.author && <Text className="text-gray-500 mt-1">{book.author}</Text>}
        </View>
      </View>

      <Text className="text-sm font-medium mb-2">Status</Text>
      <View className="flex-row gap-2 mb-6">
        {statusOptions.map((option) => (
          <Pressable
            key={option}
            onPress={() => handleStatusChange(option)}
            disabled={saving}
            className={`flex-1 p-3 rounded-lg items-center border ${
              book.status === option
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text className={book.status === option ? 'text-white font-semibold' : 'text-gray-700'}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {book.total_pages && (
        <>
          <Text className="text-sm font-medium mb-1">
            Current Page (of {book.total_pages})
          </Text>
          <View className="flex-row gap-2 mb-2">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg p-3"
              value={pageInput}
              onChangeText={setPageInput}
              keyboardType="number-pad"
            />
            <Pressable
              className="bg-blue-600 rounded-lg px-4 justify-center"
              onPress={handleUpdateProgress}
              disabled={saving}
            >
              <Text className="text-white font-semibold">Update</Text>
            </Pressable>
          </View>
        </>
      )}

      <Pressable
        className="bg-gray-200 rounded-lg p-3 items-center mb-6"
        onPress={() => navigation.navigate('NotesList', { bookId: book.id })}
      >
        <Text className="text-gray-800 font-semibold">View Notes</Text>
      </Pressable>

      <Pressable
        className="bg-gray-200 rounded-lg p-3 items-center mb-6"
        onPress={() => navigation.navigate('OCRCapture', { bookId: book.id })}
      >
        <Text className="text-gray-800 font-semibold">Scan Page</Text>
      </Pressable>

      {error && <Text className="text-red-500 mt-2">{error}</Text>}
    </View>
  );
}
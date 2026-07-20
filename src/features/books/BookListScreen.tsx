import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBooks } from './booksApi';
import { Book } from './types';

const statusLabels: Record<Book['status'], string> = {
  wishlist: 'Wishlist',
  reading: 'Reading',
  completed: 'Completed',
};

export default function BookListScreen({ navigation }: any) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useFocusEffect (not useEffect) re-runs every time this screen
  // comes back into focus — e.g. after saving a new book and
  // navigating back here, so the list reflects the new addition
  // without needing a manual refresh.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setError(null);
        try {
          const data = await getBooks();
          if (!cancelled) setBooks(data);
        } catch (err: any) {
          if (!cancelled) setError(err.message ?? 'Failed to load books.');
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">My Books</Text>
        <View className="flex-row gap-2">
          <Pressable
            className="bg-blue-600 rounded-lg px-3 py-2"
            onPress={() => navigation.navigate('BarcodeScanner')}
          >
            <Text className="text-white font-semibold">Scan</Text>
          </Pressable>
          <Pressable
            className="bg-gray-200 rounded-lg px-3 py-2"
            onPress={() => navigation.navigate('AddBook')}
          >
            <Text className="text-gray-800 font-semibold">+ Manual</Text>
          </Pressable>
        </View>
      </View>

      {error && <Text className="text-red-500 mb-3">{error}</Text>}

      {books.length === 0 ? (
        <Text className="text-gray-500 text-center mt-12">
          No books yet — scan a barcode or add one manually to get started.
        </Text>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              className="flex-row bg-white rounded-lg p-3 mb-3 border border-gray-200"
              onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
            >
              {item.cover_image_url ? (
                <Image
                  source={{ uri: item.cover_image_url }}
                  className="w-12 h-16 rounded mr-3"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-12 h-16 rounded mr-3 bg-gray-200" />
              )}
              <View className="flex-1 justify-center">
                <Text className="font-semibold" numberOfLines={1}>
                  {item.title}
                </Text>
                {item.author && (
                  <Text className="text-gray-500 text-sm" numberOfLines={1}>
                    {item.author}
                  </Text>
                )}
                <Text className="text-xs text-blue-600 mt-1">
                  {statusLabels[item.status]}
                  {item.total_pages
                    ? ` · p.${item.current_page}/${item.total_pages}`
                    : ''}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
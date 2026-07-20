import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getNotesForBook, deleteNote } from './notesApi';
import { Note, NoteType } from './types';

const typeLabels: Record<NoteType, string> = {
  quote: 'Quote',
  note: 'Note',
  character: 'Character',
};

const filterOptions: { value: NoteType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'quote', label: 'Quotes' },
  { value: 'note', label: 'Notes' },
  { value: 'character', label: 'Characters' },
];

export default function NotesListScreen({ route, navigation }: any) {
  const { bookId } = route.params;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NoteType | 'all'>('all');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setError(null);
        try {
          const data = await getNotesForBook(bookId);
          if (!cancelled) setNotes(data);
        } catch (err: any) {
          if (!cancelled) setError(err.message ?? 'Failed to load notes.');
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => {
        cancelled = true;
      };
    }, [bookId])
  );

  // Recomputed only when notes or filter change, rather than on
  // every render — avoids re-filtering the array unnecessarily.
  const filteredNotes = useMemo(() => {
    if (filter === 'all') return notes;
    return notes.filter((n) => n.type === filter);
  }, [notes, filter]);

  async function handleDelete(noteId: string) {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete note.');
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
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Notes</Text>
        <Pressable
          className="bg-blue-600 rounded-lg px-3 py-2"
          onPress={() => navigation.navigate('AddNote', { bookId })}
        >
          <Text className="text-white font-semibold">+ Add</Text>
        </Pressable>
      </View>

      <View className="flex-row gap-2 mb-4">
        {filterOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setFilter(option.value)}
            className={`px-3 py-2 rounded-lg border ${
              filter === option.value
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={
                filter === option.value ? 'text-white font-semibold text-sm' : 'text-gray-700 text-sm'
              }
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && <Text className="text-red-500 mb-3">{error}</Text>}

      {filteredNotes.length === 0 ? (
        <Text className="text-gray-500 text-center mt-12">
          {filter === 'all' ? 'No notes yet for this book.' : `No ${filter}s yet.`}
        </Text>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-xs font-semibold text-blue-600">
                  {typeLabels[item.type]}
                  {item.page_number ? ` · p.${item.page_number}` : ''}
                </Text>
                <Pressable onPress={() => handleDelete(item.id)}>
                  <Text className="text-xs text-red-500">Delete</Text>
                </Pressable>
              </View>
              <Text className="text-gray-800">{item.content}</Text>
              {item.tags && item.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <View key={tag} className="bg-gray-100 rounded px-2 py-0.5">
                      <Text className="text-xs text-gray-600">{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
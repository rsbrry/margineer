import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookListScreen from '../features/books/BookListScreen';
import BookDetailScreen from '../features/books/BookDetailScreen';
import BarcodeScannerScreen from '../features/books/BarcodeScannerScreen';
import AddBookScreen from '../features/books/AddBookScreen';
import NotesListScreen from '../features/notes/NotesListScreen';
import AddNoteScreen from '../features/notes/AddNoteScreen';
import OCRCaptureScreen from '../features/ocr/OCRCaptureScreen';
import TextSelectionScreen from '../features/ocr/TextSelectionScreen';
import AddVocabWordScreen from '../features/vocabulary/AddVocabWordScreen';

const Stack = createNativeStackNavigator();

export default function BooksNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BookList" component={BookListScreen} options={{ title: 'My Books' }} />
      <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} options={{ title: 'Scan Barcode' }} />
      <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: 'Add Book' }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: 'Book Details' }} />
      <Stack.Screen name="NotesList" component={NotesListScreen} options={{ title: 'Notes' }} />
      <Stack.Screen name="AddNote" component={AddNoteScreen} options={{ title: 'Add Note' }} />
      <Stack.Screen name="OCRCapture" component={OCRCaptureScreen} options={{ title: 'Scan Page' }} />
      <Stack.Screen name="TextSelection" component={TextSelectionScreen} options={{ title: 'Select Text' }} />
      <Stack.Screen name="AddVocabWord" component={AddVocabWordScreen} options={{ title: 'Add Word' }} />
    </Stack.Navigator>
  );
}
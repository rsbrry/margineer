import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookListScreen from '../features/books/BookListScreen';
import BookDetailScreen from '../features/books/BookDetailScreen';
import BarcodeScannerScreen from '../features/books/BarcodeScannerScreen';
import AddBookScreen from '../features/books/AddBookScreen';

const Stack = createNativeStackNavigator();

export default function BooksNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BookList" component={BookListScreen} options={{ title: 'My Books' }} />
      <Stack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ title: 'Scan Barcode' }}
      />
      <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: 'Add Book' }} />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ title: 'Book Details' }}
      />
    </Stack.Navigator>
  );
}
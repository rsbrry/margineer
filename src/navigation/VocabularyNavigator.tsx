import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VocabularyListScreen from '../features/vocabulary/VocabularyListScreen';
import QuizScreen from '../features/vocabulary/QuizScreen';
import AddVocabWordScreen from '../features/vocabulary/AddVocabWordScreen';

const Stack = createNativeStackNavigator();

export default function VocabularyNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="VocabularyList"
        component={VocabularyListScreen}
        options={{ title: 'Vocabulary' }}
      />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
      <Stack.Screen
        name="AddVocabWord"
        component={AddVocabWordScreen}
        options={{ title: 'Add Word' }}
      />
    </Stack.Navigator>
  );
}
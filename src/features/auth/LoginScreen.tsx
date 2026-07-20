import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
  }

  return (
    <View className="flex-1 justify-center p-6">
      <Text className="text-3xl font-bold mb-8 text-center">Margineer</Text>

      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-3"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-3"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text className="text-red-500 mb-3">{error}</Text>}

      <Pressable
        className="bg-blue-600 rounded-lg p-3.5 items-center mt-2"
        onPress={handleLogin}
        disabled={submitting}
      >
        <Text className="text-white font-semibold">
          {submitting ? 'Logging in...' : 'Log In'}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Signup')}>
        <Text className="text-blue-600 text-center mt-4">
          Don't have an account? Sign up
        </Text>
      </Pressable>
    </View>
  );
}
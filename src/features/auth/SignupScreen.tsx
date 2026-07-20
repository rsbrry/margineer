import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup() {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    const { error } = await signUp(email, password);
    setSubmitting(false);
    if (error) {
      setError(error);
    } else {
      setMessage('Check your email to confirm your account, then log in.');
    }
  }

  return (
    <View className="flex-1 justify-center p-6">
      <Text className="text-3xl font-bold mb-8 text-center">Create Account</Text>

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
      {message && <Text className="text-green-600 mb-3">{message}</Text>}

      <Pressable
        className="bg-blue-600 rounded-lg p-3.5 items-center mt-2"
        onPress={handleSignup}
        disabled={submitting}
      >
        <Text className="text-white font-semibold">
          {submitting ? 'Creating account...' : 'Sign Up'}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text className="text-blue-600 text-center mt-4">
          Already have an account? Log in
        </Text>
      </Pressable>
    </View>
  );
}
import { View, Text, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View className="flex-1 justify-center items-center gap-4">
      <Text className="text-base">Logged in as: {user?.email}</Text>
      <Pressable className="bg-red-500 rounded-lg p-3" onPress={signOut}>
        <Text className="text-white font-semibold">Log Out</Text>
      </Pressable>
    </View>
  );
}
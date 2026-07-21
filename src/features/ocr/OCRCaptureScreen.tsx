import { useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { extractTextFromImage } from './visionApi';

export default function OCRCaptureScreen({ route, navigation }: any) {
  const { bookId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCapture() {
    if (!cameraRef.current) return;
    setCapturing(true);
    setError(null);

    try {
      // quality 0.5 keeps the base64 payload smaller -- Vision API
      // still reads text fine at this resolution and it uploads faster.
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      if (!photo?.base64) {
        throw new Error('Failed to capture image.');
      }

      const text = await extractTextFromImage(photo.base64);
      setCapturing(false);

      if (!text) {
        setError('No text found. Try again with better lighting or focus.');
        return;
      }

      navigation.navigate('TextSelection', { bookId, extractedText: text });
    } catch (err) {
      console.log('OCR capture error:', err);
      setCapturing(false);
      setError('Something went wrong reading the page. Please try again.');
    }
  }

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-center mb-4">
          Margineer needs camera access to capture book pages.
        </Text>
        <Pressable className="bg-blue-600 rounded-lg p-3.5" onPress={requestPermission}>
          <Text className="text-white font-semibold">Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView ref={cameraRef} style={{ flex: 1 }} />

      <View className="absolute bottom-0 left-0 right-0 p-6 items-center">
        {error && (
          <Text className="text-white bg-black/60 rounded p-2 mb-3 text-center">{error}</Text>
        )}
        <Pressable
          className="bg-blue-600 rounded-full w-16 h-16 items-center justify-center"
          onPress={handleCapture}
          disabled={capturing}
        >
          {capturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="w-12 h-12 rounded-full bg-white" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
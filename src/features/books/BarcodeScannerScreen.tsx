import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { lookupBookByIsbn } from './bookLookupApi';

export default function BarcodeScannerScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  // Guards against firing multiple lookups from rapid repeated
  // barcode detections while the camera is still pointed at the book.
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBarcodeScanned({ data }: BarcodeScanningResult) {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    setError(null);

    console.log('Scanned barcode data:', data);

    try {
      const result = await lookupBookByIsbn(data);
      setLoading(false);

      if (!result) {
        setError('No book found for this barcode. Try manual entry instead.');
        return;
      }

      // Hand off the prefilled data to the Add Book form (built next).
      navigation.navigate('AddBook', { prefill: result });
    } catch (err) {
      console.log('Barcode lookup error:', err);
      setLoading(false);
      setError('Something went wrong looking up this book. Please try again.');
    }
  }

  if (!permission) {
    // Permission status is still loading
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
          Margineer needs camera access to scan book barcodes.
        </Text>
        <Pressable className="bg-blue-600 rounded-lg p-3.5" onPress={requestPermission}>
          <Text className="text-white font-semibold">Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    /*<CameraView
      style={{ flex: 1 }}
      barcodeScannerSettings={{ barcodeTypes: ['ean13', 'upc_a'] }}
      onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
    />*/
   <View className="flex-1">
      <CameraView
        style={{ flex: 1 }}
        className="flex-1"
        // Restricting to these formats avoids accidental scans of
        // QR codes or other barcode types — books use EAN-13 (ISBN-13)
        // or UPC-A (older ISBN-10 era editions).
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'upc_a'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {loading && (
        <View className="absolute inset-0 justify-center items-center bg-black/40">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-2">Looking up book...</Text>
        </View>
      )}

      {error && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4">
          <Text className="text-red-500 mb-3 text-center">{error}</Text>
          <Pressable
            className="bg-blue-600 rounded-lg p-3 items-center"
            onPress={() => {
              setScanned(false);
              setError(null);
            }}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
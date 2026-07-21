const VISION_API = 'https://vision.googleapis.com/v1/images:annotate';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;

export async function extractTextFromImage(base64Image: string): Promise<string | null> {
  if (!API_KEY) {
    throw new Error('Google Cloud Vision API key is not configured.');
  }

  const response = await fetch(`${VISION_API}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          // DOCUMENT_TEXT_DETECTION is tuned for dense paragraph text
          // (book pages), unlike TEXT_DETECTION which is meant for
          // sparse text like signs or labels.
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status}`);
  }

  const data = await response.json();
  const annotation = data.responses?.[0]?.fullTextAnnotation;

  if (!annotation) {
    return null;
  }

  return annotation.text as string;
}
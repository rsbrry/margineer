const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export async function lookupDefinition(word: string): Promise<string | null> {
  // Strip surrounding punctuation the OCR/selection might have
  // captured (e.g. a trailing comma or period from the page text).
  const cleaned = word.toLowerCase().replace(/[^a-z'-]/g, '');
  if (!cleaned) return null;

  const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(cleaned)}`);

  if (!response.ok) {
    // A 404 just means no entry was found -- not a real error.
    return null;
  }

  const data = await response.json();
  const definition = data[0]?.meanings?.[0]?.definitions?.[0]?.definition;
  return definition ?? null;
}
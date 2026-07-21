const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export interface DefinitionOption {
  partOfSpeech: string;
  definition: string;
}

export async function lookupDefinitions(word: string): Promise<DefinitionOption[]> {
  const cleaned = word.toLowerCase().replace(/[^a-z'-]/g, '');
  if (!cleaned) return [];

  const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(cleaned)}`);
  if (!response.ok) return []; // 404 = no entry, not a real error

  const data = await response.json();
  const meanings = data[0]?.meanings ?? [];

  const options: DefinitionOption[] = [];
  for (const meaning of meanings) {
    // Just the first (most common) definition per part of speech --
    // keeps the picker list to genuinely distinct senses, not every
    // minor variant the dictionary has on file.
    const def = meaning.definitions?.[0]?.definition;
    if (def) {
      options.push({ partOfSpeech: meaning.partOfSpeech ?? '', definition: def });
    }
  }
  return options;
}
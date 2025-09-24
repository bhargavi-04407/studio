'use server';

/**
 * @fileOverview This file implements the multi-language support feature for the MediLexica app.
 *
 * It contains a Genkit flow that translates user queries to English, processes the query using
 * the Gale Encyclopedia, and then translates the response back to the user's original language.
 *
 * - translateQuery - An exported function that calls the multiLanguageSupportFlow.
 * - MultiLanguageSupportInput - The input type for the translateQuery function.
 * - MultiLanguageSupportOutput - The return type for the translateQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslationSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});

const MultiLanguageSupportInputSchema = z.object({
  query: z.string().describe('The user query in their native language.'),
  sourceLanguage: z.string().describe('The language of the user query (e.g., en, fr, de).'),
  targetLanguage: z.string().describe('The desired language for the response, usually the same as the source language.'),
});
export type MultiLanguageSupportInput = z.infer<typeof MultiLanguageSupportInputSchema>;

const MultiLanguageSupportOutputSchema = z.object({
  translatedResponse: z.string().describe('The Gale Encyclopedia response translated to the target language.'),
});
export type MultiLanguageSupportOutput = z.infer<typeof MultiLanguageSupportOutputSchema>;

async function translateText(text: string, targetLanguage: string): Promise<string> {
  const translationPrompt = ai.definePrompt({
    name: 'translationPrompt',
    input: {schema: z.object({text: z.string(), targetLanguage: z.string()})},
    output: {schema: TranslationSchema},
    prompt: `Translate the following text to {{targetLanguage}}: {{text}}`,
  });

  const {output} = await translationPrompt({
    text: text,
    targetLanguage: targetLanguage,
  });
  return output!.translatedText;
}

export async function translateQuery(input: MultiLanguageSupportInput): Promise<MultiLanguageSupportOutput> {
  return multiLanguageSupportFlow(input);
}

const multiLanguageSupportFlow = ai.defineFlow(
  {
    name: 'multiLanguageSupportFlow',
    inputSchema: MultiLanguageSupportInputSchema,
    outputSchema: MultiLanguageSupportOutputSchema,
  },
  async input => {
    const {
      query,
      sourceLanguage,
      targetLanguage,
    } = input;

    // Translate the user query to English
    const translatedToEnglish = await translateText(query, 'en');

    // Simulate fetching medical information from the Gale Encyclopedia (replace with actual Gale Encyclopedia integration)
    const galeEncyclopediaResponse = `This is a placeholder response from all volumes of the Gale Encyclopedia for the query: ${translatedToEnglish}.  The user\'s original query was: ${query} in ${sourceLanguage}.`;

    // Translate the Gale Encyclopedia response back to the target language
    const translatedResponse = await translateText(galeEncyclopediaResponse, targetLanguage);

    return {
      translatedResponse: translatedResponse,
    };
  }
);

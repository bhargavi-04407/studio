'use server';

/**
 * @fileOverview This file implements the multi-language support feature for the MediLexica app.
 *
 * It contains a Genkit flow that takes a user query in any supported language,
 * processes it using the Gale Encyclopedia, and provides a medical answer in the user's original language.
 *
 * - translateQuery - An exported function that calls the multiLanguageSupportFlow.
 * - MultiLanguageSupportInput - The input type for the translateQuery function.
 * - MultiLanguageSupportOutput - The return type for the translateQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultiLanguageSupportInputSchema = z.object({
  query: z.string().describe("The user's medical question in their native language."),
  sourceLanguage: z.string().describe('The language of the user query (e.g., es, fr, hi).'),
  targetLanguage: z.string().describe('The desired language for the response, which should be the same as the source language.'),
});
export type MultiLanguageSupportInput = z.infer<typeof MultiLanguageSupportInputSchema>;

const MultiLanguageSupportOutputSchema = z.object({
  translatedResponse: z.string().describe('The medical answer in the target language.'),
  imageQuery: z.string().optional().describe('A 1-2 word search query in English for a relevant medical image of a disease if applicable. For example, "skin rash" or "inflamed appendix".'),
});
export type MultiLanguageSupportOutput = z.infer<typeof MultiLanguageSupportOutputSchema>;

export async function translateQuery(input: MultiLanguageSupportInput): Promise<MultiLanguageSupportOutput> {
  return multiLanguageSupportFlow(input);
}

const multiLanguagePrompt = ai.definePrompt({
  name: 'multiLanguagePrompt',
  input: {schema: MultiLanguageSupportInputSchema},
  output: {schema: MultiLanguageSupportOutputSchema},
  prompt: `You are a medical expert with access to all volumes of the Gale Encyclopedia.
A user is asking a medical question in {{sourceLanguage}}.
Provide a comprehensive answer to their question based on the information in the Gale Encyclopedia. If it is relevant, you can suggest potential medicines.
Your entire response must be in {{targetLanguage}}.

Only if the user explicitly asks for an image of a disease, provide a short, 1-2 word image search query in English that would visually represent that disease (e.g., "skin rash", "inflamed appendix"). If the user does not ask for an image, do not provide an image query.

User's question: "{{{query}}}"
`,
});

const multiLanguageSupportFlow = ai.defineFlow(
  {
    name: 'multiLanguageSupportFlow',
    inputSchema: MultiLanguageSupportInputSchema,
    outputSchema: MultiLanguageSupportOutputSchema,
  },
  async input => {
    const {output} = await multiLanguagePrompt(input);
    return {
      translatedResponse: output!.translatedResponse,
      imageQuery: output!.imageQuery,
    };
  }
);

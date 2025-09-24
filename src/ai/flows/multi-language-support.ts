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
import { Message, Role } from 'genkit';
import {z} from 'genkit';

const MultiLanguageSupportInputSchema = z.object({
  query: z.string().describe("The user's medical question in their native language."),
  sourceLanguage: z.string().describe('The language of the user query (e.g., es, fr, hi).'),
  targetLanguage: z.string().describe('The desired language for the response, which should be the same as the source language.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).describe('The previous messages in the conversation.'),
});
export type MultiLanguageSupportInput = z.infer<typeof MultiLanguageSupportInputSchema>;

const MultiLanguageSupportOutputSchema = z.object({
  summary: z.string().describe('A short, one or two sentence summary of the answer, in the target language.'),
  translatedResponse: z.string().describe('The detailed medical answer in the target language.'),
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

First, provide a short, one or two sentence summary of the answer in {{targetLanguage}}. Then, provide the full, detailed answer in {{targetLanguage}}.
Use the provided conversation history to understand the context of the user's question.

{{#if history}}
Conversation History (in {{sourceLanguage}}):
{{#each history}}
  {{#if (eq role 'user')}}
User: {{{content}}}
  {{else if (eq role 'assistant')}}
Assistant: {{{content}}}
  {{/if}}
{{/each}}
{{/if}}

User's current question: "{{{query}}}"
`,
});

const multiLanguageSupportFlow = ai.defineFlow(
  {
    name: 'multiLanguageSupportFlow',
    inputSchema: MultiLanguageSupportInputSchema,
    outputSchema: MultiLanguageSupportOutputSchema,
  },
  async input => {
    const history = input.history.map(m => new Message({role: m.role as Role, content: [{text: m.content}]}));

    const {output} = await multiLanguagePrompt({...input, history});
    return output!;
  }
);

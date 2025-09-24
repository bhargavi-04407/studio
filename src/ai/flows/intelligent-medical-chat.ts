'use server';

/**
 * @fileOverview Implements the intelligent medical chat flow using the Gale Encyclopedia.
 *
 * - intelligentMedicalChat - A function that handles medical questions and provides answers based on the Gale Encyclopedia.
 * - IntelligentMedicalChatInput - The input type for the intelligentMedicalChat function.
 * - IntelligentMedicalChatOutput - The return type for the intelligentMedicalChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentMedicalChatInputSchema = z.object({
  question: z.string().describe('The medical question asked by the user.'),
});
export type IntelligentMedicalChatInput = z.infer<typeof IntelligentMedicalChatInputSchema>;

const IntelligentMedicalChatOutputSchema = z.object({
  answer: z.string().describe('The answer to the medical question based on the Gale Encyclopedia.'),
});
export type IntelligentMedicalChatOutput = z.infer<typeof IntelligentMedicalChatOutputSchema>;

export async function intelligentMedicalChat(input: IntelligentMedicalChatInput): Promise<IntelligentMedicalChatOutput> {
  return intelligentMedicalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentMedicalChatPrompt',
  input: {schema: IntelligentMedicalChatInputSchema},
  output: {schema: IntelligentMedicalChatOutputSchema},
  prompt: `You are a medical expert with access to all volumes of the Gale Encyclopedia. Please answer the following medical question based on the information in the Gale Encyclopedia.\n\nQuestion: {{{question}}}`,
});

const intelligentMedicalChatFlow = ai.defineFlow(
  {
    name: 'intelligentMedicalChatFlow',
    inputSchema: IntelligentMedicalChatInputSchema,
    outputSchema: IntelligentMedicalChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

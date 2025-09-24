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
  imageQuery: z.string().optional().describe('A 1-2 word search query for a relevant medical image of a disease if applicable. For example, "skin rash" or "inflamed appendix".'),
});
export type IntelligentMedicalChatOutput = z.infer<typeof IntelligentMedicalChatOutputSchema>;

export async function intelligentMedicalChat(input: IntelligentMedicalChatInput): Promise<IntelligentMedicalChatOutput> {
  return intelligentMedicalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentMedicalChatPrompt',
  input: {schema: IntelligentMedicalChatInputSchema},
  output: {schema: IntelligentMedicalChatOutputSchema},
  prompt: `You are a medical expert with access to all volumes of the Gale Encyclopedia. Please answer the following medical question based on the information in the Gale Encyclopedia. 
If the question is about a specific disease or condition, provide a short, 1-2 word image search query that would visually represent the disease (e.g., "skin rash", "inflamed appendix"). If the question is not about a visual condition, do not provide an image query.

Question: {{{question}}}`,
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

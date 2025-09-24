
"use server";

import { intelligentMedicalChat } from "@/ai/flows/intelligent-medical-chat";
import { translateQuery } from "@/ai/flows/multi-language-support";
import { z } from "zod";
import { saveChatSession } from "./history/actions";
import { auth } from "@/lib/firebase";

const AskQuestionInput = z.object({
  question: z.string(),
  language: z.string(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  }))
});

export async function askQuestion(input: z.infer<typeof AskQuestionInput>) {
  try {
    const { question, language, messages } = AskQuestionInput.parse(input);
    const userId = auth.currentUser?.uid;

    let answer: string;

    if (language === "en") {
      const response = await intelligentMedicalChat({ question });
      answer = response.answer;
    } else {
      const response = await translateQuery({
        query: question,
        sourceLanguage: language,
        targetLanguage: language,
      });
      answer = response.translatedResponse;
    }
    
    if (userId) {
        const newMessages = [...messages, { role: 'assistant' as const, content: answer }];
        // We only save history for chats with more than one user message
        if (newMessages.filter(m => m.role === 'user').length > 1) {
             await saveChatSession(userId, newMessages.filter(m => m.role !== 'system').map(m => ({role: m.role as 'user' | 'assistant', content: m.content})));
        }
    }

    return { success: true, answer };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input." };
    }
    return { success: false, error: "An error occurred. Please try again." };
  }
}

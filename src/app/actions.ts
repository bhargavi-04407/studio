
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
  })),
  chatId: z.string().optional(),
});

export async function askQuestion(input: z.infer<typeof AskQuestionInput>) {
  try {
    const { question, language, messages, chatId } = AskQuestionInput.parse(input);
    const userId = auth.currentUser?.uid;

    let answer: string;
    let newChatId = chatId;
    
    // Filter out the system message and the most recent user message before sending to AI
    const historyForAI = messages.slice(0, -1).filter(m => m.role !== 'system');

    if (language === "en") {
      const response = await intelligentMedicalChat({ question, history: historyForAI });
      answer = `**Summary:** ${response.summary}\n\n**Details:** ${response.answer}`;
    } else {
      const response = await translateQuery({
        query: question,
        sourceLanguage: language,
        targetLanguage: language,
        history: historyForAI,
      });
      answer = `**Summary:** ${response.summary}\n\n**Details:** ${response.translatedResponse}`;
    }
    
    if (userId) {
        // Form the complete message history for saving (including the latest user question and AI answer)
        const finalMessages = [...messages, { role: 'assistant' as const, content: answer }]
            .filter(m => m.role !== 'system') // Filter out system messages before saving
            .map(m => ({role: m.role as 'user' | 'assistant', content: m.content}));
        
        // The save function will now correctly create or update the document
        const saveResult = await saveChatSession({ userId, messages: finalMessages, chatId: newChatId });

        if (saveResult.success && saveResult.chatId) {
            newChatId = saveResult.chatId;
        } else if (!saveResult.success) {
          // Even if saving fails, we should still return the answer
          console.error("Failed to save chat session:", saveResult.error);
        }
    }

    return { success: true, answer, chatId: newChatId };
  } catch (error) {
    console.error("Critical error in askQuestion:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input." };
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `An error occurred while getting the answer: ${errorMessage}` };
  }
}

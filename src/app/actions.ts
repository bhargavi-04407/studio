
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
    
    // We don't want to send the full message list, just the history
    const history = messages.slice(0, -1);

    if (language === "en") {
      const response = await intelligentMedicalChat({ question, history });
      answer = `**Summary:** ${response.summary}\n\n**Details:** ${response.answer}`;
    } else {
      const response = await translateQuery({
        query: question,
        sourceLanguage: language,
        targetLanguage: language,
        history,
      });
      answer = `**Summary:** ${response.summary}\n\n**Details:** ${response.translatedResponse}`;
    }
    
    if (userId) {
        const newMessages = [...messages, { role: 'assistant' as const, content: answer }];
        const messagesToSave = newMessages
            .filter(m => m.role !== 'system')
            .map(m => ({role: m.role as 'user' | 'assistant', content: m.content}));

        if (messagesToSave.length > 0) {
             const result = await saveChatSession(userId, messagesToSave, newChatId);
             if (result.success) {
                newChatId = result.chatId;
             }
        }
    }

    return { success: true, answer, chatId: newChatId };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input." };
    }
    return { success: false, error: "An error occurred. Please try again." };
  }
}

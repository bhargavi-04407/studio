
"use server";

import { intelligentMedicalChat } from "@/ai/flows/intelligent-medical-chat";
import { translateQuery } from "@/ai/flows/multi-language-support";
import { z } from "zod";

const AskQuestionInput = z.object({
  question: z.string(),
  language: z.string(),
});

export async function askQuestion(input: z.infer<typeof AskQuestionInput>) {
  try {
    const { question, language } = AskQuestionInput.parse(input);

    if (language === "en") {
      const response = await intelligentMedicalChat({ question });
      return { success: true, answer: response.answer };
    } else {
      const response = await translateQuery({
        query: question,
        sourceLanguage: language,
        targetLanguage: language,
      });
      return { success: true, answer: response.translatedResponse };
    }
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input." };
    }
    return { success: false, error: "An error occurred. Please try again." };
  }
}

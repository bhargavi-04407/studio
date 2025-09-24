
"use server";

import { intelligentMedicalChat } from "@/ai/flows/intelligent-medical-chat";
import { translateQuery } from "@/ai/flows/multi-language-support";
import { searchUnsplash } from "@/lib/unsplash";
import { z } from "zod";

const AskQuestionInput = z.object({
  question: z.string(),
  language: z.string(),
});

export async function askQuestion(input: z.infer<typeof AskQuestionInput>) {
  try {
    const { question, language } = AskQuestionInput.parse(input);

    let answer: string;
    let imageQuery: string | undefined;
    let imageUrl: string | undefined;

    if (language === "en") {
      const response = await intelligentMedicalChat({ question });
      answer = response.answer;
      imageQuery = response.imageQuery;
    } else {
      const response = await translateQuery({
        query: question,
        sourceLanguage: language,
        targetLanguage: language,
      });
      answer = response.translatedResponse;
      imageQuery = response.imageQuery;
    }
    
    if (imageQuery) {
      imageUrl = await searchUnsplash(imageQuery);
    }

    return { success: true, answer, imageUrl };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input." };
    }
    return { success: false, error: "An error occurred. Please try again." };
  }
}

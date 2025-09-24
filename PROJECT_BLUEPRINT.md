# Project Blueprint: MediLexica

## 1. Project Synopsis

**MediLexica** is an intelligent, voice-enabled medical assistant designed to provide users with trusted, accessible, and multi-lingual health information. Powered by Google's advanced Gemini AI and grounded in the comprehensive knowledge of the Gale Encyclopedia of Medicine, the application offers a secure and intuitive chat interface for users to ask medical questions and receive clear, reliable answers.

The core mission is to empower individuals to make more informed decisions about their health by demystifying medical terminology and making expert-level knowledge from a trusted encyclopedia accessible through natural conversation.

---

## 2. Idea Submission

### The Problem
In an era of information overload, finding reliable and easy-to-understand medical information online is a significant challenge. Users often face a wall of contradictory, jargon-filled, or commercially-motivated content, leading to confusion, anxiety, and misinformation. Furthermore, language barriers and accessibility issues can prevent many from getting the answers they need.

### The Solution: MediLexica
MediLexica addresses this by providing a single, trustworthy source of truth. By combining a powerful AI with a vetted medical encyclopedia, it offers users a conversational way to explore complex health topics. The app serves as a "first stop" for medical queries, helping users understand symptoms, conditions, and treatments in simple terms, in their own language, and even through voice interaction.

### Target Audience
- Individuals and families seeking quick, reliable answers to everyday health questions.
- Students and healthcare professionals looking for a quick-reference medical glossary.
- Users in multilingual communities who need medical information translated into their native language.
- Users who benefit from voice-based interaction for accessibility reasons.

---

## 3. Core Features

- **Intelligent Medical Chat:**
  - Users can ask medical questions in natural language.
  - The AI, grounded in the Gale Encyclopedia, provides a concise summary and a detailed answer.

- **Multi-Language Support:**
  - The chat interface supports multiple languages (e.g., English, Spanish, French, Hindi, etc.).
  - Both user questions and AI answers are handled in the user's selected language.

- **Text-to-Speech Responses:**
  - The AI's answers can be read aloud in the selected language, providing a fully hands-free experience.

- **Secure User Authentication & History:**
  - Users can sign up and log in securely via Email/Password or Phone/OTP.
  - All chat conversations are automatically saved to the user's account in Firestore, allowing them to revisit their history at any time.

- **Medical Terminology Search:**
  - An integrated, searchable glossary provides definitions for common medical terms, sourced directly from the Gale Encyclopedia.

- **Modern, Responsive UI:**
  - A clean, professional, and intuitive interface that works seamlessly on both desktop and mobile devices.
  - Includes a dark mode theme for user comfort.

---

## 4. Technical Blueprint

### Frontend & UI:
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Components:** ShadCN UI
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Hooks (useState, useEffect, useContext) for local and shared state.

### Backend & AI:
- **AI Integration:** Google AI via Genkit
- **AI Models:**
  - `gemini-2.5-flash` for intelligent chat and reasoning.
  - `gemini-2.5-flash-preview-tts` for text-to-speech generation.
- **AI Flows:** Server-side Genkit flows are defined to handle:
  1.  `intelligentMedicalChat`: Processes questions in English against the encyclopedia context.
  2.  `multiLanguageSupport`: Translates and processes questions in other languages.
  3.  `textToSpeech`: Converts text responses into audible speech.

### Database & Authentication:
- **Service:** Firebase
- **Authentication:** Firebase Authentication (Email/Password and Phone/OTP providers).
- **Database:** Firestore is used to store user chat histories in a `chatSessions` collection. Each document contains the user ID, messages, title, and timestamps.

### Project Structure Highlights:
- `src/app/`: Contains all Next.js pages and server actions.
- `src/components/`: Houses all reusable React components.
- `src/ai/flows/`: Contains all Genkit AI logic, separated by feature.
- `src/lib/firebase.ts`: Initializes and exports Firebase services.
- `src/app/history/actions.ts`: Contains server actions for saving and retrieving chat history from Firestore.
- `package.json`: Defines all project dependencies.

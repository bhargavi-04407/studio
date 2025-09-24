# MediLexica: The Gale Encyclopedia Voice-Enabled Medical Assistant

MediLexica is an intelligent medical chat assistant powered by Google's Gemini AI and the comprehensive knowledge of the Gale Encyclopedia of Medicine. It provides a secure, multi-lingual, and voice-enabled interface for users to get trusted answers to their medical questions.

## Key Features

- **Intelligent Medical Chat:** Ask medical questions in natural language and get answers sourced from the Gale Encyclopedia.
- **Multi-Language Support:** Interact with the assistant in various languages, including English, Spanish, French, Hindi, and more.
- **Voice Assistant:** Use your voice to ask questions for a hands-free experience.
- **Secure Authentication:** Sign up and log in securely with Email/Password or Phone/OTP.
- **Chat History:** Your conversations are automatically saved and can be revisited anytime.
- **Medical Glossary:** A searchable glossary of medical terms is available for quick reference.
- **Modern UI:** Built with Next.js, ShadCN UI, and Tailwind CSS for a clean and responsive user experience.

## Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **AI:** Google Gemini via Genkit
- **Backend & Database:** Firebase (Authentication, Firestore)
- **UI:** ShadCN UI, Tailwind CSS
- **Icons:** Lucide React

---

## Running the Project Locally

To run this project in your own development environment, please follow these steps.

### 1. Prerequisites

- **Node.js:** Make sure you have Node.js version 18 or later installed.
- **npm:** Node Package Manager (comes with Node.js).
- **Firebase Account:** You will need a Firebase project to handle authentication and database storage.
- **Google AI API Key:** You need a Gemini API key to power the AI features.

### 2. Firebase Setup

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In the **Build** section of your new project:
    - Go to **Authentication** -> **Sign-in method** and enable **Email/Password** and **Phone**.
    - Go to **Firestore Database** and create a new database. Choose **Production mode**.
3.  Go to **Project Settings** (click the gear icon) -> **Your apps**.
4.  Create a new **Web app** (`</>`).
5.  After creating the app, copy the `firebaseConfig` object.
6.  Open `src/lib/firebase-config.ts` in your project and replace the existing placeholder object with your own `firebaseConfig`.

### 3. Environment Variables

1.  In the root directory of the project, create a new file named `.env`.
2.  Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  Add your API key to the `.env` file like this:

    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```

### 4. Install Dependencies

Open your terminal, navigate to the project's root folder, and run:

```bash
npm install
```

### 5. Run the Development Servers

This project requires two services to run concurrently: the Next.js app and the Genkit server. You will need two separate terminal windows.

**Terminal 1: Start the Next.js App**

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

**Terminal 2: Start the Genkit AI Server**

```bash
npm run genkit:watch
```

This command starts the AI backend and will automatically restart it if you make any changes to the files in `src/ai/flows/`.

Once both commands are running, you can use the application in your browser.

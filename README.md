# 🎙️ Emotion Adaptive TTS (EA-TTS)


## 🌟 How It Works 



1.  **Input**: You type a sentence like "I am so happy today!"
2.  **Emotion Analysis**: An AI model (BERT) reads your text and detects the emotion (e.g., "Happy").
3.  **Speech Generation**: Another AI model (FastSpeech 2) takes that text and the detected emotion to create an audio file that sounds happy.
4.  **Playback**: You get a nice audio player to listen to and download the speech.

## 🏗️ Codebase Structure & Workflow

The app's frontend is built with **Next.js**, **Tailwind CSS**, and **Zustand** for state management.

### 📁 Folder Overview
- **`app/`**: The heart of the app. Contains the main layout and pages.
- **`components/`**: Small, reusable building blocks like buttons, chat messages, and the sidebar.
- **`store/`**: Think of this as the app's "memory." It keeps track of your chats, your logged-in status, and the current audio being played.
- **`hooks/`**: Special utilities for things like mobile detection or toast notifications.

### 🔄 The Workflow
1.  **Authentication (`store/use-auth-store.ts`)**: When you log in, the app saves your "session."
2.  **Layout (`components/auth-wrapper.tsx`)**: This file organizes the screen. It decides if you see the sidebar (only if logged in) and puts the chat area in the middle.
3.  **Sending a Message (`components/input-area.tsx`)**: When you click send, it triggers the `addMessage` function in our memory (`use-tts-store.ts`).
4.  **Displaying Messages (`components/message-list.tsx`)**: This part watches our memory and updates the screen whenever a new message or audio is added.

## 🛠️ Tech Stack
- **Frontend**: Next.js (App Router), React 19.
- **Styling**: Tailwind CSS for a modern look.
- **State Management**: Zustand (Simple and fast memory).
- **UI Components**: shadcn/ui (Beautiful pre-made parts).

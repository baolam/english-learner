# LingoAnki 📚

LingoAnki is an English learning application that integrates with AI (Google Generative AI) and Anki to help users improve their vocabulary and reading skills. This repository contains the complete source code for the project, structured as a monorepo.

## 🏗️ Project Structure

The project is divided into several workspaces:

- **`backend/`**: The backend API server built with Node.js, Express, and TypeScript. It handles integrations with Google Generative AI and Anki (AnkiConnect).
- **`web/`**: The web application built with React, Vite, and TailwindCSS.
- **`mobile/`**: The mobile application built with React Native for iOS and Android.
- **`shared/`**: Shared types and utilities used across different parts of the project.
- **`experiments/`**: Scripts and test files for experimental features (e.g., Anki API tests).

## 🚀 Technologies Used

### Backend
- Node.js & Express
- TypeScript
- `@google/generative-ai` (Gemini API for AI features)
- `axios` (For AnkiConnect integration)

### Web (Frontend)
- React 19
- Vite
- TailwindCSS v4
- React Router
- Lucide React (Icons)

### Mobile
- React Native
- TypeScript

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- Anki desktop app installed with the **AnkiConnect** add-on enabled (if running locally for flashcards)
- API key for Google Generative AI

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd english-learner
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend/` directory based on your configuration needs (e.g., `PORT`, `GEMINI_API_KEY`).
- Run the server in development mode:
```bash
npm run dev
```

### 3. Web Setup
```bash
cd web
npm install
```
- Start the Vite development server:
```bash
npm run dev
```

### 4. Mobile Setup
```bash
cd mobile
npm install
# For iOS:
cd ios && pod install && cd ..
npm run ios
# For Android:
npm run android
```

## 📝 License

This project is licensed under the MIT License.

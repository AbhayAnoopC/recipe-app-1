# Recipe App

A mobile-first app (iOS, Android and web) for saving recipes from social media and, eventually, cooking them hands-free. Paste a link from TikTok, Instagram, YouTube or any website, keep the recipe in your library, and check it against what you have in your pantry.

> **Status:** early development. Auth, the recipe library, recipe import (as drafts) and the pantry work. AI recipe extraction, the cook mode and shopping lists are not built yet (see [Roadmap](#roadmap)).

## Features

- **Accounts:** email/password sign up and login with Firebase Auth. Logged-out users are redirected to login.
- **Library:** browse and search your saved recipes.
- **Import:** paste a URL, choose the platform, and optionally paste the caption to create a draft recipe.
- **Builder:** view a draft and edit its raw caption text.
- **Pantry:** toggle common staples (salt, pepper, olive oil, butter, garlic) and keep a list of ingredients you have. Names are normalized (lowercased, trimmed, punctuation stripped) so they can be matched against recipe ingredients.

## Tech stack

- [Expo](https://expo.dev) 54, React Native 0.81, React 19
- [expo-router](https://docs.expo.dev/router/introduction/) for file-based navigation
- Firebase Auth and Firestore
- TypeScript
- `expo-speech` and `expo-av` are installed for the planned voice features

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A [Firebase](https://console.firebase.google.com) project with Authentication (email/password) and Firestore enabled
- Expo Go on a device, or an iOS simulator / Android emulator

### Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` with the web app config from your Firebase project settings:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

`.env` is gitignored. Firebase web keys are not secret, so protect your data with Firestore security rules that limit each user to their own documents.

### Run

```bash
npm start          # Expo dev server (scan the QR code with Expo Go)
npm run ios
npm run android
npm run web
```

## Project structure

```
app/                  Screens (expo-router)
  (auth)/             Login and signup
  (tabs)/             Library, Pantry and Cook tabs
    library/          Import and recipe builder screens
context/              AuthContext (current user, login/signup/logout)
services/
  firebase/           Firebase init, auth helpers and Firestore access (db.ts)
  gemini.ts           AI extraction (stub)
lib/                  Ingredient normalization, missing-ingredient logic, usage helpers
types/                Recipe, pantry and cook session types
constants/            Colors
```

## Data model

Stored in Firestore (see `services/firebase/db.ts` and `types/`):

- **Recipe:** owner, source (platform, URL, creator, raw caption), status (`draft` or `ready`), and an optional structured form (title, servings, time, tags, equipment, ingredients, numbered steps).
- **Pantry:** one document per user with staples and items.
- **Cook session:** recipe, current step, question/answer history and a daily voice-question count.
- **Shopping list:** items generated from missing ingredients.

## Roadmap

- [ ] Gemini integration to turn a raw caption into a structured recipe (`services/gemini.ts`)
- [ ] Cook tab: step-by-step, voice-driven cooking assistant
- [ ] Missing-ingredient view using the pantry (logic is in `lib/ingredients.ts`)
- [ ] Shopping list UI (Firestore functions exist)

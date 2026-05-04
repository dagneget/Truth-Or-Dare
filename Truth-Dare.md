# Expert-Level Development Prompt: Truth or Dare Game Web App

**Project Goal**:  
Build a highly engaging, responsive, and gamified **Truth or Dare** web application as a Progressive Web App (PWA) that integrates seamlessly with an existing React Native mobile application.

---

## 1. Project Overview

Create a modern, fun, mobile-first Truth or Dare game that supports **group multiplayer** in virtual rooms. The web app will primarily be launched from the React Native mobile app via WebView or in-app browser.

**Key Characteristics**:
- Mobile-first & fully responsive (smartphones, tablets, desktop)
- Vibrant, gamified, party-style UI with smooth animations
- Progressive Web App (PWA) with native-like feel
- Real-time multiplayer experience

---

## 2. Core Game Features

### Gameplay
- **Mode**: Room-based group multiplayer (max 10 players per room)
- **Type**: Turn-based
- **Question Pool**: Mixed Truth and Dare questions selected randomly
- **Bottle Spin**: Central animated bottle spin mechanic to randomly select the player for the challenge
- **Timer**: Optional timer for Dares (players can enable/disable and choose duration: 30s, 60s, 90s, etc.)
- **Punishments**: Support for extra dares or custom punishments when a player refuses a challenge
- **Custom Content**: Users can create and save their own Truth and Dare entries

### Game Flow
1. Create or Join a room using a unique room code
2. Players join the lobby
3. Host starts the game
4. Bottle spins and lands on a random player
5. Selected player receives a random Truth or Dare
6. Player can answer truth or perform dare (with optional timer)
7. After completion or refusal → option for punishment/extra dare
8. Next turn begins with bottle spin

---

## 3. Technical Requirements

### Frontend
- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion + CSS animations (high-quality bottle spin, card flips, confetti, micro-interactions)
- **State Management**: Zustand (recommended)
- **PWA**: Full PWA support (manifest, service worker, installable)

### Backend & Database
- **Primary**: Firebase (Authentication + Firestore + Realtime capabilities)
- Real-time synchronization for:
  - Player joining/leaving
  - Room state
  - Turn management
  - Bottle spin result broadcasting
- Note: Mobile app uses Supabase. Design data models to allow future synchronization if needed.

### Authentication
- Firebase Authentication (Google Sign-In preferred)
- Support seamless authentication from React Native app (session/token passing via WebView or deep linking)
- Guest mode as fallback

---

## 4. UI/UX Requirements

- **Design Style**: Highly gamified, vibrant, colorful, energetic party vibe
- **Animations**:
  - Realistic and satisfying bottle spin animation
  - Smooth Truth/Dare card flip
  - Confetti explosions on successful completions
  - Engaging transitions and feedback
- **Screens**:
  1. Landing Page (Create Room / Join Room)
  2. Room Lobby (player list, host controls)
  3. Active Game Screen (bottle, current player, challenge display)
  4. Custom Truth & Dare Management
  5. Settings
- Fully responsive with excellent mobile experience (portrait + landscape support)

---

## 5. Mobile App Integration

- Built for seamless integration with **React Native** mobile app
- Users authenticate in the mobile app first, then open the web game
- Support deep linking and session passing (Firebase auth token injection)
- Must work smoothly inside WebView / in-app browser
- Mobile-first performance optimization

---

## 6. Additional Features

- Room creation with shareable codes
- Real-time player list with ready status
- Host privileges (start game, kick players, etc.)
- Custom Truth/Dare library per user
- Optional sound effects (bottle spin, success, etc.)
- Performance optimized for low-end devices
- Clean, scalable, and well-documented codebase

---

## 7. Deliverables

Please deliver:
- Complete Next.js project with best practices and clean folder structure
- Full TypeScript implementation
- Firebase configuration and services integration
- Complete PWA setup
- Well-structured, reusable components and custom hooks
- Comprehensive README with setup and mobile integration instructions
- Clear guidance on how to pass authentication from React Native app to the web app

---

**Development Priority Order**:
1. Project setup + Firebase integration + Authentication
2. Room creation & joining system (real-time)
3. Bottle spin animation + game engine
4. Truth/Dare logic + timer + punishments
5. Custom content management
6. Polish UI, animations, and gamification
7. PWA configuration and mobile integration optimization

---

**Important Notes**:
- Focus on **fun and engaging user experience**
- Prioritize smooth animations and satisfying interactions
- Ensure the app feels premium and addictive to play
- Optimize heavily for mobile performance

Start building this application step by step following the priority order above.
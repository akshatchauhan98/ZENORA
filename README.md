# Zenora: AI-Powered Academic Assistant

Zenora is a modern university portal designed to streamline academic success through intelligent assistance and personalized productivity tools.

## 🚀 Deployment Instructions

This project is built with **Next.js 15** and is optimized for the **Next.js** application preset.

### Firebase App Hosting (Recommended)

1.  Connect your repository to [Firebase App Hosting](https://console.firebase.google.com/project/_/apphosting).
2.  The system will automatically detect the **Next.js** framework.
3.  Ensure your `apphosting.yaml` configuration is correct.
4.  Configure your Firebase API keys in the environment variables within the Firebase Console.

### Manual Deployment (Vercel/Netlify)

1.  Select the **Next.js** preset in your hosting provider's dashboard.
2.  **Build Command**: `npm run build`
3.  **Output Directory**: `.next`
4.  **Environment Variables**: Add all variables from your `.env` file.

## 🛠 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore), [Firebase Auth](https://firebase.google.com/docs/auth)
- **AI Intelligence**: [Genkit](https://firebase.google.com/docs/genkit) powered by **Google Gemini 2.5 Flash**
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## ✨ Core Features

- **Zenora AI Assistant**: Conversational expert for academic logic and planning.
- **Campus Pulse**: Real-time events and community bulletin managed by admins.
- **Notes Repository**: Community-driven handwritten notes library.
- **Study Planner**: Strategic task management with integrated focus timers.
- **Wellbeing Tracker**: Mindfulness resources and daily energy synchronization.

## 🔒 Administrative Access

The official administrative identity is **zenoraa.app@gmail.com**. Login with this account to access event deployment and modification tools.

---
© 2024 Zenora. All rights reserved.
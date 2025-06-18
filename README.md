<a href="https://chat.vercel.ai/">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">AI Chat SDK ✨</h1>
</a>

<p align="center">
    A beautifully themed AI chatbot built with Next.js and the AI SDK, featuring a stunning purple color palette and enhanced user experience.
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://sdk.vercel.ai/docs)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports Google Gemini (default), OpenAI, Fireworks, and other model providers
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- **✨ Beautiful Purple Theme**
  - Stunning magnolia and pale-purple color palette
  - Glass morphism effects and smooth animations
  - Enhanced visual hierarchy and readability
  - Responsive design with dark/light mode support
- Data Persistence & Authentication
  - [Appwrite](https://appwrite.io) for database, file storage, and authentication
  - Serverless NoSQL database for saving chat history and user data
  - Secure file storage for attachments and images
  - Email-based authentication with OTP verification (registration required)

## Model Providers

This template ships with [Google Gemini](https://ai.google.dev) `gemini-1.5-flash` as the default chat model. However, with the [AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), [xAI](https://x.ai), and [many more](https://sdk.vercel.ai/providers/ai-sdk-providers) with just a few lines of code.

## Color Palette

The application uses a carefully crafted purple color palette:

- **Magnolia** (`#FAEFFB`) - Light, warm background tones
- **Chinese Violet** (`#726176`) - Sophisticated text and accent colors  
- **Pale Purple** (`#FAE2FC`) - Interactive elements and highlights
- **Gradient combinations** - Smooth transitions between primary and accent colors

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

### Prerequisites

1. **Google AI API Key**: Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Appwrite Setup**: Set up an Appwrite project following our [Appwrite Setup Guide](APPWRITE_SETUP.md)

### Setup Steps

1. Copy the environment variables:
```bash
cp .env.example .env
```

2. Update `.env` with your actual values:
```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-actual-project-id
APPWRITE_API_KEY=your-actual-api-key
APPWRITE_DATABASE_ID=your-actual-database-id
APPWRITE_BUCKET_ID=your-actual-bucket-id

# Google AI API Key (for Gemini Flash)
GOOGLE_GENERATIVE_AI_API_KEY=your-actual-google-ai-api-key

# Next.js Configuration  
AUTH_SECRET=your-auth-secret-key
```

3. Install dependencies:
```bash
pnpm install
```

4. Set up Appwrite collections (run this after configuring your `.env`):
```bash
pnpm setup:appwrite
```

5. Start the development server:
```bash
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000) with the beautiful new purple theme! ✨

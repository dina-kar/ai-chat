# Quick Setup Guide

This guide will help you fix the current issues and get your AI chatbot running with Appwrite and Google Gemini.

## Current Issues
- ❌ Appwrite collections not created (causing 404 errors)
- ❌ Environment variables not configured
- ❌ Google AI API key not set

## Quick Fix Steps

### 1. Environment Setup

First, copy the environment file:
```bash
cp .env.example .env
```

Then update `.env` with your actual credentials:

```env
# Appwrite Configuration (get these from your Appwrite console)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id-here
APPWRITE_API_KEY=your-api-key-here
APPWRITE_DATABASE_ID=your-database-id-here  
APPWRITE_BUCKET_ID=your-bucket-id-here

# Google AI API Key (get from https://aistudio.google.com/app/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key-here

# Auth Secret (generate a random string)
AUTH_SECRET=your-random-auth-secret-here
```

### 2. Get Your Appwrite Credentials

1. **Sign up** at [Appwrite Cloud](https://cloud.appwrite.io)
2. **Create a new project**
3. **Note down your Project ID** from the project settings
4. **Create an API Key** with these scopes:
   - `databases.read`
   - `databases.write` 
   - `files.read`
   - `files.write`
   - `users.read`
   - `users.write`
   - `sessions.write`
5. **Create a Database** and note the Database ID
6. **Create a Storage Bucket** and note the Bucket ID

### 3. Get Your Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 4. Create Appwrite Collections

Run the automated setup script:
```bash
pnpm setup:appwrite
```

This will create all the necessary collections in your Appwrite database.

### 5. Test Your Setup

Verify everything works:
```bash
pnpm test:setup
```

### 6. Start the Application

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) and your chatbot should be working!

## Troubleshooting

### "Collection not found" errors
- Make sure you ran `pnpm setup:appwrite` successfully
- Check that your `APPWRITE_DATABASE_ID` is correct

### "Unauthorized" errors  
- Verify your `APPWRITE_API_KEY` has the correct permissions
- Make sure your `APPWRITE_PROJECT_ID` is correct

### "Google AI API" errors
- Check that your `GOOGLE_GENERATIVE_AI_API_KEY` is valid
- Make sure you have API usage enabled for your Google account

### Still having issues?
Run the test command to see detailed error messages:
```bash
pnpm test:setup
```

## What Changed

✅ **Model Provider**: Changed from xAI to Google Gemini Flash  
✅ **Database**: Migrated from Neon Postgres to Appwrite  
✅ **Storage**: Changed from Vercel Blob to Appwrite Storage  
✅ **Authentication**: Switched from Auth.js to Appwrite Auth (email required)  
✅ **Caching**: Removed Redis dependency for simplicity 

## Authentication Required

This application now requires email authentication. Anonymous/guest access has been removed for better security and user experience. All users must sign up with a valid email address to use the chatbot. 
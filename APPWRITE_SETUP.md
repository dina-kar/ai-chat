# Appwrite Setup Guide

This guide will help you set up Appwrite for the AI Chatbot application, replacing Neon Postgres, Vercel Blob, and Auth.js.

## Prerequisites

1. Sign up for an [Appwrite Cloud](https://cloud.appwrite.io) account or set up a self-hosted Appwrite instance
2. Create a new project in the Appwrite console

## Step 1: Project Configuration

1. **Create a new project:**
   - Go to your Appwrite console
   - Click "Create Project"
   - Give it a name (e.g., "ai-chatbot")
   - Note down your **Project ID**

2. **Get your API credentials:**
   - Go to Project Settings → API Keys
   - Create a new API key with the following scopes:
     - `databases.read`, `databases.write`
     - `files.read`, `files.write`
     - `users.read`, `users.write`
     - `sessions.read`, `sessions.write`
   - Note down your **API Key**

## Step 2: Database Setup

### Create Database
1. Go to Databases in your Appwrite console
2. Create a new database
3. Note down the **Database ID**

### Create Collections

Create the following collections with these attributes:

#### 1. Users Collection
- **Collection ID:** `users`
- **Permissions:** 
  - Read: `users`
  - Write: `users`
- **Attributes:**
  - `email` (string, required, size: 320)
  - `password` (string, size: 255) - *Optional if using Appwrite auth*
  - `createdAt` (datetime, required)

#### 2. Chats Collection
- **Collection ID:** `chats`
- **Permissions:**
  - Read: `users`
  - Write: `users`
- **Attributes:**
  - `userId` (string, required, size: 255)
  - `title` (string, required, size: 1000)
  - `visibility` (string, required, size: 20) - Values: "public" or "private"
  - `createdAt` (datetime, required)
- **Indexes:**
  - `userId_createdAt` (key: userId, createdAt, order: DESC)

#### 3. Messages Collection
- **Collection ID:** `messages`
- **Permissions:**
  - Read: `users`
  - Write: `users`
- **Attributes:**
  - `chatId` (string, required, size: 255)
  - `role` (string, required, size: 20) - Values: "user", "assistant", "system"
  - `parts` (string, required, size: 65535) - JSON string
  - `attachments` (string, size: 65535) - JSON string
  - `createdAt` (datetime, required)
- **Indexes:**
  - `chatId_createdAt` (key: chatId, createdAt, order: ASC)

#### 4. Documents Collection
- **Collection ID:** `documents`
- **Permissions:**
  - Read: `users`
  - Write: `users`
- **Attributes:**
  - `userId` (string, required, size: 255)
  - `title` (string, required, size: 1000)
  - `content` (string, required, size: 65535)
  - `kind` (string, required, size: 50) - Values: "text", "code", "sheet", "image"
  - `createdAt` (datetime, required)

#### 5. Suggestions Collection
- **Collection ID:** `suggestions`
- **Permissions:**
  - Read: `users`
  - Write: `users`
- **Attributes:**
  - `documentId` (string, required, size: 255)
  - `userId` (string, required, size: 255)
  - `originalText` (string, required, size: 1000)
  - `suggestedText` (string, required, size: 1000)
  - `description` (string, size: 2000)
  - `isResolved` (boolean, default: false)
  - `createdAt` (datetime, required)

#### 6. Votes Collection
- **Collection ID:** `votes`
- **Permissions:**
  - Read: `users`
  - Write: `users`
- **Attributes:**
  - `messageId` (string, required, size: 255)
  - `chatId` (string, required, size: 255)
  - `isUpvoted` (boolean, required)
  - `createdAt` (datetime, required)
- **Indexes:**
  - `messageId` (key: messageId, type: unique)

#### 7. Streams Collection
- **Collection ID:** `streams`
- **Permissions:**
  - Read: `users`
  - Write: `users`
- **Attributes:**
  - `streamId` (string, required, size: 255)
  - `chatId` (string, required, size: 255)
  - `createdAt` (datetime, required)

## Step 3: Storage Setup

### Create Bucket
1. Go to Storage in your Appwrite console
2. Create a new bucket
3. Configure the bucket:
   - **Bucket ID:** Note this down for your environment variables
   - **Name:** "attachments" or similar
   - **Permissions:**
     - Read: `users`
     - Write: `users`
   - **File Security:** Enabled
   - **Maximum File Size:** 5MB (or as needed)
   - **Allowed File Extensions:** jpg, jpeg, png, gif, pdf, txt, doc, docx
   - **Compression:** gzip
   - **Encryption:** Enabled
   - **Antivirus:** Enabled (if available)

## Step 4: Authentication Setup

### Configure Auth Providers
1. Go to Auth in your Appwrite console
2. Configure the following providers:

#### Email/Password Provider
- Enable Email/Password authentication
- Configure email settings:
  - **Email Templates:** Customize verification, password reset templates
  - **Password Policy:** Set minimum length, complexity requirements

### Auth Settings
- **Session Length:** 365 days (or as needed)
- **Password History:** 5 (prevents reuse of recent passwords)
- **Password Dictionary:** Enable to prevent common passwords
- **Personal Data:** Disable if not collecting additional user data

**Note**: Anonymous sessions are not used in this application. All users must authenticate with a valid email address.

## Step 5: Environment Variables

Update your `.env` file with the following values:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_BUCKET_ID=your-bucket-id
```

## Step 6: Security & Permissions

### API Key Scopes
Ensure your API key has these minimum scopes:
- `databases.read`
- `databases.write`
- `files.read`
- `files.write`
- `users.read`
- `users.write`
- `sessions.write`

### Collection Permissions
All collections should have:
- **Read Access:** `users` (authenticated users only)
- **Write Access:** `users` (authenticated users only)

### Additional Security
1. **Rate Limiting:** Configure rate limits in Appwrite settings
2. **CORS:** Configure allowed origins for your domain
3. **Webhooks:** Set up webhooks for user events if needed

## Testing Your Setup

1. Test database connection by creating a test document
2. Test file upload to your bucket
3. Test user registration and login
4. Verify all collections are accessible with proper permissions

## Troubleshooting

### Common Issues:
1. **Permission Denied:** Check collection permissions and API key scopes
2. **File Upload Fails:** Verify bucket configuration and file size limits
3. **Auth Errors:** Ensure email/password and anonymous providers are enabled
4. **Database Connection:** Verify database ID and API credentials

### Useful Appwrite CLI Commands:
```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login to your account
appwrite login

# List projects
appwrite projects list

# Get project details
appwrite projects get --projectId [PROJECT_ID]
```

This setup replaces:
- **Neon Postgres** → Appwrite Database (NoSQL)
- **Vercel Blob** → Appwrite Storage
- **Auth.js** → Appwrite Authentication

Your Appwrite instance is now ready for the AI Chatbot migration! 
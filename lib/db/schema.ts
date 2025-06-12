// TypeScript types for Appwrite collections
// These match the collections created in Appwrite console

export interface User {
  $id: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface Chat {
  $id: string;
  userId: string;
  title: string;
  visibility: 'public' | 'private';
  createdAt: string;
}

export interface DBMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  parts: any[];
  attachments: any[];
  createdAt: Date;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  kind: string;
  createdAt: Date;
}

export interface Suggestion {
  id: string;
  documentId: string;
  userId: string;
  originalText: string;
  suggestedText: string;
  description?: string;
  isResolved: boolean;
  createdAt: Date;
}

export interface Vote {
  messageId: string;
  chatId: string;
  isUpvoted: boolean;
  createdAt: Date;
}

export interface Stream {
  streamId: string;
  chatId: string;
  createdAt: string;
}

// Legacy types for backward compatibility
export type MessageDeprecated = any;
export type VoteDeprecated = any;

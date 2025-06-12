import 'server-only';

import { ID, Query } from 'node-appwrite';
import { databases } from '@/lib/appwrite-server';

import type { 
  User,
  Chat,
  DBMessage,
  Document,
  Suggestion,
  Vote,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { generateUUID } from '../utils';
import type { VisibilityType } from '@/components/visibility-selector';
import { ChatSDKError } from '../errors';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;

// Collection IDs (should match what you created in Appwrite)
const COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats', 
  MESSAGES: 'messages',
  DOCUMENTS: 'documents',
  SUGGESTIONS: 'suggestions',
  VOTES: 'votes',
  STREAMS: 'streams',
} as const;

export async function getUser(email: string): Promise<Array<User>> {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('email', email)]
    );
    return result.documents as unknown as User[];
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string) {
  try {
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      ID.unique(),
      {
        email,
        password, // Appwrite handles hashing automatically
        createdAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}



export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CHATS,
      id,
      {
        userId,
        title,
        visibility,
        createdAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    // Delete related votes
    const votes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.VOTES,
      [Query.equal('chatId', id)]
    );
    
    for (const vote of votes.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.VOTES, vote.$id);
    }

    // Delete related messages
    const messages = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      [Query.equal('chatId', id)]
    );
    
    for (const message of messages.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MESSAGES, message.$id);
    }

    // Delete related streams
    const streams = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STREAMS,
      [Query.equal('chatId', id)]
    );
    
    for (const stream of streams.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.STREAMS, stream.$id);
    }

    // Delete the chat
    const deletedChat = await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CHATS, id);
    return deletedChat;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;
    const queries = [
      Query.equal('userId', id),
      Query.orderDesc('createdAt'),
      Query.limit(extendedLimit)
    ];

    if (startingAfter) {
      try {
        // Get the starting chat to compare dates
        const startChat = await databases.getDocument(DATABASE_ID, COLLECTIONS.CHATS, startingAfter);
        queries.push(Query.greaterThan('createdAt', startChat.createdAt));
      } catch (startError) {
        console.error('Error fetching starting chat:', startError);
        // If startingAfter chat doesn't exist, just ignore the pagination
      }
    } else if (endingBefore) {
      try {
        // Get the ending chat to compare dates
        const endChat = await databases.getDocument(DATABASE_ID, COLLECTIONS.CHATS, endingBefore);
        queries.push(Query.lessThan('createdAt', endChat.createdAt));
      } catch (endError) {
        console.error('Error fetching ending chat:', endError);
        // If endingBefore chat doesn't exist, just ignore the pagination
      }
    }

    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CHATS,
      queries
    );

    const filteredChats = result.documents as unknown as Chat[];
    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error: any) {
    console.error('Error in getChatsByUserId:', error);
    console.error('User ID:', id, 'Limit:', limit, 'StartingAfter:', startingAfter, 'EndingBefore:', endingBefore);
    
    // Check if it's a collection not found error
    if (error.code === 404 && error.type === 'collection_not_found') {
      console.error('❌ Appwrite collections not found. Please run: pnpm setup:appwrite');
      throw new ChatSDKError(
        'bad_request:database',
        'Database not set up. Please run the setup script: pnpm setup:appwrite'
      );
    }
    
    // Return empty result for other errors to prevent UI crashes
    return {
      chats: [],
      hasMore: false,
    };
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const chat = await databases.getDocument(DATABASE_ID, COLLECTIONS.CHATS, id);
    return chat as unknown as Chat;
  } catch (error) {
    throw new ChatSDKError('not_found:database', 'Chat not found');
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    const promises = messages.map(message => 
      databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        message.id,
        {
          chatId: message.chatId,
          role: message.role,
          parts: JSON.stringify(message.parts),
          attachments: JSON.stringify(message.attachments),
          createdAt: message.createdAt.toISOString(),
        }
      )
    );
    
    return await Promise.all(promises);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      [
        Query.equal('chatId', id),
        Query.orderAsc('createdAt'),
        Query.limit(1000) // Reasonable limit
      ]
    );

    return result.documents.map(doc => ({
      id: doc.$id,
      chatId: doc.chatId,
      role: doc.role,
      parts: JSON.parse(doc.parts),
      attachments: JSON.parse(doc.attachments || '[]'),
      createdAt: new Date(doc.createdAt),
    })) as DBMessage[];
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    // Check if vote already exists
    const existingVotes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.VOTES,
      [Query.equal('messageId', messageId)]
    );

    if (existingVotes.documents.length > 0) {
      // Update existing vote
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.VOTES,
        existingVotes.documents[0].$id,
        {
          isUpvoted: type === 'up',
          createdAt: new Date().toISOString(),
        }
      );
    } else {
      // Create new vote
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.VOTES,
        ID.unique(),
        {
          messageId,
          chatId,
          isUpvoted: type === 'up',
          createdAt: new Date().toISOString(),
        }
      );
    }
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.VOTES,
      [Query.equal('chatId', id)]
    );

    return result.documents.map(doc => ({
      messageId: doc.messageId,
      chatId: doc.chatId,
      isUpvoted: doc.isUpvoted,
      createdAt: new Date(doc.createdAt),
    })) as Vote[];
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DOCUMENTS,
      id,
      {
        userId,
        title,
        kind,
        content,
        createdAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DOCUMENTS,
      [Query.equal('$id', id)]
    );
    
    return result.documents.map(doc => ({
      id: doc.$id,
      title: doc.title,
      kind: doc.kind,
      content: doc.content,
      userId: doc.userId,
      createdAt: new Date(doc.createdAt),
    })) as Document[];
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by id',
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, id);
    return {
      id: doc.$id,
      title: doc.title,
      kind: doc.kind,
      content: doc.content,
      userId: doc.userId,
      createdAt: new Date(doc.createdAt),
    } as Document;
  } catch (error) {
    throw new ChatSDKError('not_found:database', 'Document not found');
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DOCUMENTS,
      [
        Query.equal('$id', id),
        Query.greaterThan('createdAt', timestamp.toISOString())
      ]
    );

    const deletePromises = result.documents.map(doc =>
      databases.deleteDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, doc.$id)
    );

    return await Promise.all(deletePromises);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents after timestamp',
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    const promises = suggestions.map(suggestion =>
      databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SUGGESTIONS,
        ID.unique(),
        {
          documentId: suggestion.documentId,
          userId: suggestion.userId,
          originalText: suggestion.originalText,
          suggestedText: suggestion.suggestedText,
          description: suggestion.description || '',
          isResolved: suggestion.isResolved || false,
          createdAt: suggestion.createdAt.toISOString(),
        }
      )
    );

    return await Promise.all(promises);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUGGESTIONS,
      [Query.equal('documentId', documentId)]
    );

    return result.documents.map(doc => ({
      id: doc.$id,
      documentId: doc.documentId,
      userId: doc.userId,
      originalText: doc.originalText,
      suggestedText: doc.suggestedText,
      description: doc.description,
      isResolved: doc.isResolved,
      createdAt: new Date(doc.createdAt),
    })) as Suggestion[];
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.MESSAGES, id);
    return [{
      id: doc.$id,
      chatId: doc.chatId,
      role: doc.role,
      parts: JSON.parse(doc.parts),
      attachments: JSON.parse(doc.attachments || '[]'),
      createdAt: new Date(doc.createdAt),
    }] as DBMessage[];
  } catch (error) {
    throw new ChatSDKError('not_found:database', 'Message not found');
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      [
        Query.equal('chatId', chatId),
        Query.greaterThan('createdAt', timestamp.toISOString())
      ]
    );

    const deletePromises = result.documents.map(doc =>
      databases.deleteDocument(DATABASE_ID, COLLECTIONS.MESSAGES, doc.$id)
    );

    return await Promise.all(deletePromises);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages after timestamp',
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.CHATS,
      chatId,
      { visibility }
    );
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility',
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - differenceInHours);

    // First get user's chats
    const userChats = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CHATS,
      [Query.equal('userId', id)]
    );

    if (userChats.documents.length === 0) {
      return 0;
    }

    const chatIds = userChats.documents.map(chat => chat.$id);
    
    // Count messages from user's chats after the time threshold
    let totalMessages = 0;
    
    for (const chatId of chatIds) {
      const messages = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('chatId', chatId),
          Query.greaterThan('createdAt', timeThreshold.toISOString()),
          Query.limit(1000) // Reasonable limit per chat
        ]
      );
      totalMessages += messages.documents.length;
    }

    return totalMessages;
  } catch (error: any) {
    console.error('Error in getMessageCountByUserId:', error);
    
    // Check if it's a collection not found error
    if (error.code === 404 && error.type === 'collection_not_found') {
      console.error('❌ Appwrite collections not found. Please run: pnpm setup:appwrite');
      throw new ChatSDKError(
        'bad_request:database',
        'Database not set up. Please run the setup script: pnpm setup:appwrite'
      );
    }
    
    // Return 0 for other errors to allow the app to continue
    console.error('Returning 0 message count due to error');
    return 0;
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.STREAMS,
      streamId,
      {
        streamId,
        chatId,
        createdAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create stream id');
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STREAMS,
      [
        Query.equal('chatId', chatId),
        Query.orderDesc('createdAt')
      ]
    );

    return result.documents.map(doc => doc.streamId);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

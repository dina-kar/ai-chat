import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/lib/auth-server';
import type { UserType } from '@/lib/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { webSearch } from '@/lib/ai/tools/web-search';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import type { Chat } from '@/lib/db/schema';
import { ChatSDKError } from '@/lib/errors';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    let requestBody: PostRequestBody;
    try {
      const json = await request.json();
      requestBody = postRequestBodySchema.parse(json);
    } catch (error) {
      console.error('Schema validation error:', error);
      return new ChatSDKError('bad_request:api', 'Invalid request body').toResponse();
    }

    const { id, message, selectedChatModel, selectedVisibilityType } = requestBody;

    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const userType: UserType = session.user.type;

    // Check rate limits
    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    // Handle chat creation or validation
    let chat;
    try {
      chat = await getChatById({ id });
    } catch (error) {
      // Chat doesn't exist, we'll create it
      chat = null;
    }

    if (!chat) {
      // Create new chat
      const title = await generateTitleFromUserMessage({ message });
      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      // Validate existing chat ownership
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    // Get previous messages
    const previousMessagesFromDb = await getMessagesByChatId({ id });

    // Convert DBMessage to UIMessage format for AI SDK compatibility
    const previousMessages = previousMessagesFromDb.map((dbMessage) => ({
      id: dbMessage.id,
      parts: dbMessage.parts || [],
      role: dbMessage.role as 'user' | 'assistant' | 'system',
      content: '', // deprecated but still needed for compatibility
      createdAt: dbMessage.createdAt,
      experimental_attachments: dbMessage.attachments || [],
    }));

    const messages = appendClientMessage({
      messages: previousMessages,
      message,
    });

    // Get geolocation for request hints
    const { longitude, latitude, city, country } = geolocation(request);
    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    // Save user message
    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: message.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    // Create stream ID for tracking
    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    // Create and return stream
    const stream = createDataStream({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel, requestHints }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'gemini-2.5-pro'
              ? []
              : [
                  'getWeather',
                  'webSearch',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            webSearch,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  console.error('No assistant message found');
                  return;
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role === 'data' ? 'assistant' : assistantMessage.role as 'user' | 'assistant' | 'system',
                      parts: assistantMessage.parts || [],
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (error) {
                console.error('Failed to save assistant message:', error);
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (error) => {
        console.error('Stream error:', error);
        return 'Oops, an error occurred!';
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error('POST /api/chat error:', error);
    
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    
    return new ChatSDKError('bad_request:api', 'An unexpected error occurred').toResponse();
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    const session = await auth();
    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    // If no chatId is provided, this might be an experimental_resume call
    // Return an empty response for such cases
    if (!chatId) {
      return new Response(JSON.stringify({ messages: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get chat and check permissions
    const chat = await getChatById({ id: chatId });
    
    if (chat.visibility === 'private' && chat.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    // Return empty data stream for simplicity
    const emptyDataStream = createDataStream({
      execute: () => {},
    });

    return new Response(emptyDataStream, { status: 200 });
  } catch (error) {
    console.error('GET /api/chat error:', error);
    
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    
    return new ChatSDKError('not_found:chat', 'Chat not found').toResponse();
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new ChatSDKError('bad_request:api', 'Parameter id is required').toResponse();
    }

    const session = await auth();
    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    // Get chat and check ownership
    const chat = await getChatById({ id });
    
    if (chat.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    // Delete chat and return result
    const deletedChat = await deleteChatById({ id });
    return Response.json(deletedChat, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/chat error:', error);
    
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    
    return new ChatSDKError('not_found:chat', 'Chat not found').toResponse();
  }
}

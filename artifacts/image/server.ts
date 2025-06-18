import { createDocumentHandler } from '@/lib/artifacts/server';
import Together from 'together-ai';
import { storage } from '@/lib/appwrite-server';
import { ID, Permission, Role } from 'appwrite';

// Initialize Together AI client
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// Appwrite database content field limit
const MAX_DB_CONTENT_SIZE = 65535;

async function storeImageContent(base64Content: string, title: string, userId: string): Promise<string> {
  // If content is small enough, return it directly for database storage
  if (base64Content.length <= MAX_DB_CONTENT_SIZE) {
    return base64Content;
  }

  // For large content, store in Appwrite Storage and return a reference
  try {
    // Convert base64 to blob
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });
    
    // Create a file from the blob
    const fileName = `image-${Date.now()}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    // Upload to Appwrite Storage with proper permissions
    const uploadResult = await storage.createFile(
      process.env.APPWRITE_BUCKET_ID!,
      ID.unique(),
      file,
      [
        Permission.read(Role.user(userId)),
        Permission.read(Role.any()), // Allow AI and public access for serving
      ]
    );

    // Return a storage reference instead of the raw base64
    return `storage:${uploadResult.$id}`;
  } catch (error) {
    console.error('Failed to store image in storage:', error);
    // Fallback: truncate the content to fit in database
    console.warn('Falling back to truncated content due to storage error');
    return base64Content.substring(0, MAX_DB_CONTENT_SIZE - 100) + '...truncated';
  }
}

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream, session }) => {
    let draftContent = '';

    try {
      console.log('Creating image with prompt:', title);
      
      const response = await together.images.create({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: title,
        width: 1024,
        height: 1024,
        steps: 4,
        response_format: "base64"
      });

      console.log('Together AI response structure:', {
        hasData: !!response?.data,
        dataLength: response?.data?.length,
        firstItemKeys: response?.data?.[0] ? Object.keys(response.data[0]) : [],
      });

      // With response_format: "base64", we expect the response in data[0].b64_json
      if (response?.data?.[0]?.b64_json) {
        const rawBase64 = response.data[0].b64_json;
        console.log('Successfully extracted base64 data, length:', rawBase64.length);
        
        // Store the content (either directly or in storage)
        draftContent = await storeImageContent(rawBase64, title, session.user.id);
        console.log('Stored content reference, length:', draftContent.length);
        
        // Always stream the raw base64 for immediate display
        dataStream.writeData({
          type: 'image-delta',
          content: rawBase64,
        });
      } else {
        console.error('Expected b64_json format not found. Full response:', JSON.stringify(response, null, 2));
        throw new Error('No base64 image data received from Together AI. Expected format: data[0].b64_json');
      }

      if (!draftContent) {
        throw new Error('Empty content after processing');
      }
    } catch (error) {
      console.error('Together AI image generation error:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream, session }) => {
    let draftContent = '';

    try {
      console.log('Updating image with prompt:', description);
      
      const response = await together.images.create({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: description,
        width: 1024,
        height: 1024,
        steps: 4,
        response_format: "base64"
      });

      console.log('Together AI response structure:', {
        hasData: !!response?.data,
        dataLength: response?.data?.length,
        firstItemKeys: response?.data?.[0] ? Object.keys(response.data[0]) : [],
      });

      // With response_format: "base64", we expect the response in data[0].b64_json
      if (response?.data?.[0]?.b64_json) {
        const rawBase64 = response.data[0].b64_json;
        console.log('Successfully extracted base64 data, length:', rawBase64.length);
        
        // Store the content (either directly or in storage)
        draftContent = await storeImageContent(rawBase64, description, session.user.id);
        console.log('Stored content reference, length:', draftContent.length);
        
        // Always stream the raw base64 for immediate display
        dataStream.writeData({
          type: 'image-delta',
          content: rawBase64,
        });
      } else {
        console.error('Expected b64_json format not found. Full response:', JSON.stringify(response, null, 2));
        throw new Error('No base64 image data received from Together AI. Expected format: data[0].b64_json');
      }

      if (!draftContent) {
        throw new Error('Empty content after processing');
      }
    } catch (error) {
      console.error('Together AI image generation error:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return draftContent;
  },
});

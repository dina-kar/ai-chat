import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ID } from 'appwrite';

import { auth } from '@/lib/auth-server';
import { storage } from '@/lib/appwrite-server';

// Define supported file types based on chat schema
const SUPPORTED_FILE_TYPES = [
  // Image formats
  'image/png', 
  'image/jpg', 
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Document formats
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
  'application/xml',
  'text/xml',
  // Audio formats  
  'audio/mp3',
  'audio/wav',
  'audio/m4a',
  'audio/ogg',
  // Video formats
  'video/mp4',
  'video/webm',
  'video/mov',
  'video/avi',
];

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 50 * 1024 * 1024, {
      message: 'File size should be less than 50MB',
    })
    .refine((file) => SUPPORTED_FILE_TYPES.includes(file.type), {
      message: `File type not supported. Supported types: ${SUPPORTED_FILE_TYPES.join(', ')}`,
    }),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get('file') as File).name;
    
    // Convert Blob to File for Appwrite
    const fileForAppwrite = new File([file], filename, { type: file.type });

    try {
      // Upload to Appwrite Storage
      const result = await storage.createFile(
        process.env.APPWRITE_BUCKET_ID!,
        ID.unique(),
        fileForAppwrite,
        [
          // Allow the user to read the file
          `read("user:${session.user?.id}")`,
        ]
      );

      // Get the request URL to construct the full URL
      const requestUrl = new URL(request.url);
      const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

      // Return file information compatible with existing code
      const data = {
        url: `${baseUrl}/api/files/${result.$id}`,
        downloadUrl: `${baseUrl}/api/files/${result.$id}`,
        pathname: filename,
        contentType: file.type,
        contentDisposition: `attachment; filename="${filename}"`,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        fileId: result.$id,
      };

      return NextResponse.json(data);
    } catch (error) {
      console.error('Appwrite upload error:', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}

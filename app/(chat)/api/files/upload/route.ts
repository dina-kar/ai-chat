import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ID } from 'appwrite';

import { auth } from '@/lib/auth-server';
import { storage } from '@/lib/appwrite-server';

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    // Update the file type based on the kind of files you want to accept
    .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
      message: 'File type should be JPEG or PNG',
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

      // Return file information compatible with existing code
      const data = {
        url: `/api/files/${result.$id}`,
        downloadUrl: `/api/files/${result.$id}`,
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

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { storage } from '@/lib/appwrite-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get file from Appwrite using server client (which has API key)
    const file = await storage.getFileView(
      process.env.APPWRITE_BUCKET_ID!,
      fileId
    );

    // Stream the file content back to the client
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('File proxy error:', error);
    return new NextResponse('File not found', { status: 404 });
  }
} 
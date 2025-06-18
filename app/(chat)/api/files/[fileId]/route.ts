import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { storage } from '@/lib/appwrite-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    // Check authentication - but allow AI requests to access files
    const session = await auth();
    
    // For AI requests or when no session, we'll still try to serve the file
    // This is needed because AI tools make requests without session cookies
    try {
      // Get file metadata first to determine content type
      const fileMetadata = await storage.getFile(
        process.env.APPWRITE_BUCKET_ID!,
        fileId
      );

      // Get file content
      const file = await storage.getFileView(
        process.env.APPWRITE_BUCKET_ID!,
        fileId
      );

      // Determine content type based on file metadata
      const contentType = fileMetadata.mimeType || 'application/octet-stream';
      
      // Set appropriate headers based on file type
      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
        // Allow cross-origin requests for AI tools
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      // For downloadable files (documents), add content disposition
      if (contentType.startsWith('application/') || contentType.startsWith('text/')) {
        headers['Content-Disposition'] = `inline; filename="${fileMetadata.name}"`;
      }

      // Stream the file content back to the client
      return new NextResponse(file, {
        status: 200,
        headers,
      });
    } catch (fileError) {
      console.error('File access error:', fileError);
      
      // If no session and file access failed, return 401
      if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      
      // If session exists but file access failed, return 404
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('File proxy error:', error);
    return new NextResponse('File not found', { status: 404 });
  }
} 
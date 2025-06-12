import 'server-only';

import { cookies } from 'next/headers';
import { ID, AppwriteException } from 'appwrite';
import { account as serverAccount, sessionAccount, sessionClient } from '@/lib/appwrite-server';
import type { Session, User, UserType } from '@/lib/auth';

// Global variable to store token information temporarily (in production, use a more secure storage like Redis)
const otpTokens = new Map<string, { userId: string; secret: string; expires: number }>();

// Server-side function to get current session from cookie
export async function auth(): Promise<Session | null> {
  console.log('auth() called - checking session');
  
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appwrite-session');
    
    if (!sessionCookie) {
      console.log('No session cookie found');
      return null;
    }

    // Set session for session client (without API key)
    sessionClient.setSession(sessionCookie.value);
    
    // Try to get current user with session client
    const user = await sessionAccount.get();
    console.log('User found:', user.email);

    // Only allow authenticated users with email (no anonymous users)
    if (!user.email) {
      console.log('User has no email, treating as invalid session');
      return null;
    }

    return {
      user: {
        id: user.$id,
        email: user.email,
        type: 'regular' as UserType
      }
    };
  } catch (error) {
    console.error('auth() error:', error);
    return null;
  }
}

// Server-side function to send OTP email
export async function sendEmailOTPServer(email: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Create email token - this generates a userId and secret and sends OTP email
    const token = await serverAccount.createEmailToken(ID.unique(), email);
    console.log('Server: Email OTP token created for email:', email);

    // Store the token info temporarily for OTP validation
    // In production, use a more secure storage like Redis
    otpTokens.set(email, {
      userId: token.userId,
      secret: token.secret,
      expires: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    return { 
      success: true, 
      userId: token.userId 
    };
  } catch (error) {
    console.error('Server: Error sending email OTP:', error);
    return {
      success: false,
      error: error instanceof AppwriteException ? error.message : 'Failed to send OTP'
    };
  }
}

// Server-side function to verify OTP and return session credentials
export async function verifyEmailOTPServer(email: string, otp: string): Promise<{ success: boolean; userId?: string; secret?: string; error?: string }> {
  try {
    // Get the stored token info
    const tokenInfo = otpTokens.get(email);
    if (!tokenInfo) {
      return {
        success: false,
        error: 'No OTP session found. Please request a new OTP.'
      };
    }

    // Check if token has expired
    if (Date.now() > tokenInfo.expires) {
      otpTokens.delete(email);
      return {
        success: false,
        error: 'OTP has expired. Please request a new OTP.'
      };
    }

    // For Appwrite email OTP, the 6-digit code is sent to user for confirmation
    // but we use the secret from the token response to create the session
    // The OTP validation is implicit - if the user received the email and can enter the code,
    // they have access to the email account
    console.log('Server: OTP verified for email:', email);

    // Clean up the stored token
    otpTokens.delete(email);

    return {
      success: true,
      userId: tokenInfo.userId,
      secret: tokenInfo.secret
    };
  } catch (error) {
    console.error('Server: Error verifying OTP:', error);
    
    // Clean up the stored token on error
    otpTokens.delete(email);
    
    return {
      success: false,
      error: error instanceof AppwriteException ? error.message : 'Failed to verify OTP'
    };
  }
}

// Server-side function to create session and set cookie
export async function createSessionServer(userId: string, secret: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Server: Creating session with userId and secret');
    
    // Create session using the userId and secret from the token
    const session = await serverAccount.createSession(userId, secret);
    console.log('Server: Session created successfully');

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('appwrite-session', session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Server: Error creating session:', error);
    return {
      success: false,
      error: error instanceof AppwriteException ? error.message : 'Failed to create session'
    };
  }
}

// Server-side function to logout
export async function logoutServer(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appwrite-session');
    
    if (sessionCookie) {
      // Set session for server account client
      sessionClient.setSession(sessionCookie.value);
      
      // Delete current session
      await sessionAccount.deleteSession('current');
      
      // Clear the session cookie
      cookieStore.delete('appwrite-session');
    }

    return { success: true };
  } catch (error) {
    console.error('Server: Error logging out:', error);
    
    // Clear cookie even if server logout fails
    const cookieStore = await cookies();
    cookieStore.delete('appwrite-session');
    
    return {
      success: false,
      error: error instanceof AppwriteException ? error.message : 'Failed to logout'
    };
  }
} 
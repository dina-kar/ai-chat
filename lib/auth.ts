import { account, client } from './appwrite';
import { ID, AppwriteException } from 'appwrite';

export type UserType = 'regular';

export interface User {
  id: string;
  email: string;
  type: UserType;
}

export interface Session {
  user: User;
}

// Global variable to store token information temporarily for client-side
const otpTokens = new Map<string, { userId: string; secret: string; expires: number }>();

// Client-side function to send OTP email
export async function sendEmailOTP(email: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Create email token - this generates a userId and secret and sends OTP email
    const token = await account.createEmailToken(ID.unique(), email);
    console.log('Email OTP token created:', token);

    return { 
      success: true, 
      userId: token.userId 
    };
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return {
      success: false,
      error: error instanceof AppwriteException ? error.message : 'Failed to send OTP'
    };
  }
}

// Client-side function to create session using userId and secret
// Note: The secret comes from the server after OTP validation
export async function createSessionFromToken(userId: string, secret: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Creating session with userId and secret');
    
    const session = await account.createSession(userId, secret);
    console.log('Session created successfully:', session);

    return { success: true };
  } catch (error) {
    console.error('Error creating session:', error);
    return {
      success: false,
      error: error instanceof AppwriteException ? error.message : 'Failed to create session'
    };
  }
}

// Client-side function to logout
export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    await account.deleteSession('current');
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    return {
      success: false,
      error: error instanceof AppwriteException ? error.message : 'Failed to logout'
    };
  }
}

// Client-side function to get current user
export async function getCurrentUser(): Promise<{ user: User | null; error?: string }> {
  try {
    const user = await account.get();
    return {
      user: {
        id: user.$id,
        email: user.email,
        type: 'regular' as UserType
      }
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      user: null,
      error: error instanceof AppwriteException ? error.message : 'Failed to get user'
    };
  }
} 
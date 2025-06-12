'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { sendEmailOTPServer, verifyEmailOTPServer, createSessionServer } from '@/lib/auth-server';

const emailSchema = z.object({
  email: z.string().email(),
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
});

export interface EmailActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  message?: string;
  userId?: string;
}

export interface OTPActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  message?: string;
}

export const sendOTP = async (
  _: EmailActionState,
  formData: FormData,
): Promise<EmailActionState> => {
  try {
    const validatedData = emailSchema.parse({
      email: formData.get('email'),
    });

    const result = await sendEmailOTPServer(validatedData.email);

    if (result.success) {
      return {
        status: 'success',
        message: 'OTP sent to your email! Please check your inbox.',
        userId: result.userId,
      };
    } else {
      return {
        status: 'failed',
        message: result.error || 'Failed to send OTP',
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: 'invalid_data',
        message: 'Please enter a valid email address',
      };
    }

    return {
      status: 'failed',
      message: 'An unexpected error occurred',
    };
  }
};

export const verifyOTP = async (
  _: OTPActionState,
  formData: FormData,
): Promise<OTPActionState> => {
  try {
    const validatedData = otpSchema.parse({
      email: formData.get('email'),
      otp: formData.get('otp'),
    });

    // First verify the OTP and get session credentials
    const verifyResult = await verifyEmailOTPServer(
      validatedData.email,
      validatedData.otp,
    );

    if (!verifyResult.success) {
      return {
        status: 'failed',
        message: verifyResult.error || 'Invalid OTP code',
      };
    }

    // Create session using the credentials
    const sessionResult = await createSessionServer(
      verifyResult.userId!,
      verifyResult.secret!,
    );

    if (sessionResult.success) {
      redirect('/');
    } else {
      return {
        status: 'failed',
        message: sessionResult.error || 'Failed to create session',
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: 'invalid_data',
        message: 'Please enter a valid 6-digit OTP code',
      };
    }

    // Handle redirect
    throw error;
  }
};

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('appwrite-session');
  redirect('/login');
}

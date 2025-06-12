'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { sendOTP, verifyOTP, type EmailActionState, type OTPActionState } from '../actions';
import { toast } from '@/components/toast';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const [emailState, emailAction] = useActionState<EmailActionState, FormData>(
    sendOTP,
    {
      status: 'idle',
    },
  );

  const [otpState, otpAction] = useActionState<OTPActionState, FormData>(
    verifyOTP,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (emailState.status === 'success') {
      setShowOTP(true);
      toast({ 
        type: 'success', 
        description: emailState.message || 'OTP sent to your email!' 
      });
    } else if (emailState.status === 'failed') {
      toast({ 
        type: 'error', 
        description: emailState.message || 'Failed to send OTP!' 
      });
    } else if (emailState.status === 'invalid_data') {
      toast({
        type: 'error',
        description: emailState.message || 'Please enter a valid email address!',
      });
    }
  }, [emailState]);

  useEffect(() => {
    if (otpState.status === 'failed') {
      toast({ 
        type: 'error', 
        description: otpState.message || 'Invalid OTP code!' 
      });
    } else if (otpState.status === 'invalid_data') {
      toast({
        type: 'error',
        description: otpState.message || 'Please enter a valid OTP code!',
      });
    } else if (otpState.status === 'success') {
      toast({ 
        type: 'success', 
        description: 'Account created successfully!' 
      });
      setIsSuccessful(true);
      router.refresh();
    }
  }, [otpState, router]);

  const handleEmailSubmit = (formData: FormData) => {
    const emailValue = formData.get('email') as string;
    setEmail(emailValue);
    emailAction(formData);
  };

  const handleOTPSubmit = (formData: FormData) => {
    const otpValue = formData.get('otp') as string;
    setOtp(otpValue);
    
    // Add email to form data for OTP verification
    const otpFormData = new FormData();
    otpFormData.append('email', email);
    otpFormData.append('otp', otpValue);
    
    otpAction(otpFormData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {showOTP ? 'Enter the OTP sent to your email' : 'Enter your email to receive an OTP'}
          </p>
        </div>

        {!showOTP ? (
          <AuthForm action={handleEmailSubmit} defaultEmail={email}>
            <div>
              <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-zinc-200"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your email"
                type="email"
                id="email"
                name="email"
                defaultValue={email}
                required
              />
            </div>
            <SubmitButton isSuccessful={false}>Send OTP</SubmitButton>
          </AuthForm>
        ) : (
          <AuthForm action={handleOTPSubmit} defaultEmail="">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3">
                OTP sent to: <span className="font-medium">{email}</span>
              </p>
              <label
                className="mb-3 block text-xs font-medium text-gray-900 dark:text-zinc-200"
                htmlFor="otp"
              >
                OTP Code
              </label>
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Enter 6-digit OTP"
                type="text"
                id="otp"
                name="otp"
                defaultValue={otp}
                maxLength={6}
                required
              />
            </div>
            <SubmitButton isSuccessful={isSuccessful}>Verify OTP</SubmitButton>
            <button
              type="button"
              onClick={() => {
                setShowOTP(false);
                setOtp('');
              }}
              className="text-sm text-gray-600 dark:text-zinc-400 hover:underline mt-2"
            >
              ← Back to email
            </button>
          </AuthForm>
        )}

        <div className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
          {'Already have an account? '}
          <Link
            href="/login"
            className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
          >
            Sign in
          </Link>
          {' instead.'}
        </div>
      </div>
    </div>
  );
}

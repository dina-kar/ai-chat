'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { sendOTP, verifyOTP, type EmailActionState, type OTPActionState } from '../actions';

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

  // Check for error in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      toast({
        type: 'error',
        description: `Error: ${error.replace(/_/g, ' ')}`,
      });
    }
  }, []);

  useEffect(() => {
    if (emailState.status === 'success') {
      setShowOTP(true);
      toast({
        type: 'success',
        description: emailState.message || 'OTP sent to your email!',
      });
    } else if (emailState.status === 'failed') {
      toast({
        type: 'error',
        description: emailState.message || 'Failed to send OTP!',
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
        description: otpState.message || 'Invalid OTP code!',
      });
    } else if (otpState.status === 'invalid_data') {
      toast({
        type: 'error',
        description: otpState.message || 'Please enter a valid OTP code!',
      });
    } else if (otpState.status === 'success') {
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
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12 glass-effect p-8 mx-4">
        <div className="flex flex-col items-center justify-center gap-4 px-4 text-center sm:px-16">
          <div className="size-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome Back
          </h3>
          <p className="text-sm text-muted-foreground">
            {showOTP ? 'Enter the OTP sent to your email' : 'Enter your email to receive an OTP'}
          </p>
        </div>

        {!showOTP ? (
          <AuthForm action={handleEmailSubmit} defaultEmail={email}>
            <div>
              <label
                className="mb-3 mt-5 block text-sm font-medium text-foreground"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="peer block w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm py-3 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
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
              <p className="text-sm text-muted-foreground mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                OTP sent to: <span className="font-medium text-primary">{email}</span>
              </p>
              <label
                className="mb-3 block text-sm font-medium text-foreground"
                htmlFor="otp"
              >
                OTP Code
              </label>
              <input
                className="peer block w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm py-3 px-4 outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-center text-lg tracking-widest"
                placeholder="000000"
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
              className="text-sm text-muted-foreground hover:text-primary hover:underline mt-4 transition-colors duration-200"
            >
              ← Back to email
            </button>
          </AuthForm>
        )}

        <div className="text-center text-sm text-muted-foreground mt-4">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-accent hover:underline transition-colors duration-200"
          >
            Sign up
          </Link>
          {' for free.'}
        </div>
      </div>
    </div>
  );
}

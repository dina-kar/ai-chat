import Form from 'next/form';
import { signOutAction } from '@/app/(auth)/actions';

export const SignOutForm = () => {
  return (
    <Form action={signOutAction} className="w-full">
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-destructive"
      >
        Sign out
      </button>
    </Form>
  );
};

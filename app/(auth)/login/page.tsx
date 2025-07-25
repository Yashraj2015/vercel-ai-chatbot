'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';
import Image from 'next/image'
import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import img from '../../../public/images/banner.png'
import { login, type LoginActionState } from '../actions';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast({
        type: 'error',
        description: 'Invalid credentials!',
      });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen flex-col items-center pt-12 md:pt-0 md:items-center justify-center bg-background px-4">
      <div className='absolute top-16 '>
        <Image src={img} alt='' width={150} />
      </div>
      <div className="w-full max-w-md overflow-hidden rounded-[50px] flex flex-col  gap-12 bg-zinc-900 pt-12 pb-8 px-7 md:px-1 ">
        {/* <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div> */}
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Log in</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
            {''}
          </p>
          <p className="text-center text-xs text-gray-600 mt-4 dark:text-zinc-400">
            {`By signing in, you agree to Srushti's`}
            <br/>
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Terms
            </Link>
            {' and'}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              &nbsp;Privacy Policy
            </Link>
          </p>
        </AuthForm>
      </div>
    </div>
  );
}

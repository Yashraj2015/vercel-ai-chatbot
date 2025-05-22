'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useRef } from 'react';
import { toast } from '@/components/toast';
import ReCAPTCHA from 'react-google-recaptcha';
import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-buttons';
import { register, type RegisterActionState } from '../actions';
import img from '../../../public/images/banner.png'
import Image from 'next/image'

export default function Page() {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    },
  );

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    setIsButtonDisabled(!token);
  };

  const resetRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
      setRecaptchaToken(null);
      setIsButtonDisabled(true);
    }
  };

  const handleSubmit = (formData: FormData) => {
    if (!recaptchaToken) {
      toast({ type: 'error', description: 'Please complete the reCAPTCHA!' });
      return;
    }

    formData.append('recaptchaToken', recaptchaToken);
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  useEffect(() => {
    if (state.status === 'user_exists') {
      toast({ type: 'error', description: 'Account already exists!' });
      resetRecaptcha();
    } else if (state.status === 'failed') {
      toast({ type: 'error', description: 'Failed to create account!' });
      resetRecaptcha();
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
      resetRecaptcha();
    } else if (state.status === 'recaptcha_failed') {
      toast({ type: 'error', description: 'reCAPTCHA verification failed!' });
      resetRecaptcha();
    } else if (state.status === 'success') {
      toast({ type: 'success', description: 'Account created successfully!' });
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className='absolute top-16 '>
        <Image src={img} alt='' width={150} />
      </div>
      <div className="w-full max-w-md overflow-hidden rounded-[50px] flex flex-col  gap-12 bg-zinc-900 pt-12 pb-8 px-7 md:px-1 ">
        {/* <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with your email and password
          </p>
        </div> */}
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <div className="flex flex-col gap-4 ">
            <ReCAPTCHA
              className='mt-3 ml-1'
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={handleRecaptchaChange}
              onExpired={() => {
                setRecaptchaToken(null);
                setIsButtonDisabled(true);
              }}
              onErrored={() => {
                setRecaptchaToken(null);
                setIsButtonDisabled(true);
              }}
            />
            <SubmitButton 
              isSuccessful={isSuccessful}
              disabled={isButtonDisabled}
            >
              Sign Up
            </SubmitButton>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {'Already have an account? '}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign in
            </Link>
          </p>
          <p className="text-center text-xs text-gray-600 mt-4 dark:text-zinc-400">
            {`By signing up, you agree to Srushti's`}
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
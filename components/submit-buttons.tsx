'use client';

import { useFormStatus } from 'react-dom';

import { LoaderIcon } from '@/components/icons';

import { Button } from './ui/button';

export function SubmitButton({
  children,
  isSuccessful,
  disabled = false, // Add disabled prop
}: {
  children: React.ReactNode;
  isSuccessful: boolean;
  disabled?: boolean; // Make it optional
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type={pending ? 'button' : 'submit'}
      aria-disabled={pending || isSuccessful || disabled} // Include disabled in aria
      disabled={pending || isSuccessful || disabled} // Include disabled in button state
      className="relative rounded-xl mt-4 bg-zinc-100"
    >
      {children}

      {(pending || isSuccessful) && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {pending || isSuccessful ? 'Loading' : 'Submit form'}
      </output>
    </Button>
  );
}
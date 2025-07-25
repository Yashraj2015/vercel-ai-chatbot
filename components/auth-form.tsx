import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  return (
    <Form action={action} className="flex flex-col gap-2 px-4 sm:px-16">
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm rounded-xl py-5 "
          type="email"
          placeholder="Email account"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm rounded-xl py-5"
          type="password"
          placeholder="Password"
          required
        />
      </div>

      {children}
    </Form>
  );
}

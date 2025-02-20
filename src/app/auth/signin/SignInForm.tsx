'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

interface Provider {
  id: string;
  name: string;
  type: string;
}

interface SignInFormProps {
  providers: Record<string, Provider> | null;
}

const providerIcons = {
  google: '/icons/google.svg',
  facebook: '/icons/facebook.svg',
  apple: '/icons/apple.svg',
};

export default function SignInForm({ providers }: SignInFormProps) {
  if (!providers) return null;

  return (
    <div className="mt-8 space-y-6">
      <div className="space-y-4">
        {Object.values(providers).map((provider) => (
          <button
            key={provider.id}
            onClick={() => signIn(provider.id)}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {providerIcons[provider.id as keyof typeof providerIcons] && (
              <Image
                src={providerIcons[provider.id as keyof typeof providerIcons]}
                alt={`${provider.name} logo`}
                width={24}
                height={24}
                className="mr-2"
              />
            )}
            Sign in with {provider.name}
          </button>
        ))}
      </div>
    </div>
  );
} 
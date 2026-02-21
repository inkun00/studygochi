'use client';

import dynamic from 'next/dynamic';

const AuthForm = dynamic(() => import('@/components/auth/AuthForm'), {
  ssr: false,
});

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-emerald-50 to-sky-50">
      <AuthForm mode="login" />
    </div>
  );
}

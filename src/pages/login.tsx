import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { login as loginApi } from '../services/auth';
import { LoginDto } from '../types/auth';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/src/component/ui/button';

export default function Login() {
  const router = useRouter();
  const auth = useAuth(); 

  const [form, setForm] = useState<LoginDto>({
    email: '',
    password: '',
  });

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      auth.login(data.accessToken);
      router.push('/dashboard');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  // Trigger Google OAuth flow
  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans relative overflow-hidden">
        {/* Animated Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      
      <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm border border-gray-100 p-10 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 mb-6">
            W
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to your Wordoo account</p>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-6 shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84a4.15 4.15 0 0 1-1.8 2.71v2.26h2.91a8.78 8.78 0 0 0 2.69-6.6z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.85-3.05.85-2.35 0-4.33-1.58-5.04-3.71H.95v2.33A8.99 8.99 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.95a8.99 8.99 0 0 0 0 8.08l3.01-2.33z" fill="#FBBC05" />
            <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A8.99 8.99 0 0 0 9 0 8.99 8.99 0 0 0 .95 4.96L3.96 7.29C4.67 3.16 6.65 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-400">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mutation.isError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {(mutation.error as any)?.message || 'Invalid email or password.'}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-900">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-900">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-2.5"
            variant="black"
            isLoading={mutation.isPending}
          >
            {mutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
          
          <div className="flex flex-col items-center gap-4 mt-6">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Forgot password?
            </Link>
            <div className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
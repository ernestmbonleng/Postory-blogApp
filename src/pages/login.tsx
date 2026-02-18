import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { login as loginApi } from '../services/auth';
import { LoginDto } from '../types/auth';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/src/component/ui/button';

// ... imports exactly the same ...

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans relative overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      
      <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm border border-gray-100 p-10 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 mb-6">
            B
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to your BlogForge account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Use your design's mutation error display instead of alert */}
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
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 placeholder:text-gray-400"
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
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 placeholder:text-gray-400"
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
              className="text-sm font-medium text-primary hover:text-indigo-700 transition-colors"
            >
              Forgot password?
            </Link>
            <div className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:text-indigo-700 transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
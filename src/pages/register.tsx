import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { registerUser } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/src/component/ui/button';

interface FormState {
  email: string;
  password: string;
  username: string;
}

export default function Register() {
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    username: '',
  });

  // Keep track of the specific email validation error
  const [emailError, setEmailError] = useState<string | null>(null);

  const router = useRouter();
  const auth = useAuth();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      auth.login(data.accessToken);
      router.push('/dashboard');
    },
  });


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address.";

    const lowerEmail = email.toLowerCase();

    if (lowerEmail.includes("@gmail.") && !lowerEmail.endsWith("@gmail.com")) {
      return "Email is not valid";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const error = validateEmail(form.email);
    if (error) {
      setEmailError(error);
      return;
    }

    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans relative overflow-hidden">
      {/* Design Maintained: Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm border border-gray-100 p-10 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 mb-6">
            B
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-500 text-sm">Start your blog journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mutation.isError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {(mutation.error as any)?.message || 'Failed to create account.'}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-900">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="JohnPaul"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-900">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setEmailError(null); // Clear error as user fixes it
              }}
              placeholder="john@example.com"
              className={`w-full px-3 py-2.5 rounded-lg border outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
                emailError ? 'border-red-500 bg-red-50/20' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
              }`}
              required
            />
            {/* Contextual Error Message under the input */}
            {emailError && (
              <p className="text-[11px] font-bold text-red-500 mt-1 lowercase tracking-tight">
                {emailError}
              </p>
            )}
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
            Sign up
          </Button>

          <div className="flex flex-col items-center gap-4 mt-6">
            <div className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-indigo-700 transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
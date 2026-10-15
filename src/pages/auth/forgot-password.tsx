import { useState } from 'react';
import { useRouter } from 'next/router';
import { passwordResetService } from '@/src/services/password-reset.service';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log("Attempting to send reset code...");
      const response = await passwordResetService.forgotPassword(email);
      console.log("Server success:", response.message);


      sessionStorage.setItem('resetEmail', email);

      const expiry = Date.now() + 15 * 60 * 1000;
      sessionStorage.setItem('resetExpiry', expiry.toString());


      setTimeout(() => {
        router.push('/auth/verify-reset-code');
      }, 100);

    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset code to <strong>{email}</strong>
          </p>
          <button
            onClick={() => router.push('/auth/verify-reset-code')}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Enter reset code
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Didn't receive it?{' '}
            <button
              onClick={() => setSuccess(false)}
              className="text-indigo-600 hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
        <p className="text-gray-600 mb-6">
          Enter your email and we'll send you a reset code.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isLoading ? 'Sending...' : 'Send reset code'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
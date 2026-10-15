import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const ResetPasswordForm = () => {
  const router = useRouter();
  const { token: urlToken } = router.query;
  
  const [formData, setFormData] = useState({
    token: urlToken || '',
    newPassword: '',
    confirm: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirm) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: formData.token,
          newPassword: formData.newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6">
            <CheckCircle className="text-green-600" size={30} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password reset successful!</h2>
          <p className="text-gray-500 mb-8">Redirecting you to login...</p>
          <Link 
            href="/login"
            className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Set new password</h2>
          <p className="text-gray-500 mt-2">Must be at least 6 characters.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Reset Token</label>
            <input
              type="text"
              name="token"
              value={formData.token}
              onChange={handleChange}
              placeholder="Enter the 6-digit code"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden transition-all text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden transition-all text-gray-900"
       
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              value={formData.confirm}  
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden transition-all text-gray-900"
            />
          </div>

          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 outline-hidden"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Reset password'}
          </button>

          <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back to login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
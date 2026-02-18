import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { passwordResetService } from '@/src/services/password-reset.service';

export default function VerifyResetCodePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false); // Separate loading for resend
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Add success message
  const [timeLeft, setTimeLeft] = useState(900);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [canResend, setCanResend] = useState(false); // Control resend availability

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      router.push('/auth/forgot-password');
      return;
    }
    setEmail(storedEmail);

    const storedExpiry = sessionStorage.getItem('resetExpiry');
    
    if (storedExpiry) {
      const expiry = parseInt(storedExpiry, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setTimeLeft(remaining);
      setExpiryTime(expiry);
      
      if (remaining <= 0) {
        router.push('/auth/forgot-password?expired=true');
        return;
      }
    } else {
      const newExpiry = Date.now() + 15 * 60 * 1000;
      sessionStorage.setItem('resetExpiry', newExpiry.toString());
      setExpiryTime(newExpiry);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sessionStorage.removeItem('resetExpiry');
          sessionStorage.removeItem('resetEmail');
          setCanResend(true); // Enable resend when expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // Enable resend after 60 seconds (or when code expires)
  useEffect(() => {
    if (timeLeft < 840 || timeLeft === 0) { // 60 seconds = 900 - 60 = 840
      setCanResend(true);
    } else {
      setCanResend(false);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...resetCode];
    newCode[index] = value.toUpperCase();
    setResetCode(newCode);
    setError(''); // Clear error when user types

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !resetCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const part1 = resetCode.slice(0, 3).join('');
    const part2 = resetCode.slice(3, 6).join('');
    const fullCode = `${part1}-${part2}`;
    
    if (part1.length !== 3 || part2.length !== 3) { 
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await passwordResetService.verifyResetCode(email, fullCode);
      sessionStorage.setItem('resetCode', fullCode);
      sessionStorage.removeItem('resetExpiry');
      router.push('/auth/reset-password');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResendLoading(true);
    setError('');
    setSuccess('');

    try {
      await passwordResetService.resendResetCode(email);
      
      // Reset timer
      const newExpiry = Date.now() + 15 * 60 * 1000;
      sessionStorage.setItem('resetExpiry', newExpiry.toString());
      setExpiryTime(newExpiry);
      setTimeLeft(900);
      setResetCode(['', '', '', '', '', '']);
      setSuccess('New code sent successfully!');
      setCanResend(false); // Disable resend button again
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResendLoading(false);
    }
  };

  if (timeLeft === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Code Expired</h1>
          <p className="text-gray-600 mb-6">
            Your reset code has expired. Please request a new one.
          </p>
          <button
            onClick={() => router.push('/auth/forgot-password')}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Request new code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Enter reset code</h1>
        <p className="text-gray-600 mb-2">
          We sent a code to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Code expires in: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          {canResend && timeLeft > 0 && (
            <span className="ml-2 text-xs text-green-600">(You can request a new code)</span>
          )}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-6">
            {resetCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading || isResendLoading}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || timeLeft === 0 || isResendLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-300 mb-3"
          >
            {isLoading ? 'Verifying...' : 'Verify code'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResendLoading || (!canResend && timeLeft > 0)}
            className={`w-full py-2 text-sm rounded-lg transition-colors ${
              isResendLoading || (!canResend && timeLeft > 0)
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-50 hover:underline'
            }`}
          >
            {isResendLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            ) : (
              'Resend code'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
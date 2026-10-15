import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth'; 

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuth(); 

  useEffect(() => {

    if (!router.isReady) return;

    const { token, user } = router.query;

    if (token && typeof token === 'string' && user && typeof user === 'string') {
      console.log("Authentication successful, initializing session...");

      login(token, JSON.parse(user)); 


      router.replace('/dashboard');
    } else {
      console.error("No token found in callback URL");
      router.replace('/login?error=no_token');
    }
  }, [router.isReady, router.query, login]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600 font-medium">Finalizing your login...</p>
    </div>
  );
}
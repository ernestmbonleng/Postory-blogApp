// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from '@/src/contexts/NotificationContext';


// Create a React Query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <NotificationProvider>
        <Component {...pageProps} />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

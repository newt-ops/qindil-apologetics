import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { useAuthStore } from './stores/authStore';
import { getMeApi } from './api/auth';
import ToastContainer from './components/ui/Toast';
import ErrorBoundary from './components/shared/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);

  useEffect(() => {
    // Rehydrate auth state on boot via silent refresh cookie check (/auth/me)
    getMeApi()
      .then((res) => {
        if (res?.data?.user) {
          setUser(res.data.user);
        }
        if (res?.data?.permissions) {
          setPermissions(res.data.permissions);
        }
      })
      .catch(() => {
        // Unauthenticated session
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setUser, setPermissions, setIsLoading]);

  return <>{children}</>;
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthInitializer>
            <AppRoutes />
            <ToastContainer />
          </AuthInitializer>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

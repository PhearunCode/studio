'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

const publicPages = ['/login', '/view-loan'];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        // If firebase isn't configured, we allow access to all pages
        // to avoid getting stuck on a loading screen.
        console.warn("Firebase auth is not configured. Route protection is disabled.")
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (loading || !auth) return;

    const isPublicPage = publicPages.includes(pathname);
    
    if (!user && !isPublicPage) {
      router.push('/login');
    } else if (user && pathname === '/login') { // Only redirect from /login page
      router.push('/');
    }
  }, [user, loading, pathname, router]);


  if (loading) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
     );
  }

  const isPublicPage = publicPages.includes(pathname);
  // Prevent flash of content during redirects.
  if ((!user && !isPublicPage && auth) || (user && pathname === '/login')) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
     );
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

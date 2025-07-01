'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { checkIsAdminAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

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
        const isAdmin = await checkIsAdminAction(user.uid);
        if (isAdmin) {
          setUser(user);
        } else {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access the admin panel.',
            variant: 'destructive',
          });
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  useEffect(() => {
    if (loading || !auth) return;

    const isAuthPage = pathname === '/login';
    
    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
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

  const isAuthPage = pathname === '/login';
  // Prevent flash of login page for authenticated users or content for unauthenticated users
  // This helps avoid showing the wrong layout while the redirect is in progress.
  if ((!user && !isAuthPage && auth) || (user && isAuthPage)) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
     );
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

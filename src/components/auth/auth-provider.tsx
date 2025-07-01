'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// All pages are public. This provider just ensures that `useAuth` doesn't break
// and always provides a null user.
export function AuthProvider({ children }: AuthProviderProps) {
  return <AuthContext.Provider value={{ user: null }}>{children}</AuthContext.Provider>;
}

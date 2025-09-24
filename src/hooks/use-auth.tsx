
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const protectedRoutes = ["/"];
const publicRoutes = ["/login", "/signup", "/welcome"];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      const isProtectedRoute = protectedRoutes.includes(pathname);
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!user && isProtectedRoute) {
        router.push("/welcome");
      }
      if (user && (isPublicRoute && pathname !== '/')) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);
  
  useEffect(() => {
    if(!loading && !user && !publicRoutes.includes(pathname)) {
        router.push('/welcome');
    }
  }, [loading, user, pathname, router]);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

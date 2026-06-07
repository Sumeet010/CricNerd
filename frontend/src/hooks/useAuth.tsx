import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { authService } from "@/services";
import type { User, LoginRequest, RegisterRequest } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, clearUser, setLoading } from "@/store/authSlice";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const checkAuth = async () => {
    try {
      dispatch(setLoading(true));
      const res = await authService.getMe();
      if (res && res.user) {
        dispatch(setUser(res.user));
      } else {
        dispatch(clearUser());
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.debug("Session check failed (not authenticated or expired).");
      dispatch(clearUser());
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    dispatch(setLoading(true));
    try {
      const res = await authService.login(data);
      if (res && res.user) {
        dispatch(setUser(res.user as User));
        if (res.token) {
          localStorage.setItem("token", res.token);
        }
      } else {
        dispatch(clearUser());
      }
    } catch (err) {
      dispatch(clearUser());
      throw err;
    }
  };

  const register = async (data: RegisterRequest) => {
    dispatch(setLoading(true));
    try {
      const res = await authService.register(data);
      if (res && res.user) {
        dispatch(setUser(res.user as User));
        if (res.token) {
          localStorage.setItem("token", res.token);
        }
      } else {
        dispatch(clearUser());
      }
    } catch (err) {
      dispatch(clearUser());
      throw err;
    }
  };

  const logout = async () => {
    dispatch(setLoading(true));
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed on server:", err);
    } finally {
      localStorage.removeItem("token");
      dispatch(clearUser());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

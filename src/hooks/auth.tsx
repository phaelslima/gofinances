import React, { createContext, ReactNode, useContext } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface IAuthContextData {
  user: User
}

const AuthContext = createContext({} as IAuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{} as any}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
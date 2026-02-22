import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext<{
  user: { uid: string; name: string } | null;
  setUser: (user: { uid: string; name: string } | null) => void;
} | undefined>(undefined);

// EXPORTACIÓN POR DEFECTO
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; name: string } | null>(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
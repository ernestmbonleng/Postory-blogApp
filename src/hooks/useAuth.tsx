import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getToken, setToken as setCookieToken, clearToken } from '../services/auth-storage';
import AuthRequiredModal from '../component/modals/AuthRequiredModal';
import { jwtDecode } from 'jwt-decode';


export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  token: string | null;
  userName: string | null;
  userId: string | null;       
  email: string | null;         
  role: string | null;         
  hasBlog: boolean;           
  tenantId: string | null;  
  user: AuthUser | null;  
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [hasBlog, setHasBlog] = useState<boolean>(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);


  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem('userData');
    localStorage.removeItem('userName'); 
    localStorage.removeItem('user');      
    setToken(null);
    setUserName(null);
    setUserId(null);
    setEmail(null);
    setRole(null);
    setHasBlog(false);
    setTenantId(null);
  }, []);


  const decodeAndSetUser = useCallback((token: string) => {
    try {
      const decoded: any = jwtDecode(token);
      

      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        console.warn('Token expired. Logging out.');
        logout();
        return;
      }

      setUserName(decoded.username || decoded.userId || null);
      setUserId(decoded.userId || decoded.sub || null);
      setEmail(decoded.email || null);
      setRole(decoded.role || null);
      setHasBlog(decoded.hasBlog || false);
      setTenantId(decoded.tenantId || null);

      localStorage.setItem('userData', JSON.stringify({
        userName: decoded.username,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        hasBlog: decoded.hasBlog,
        tenantId: decoded.tenantId
      }));
    } catch (error) {
      console.error('Failed to decode token:', error);
      logout();
    }
  }, [logout]);


  useEffect(() => {
    const storedToken = getToken();
    
    if (storedToken) {
      setToken(storedToken);
      decodeAndSetUser(storedToken);
    } else {

      logout();
    }
    
    setLoading(false);
  }, [decodeAndSetUser, logout]);


  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = (newToken: string) => {
    setCookieToken(newToken);
    setToken(newToken);
    decodeAndSetUser(newToken);
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      token,
      userName,
      user: {
        id: userId || '',
        name: userName || '',
        email: email || ''
      },
      userId,         
      email,          
      role,          
      hasBlog,       
      tenantId,    
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      login,
      logout
    }}>
      {!loading && children}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
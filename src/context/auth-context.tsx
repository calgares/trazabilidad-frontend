import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface Profile {
    id: string;
    nombre: string;
    apellido: string;
    email?: string;
    rol?: string;
    role?: string;
    rol_nombre?: string;
    roles?: {
        id: string;
        nombre: string;
    };
    created_at?: string;
}

// Tipos simplificados para reemplazar Supabase
interface User {
    id: string;
    email?: string;
}

interface Session {
    access_token: string;
    user: User;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    getAuthHeaders: () => HeadersInit;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    signIn: async () => ({ error: 'Not implemented' }),
    signOut: async () => { },
    getAuthHeaders: () => ({}),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Verificar token con la API
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    const sessionData: Session = {
                        access_token: token,
                        user: { id: userData.id, email: userData.email }
                    };
                    setSession(sessionData);
                    setUser(sessionData.user);
                    setProfile(userData);
                } else {
                    // Token inválido, limpiar
                    localStorage.removeItem('auth_token');
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                localStorage.removeItem('auth_token');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                return { error: data.error || 'Error de autenticación' };
            }

            // Guardar token y datos
            localStorage.setItem('auth_token', data.token);

            const sessionData: Session = {
                access_token: data.token,
                user: { id: data.user.id, email: data.user.email }
            };

            setSession(sessionData);
            setUser(sessionData.user);
            setProfile(data.user);

            return {};
        } catch (error) {
            console.error("SignIn error:", error);
            return { error: 'Error de conexión' };
        }
    };

    const signOut = async () => {
        try {
            localStorage.removeItem('auth_token');
            setUser(null);
            setSession(null);
            setProfile(null);
        } catch (error) {
            console.error("SignOut error:", error);
        }
    };

    const getAuthHeaders = (): HeadersInit => {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                profile,
                loading,
                signIn,
                signOut,
                getAuthHeaders,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);


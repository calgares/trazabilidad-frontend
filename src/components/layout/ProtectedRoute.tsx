import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, profile, loading } = useAuth();
    const location = useLocation();



    // SI PASAN MÁS DE 2 SEGUNDOS Y SIGUE CARGANDO, NO BLOQUEAR
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span>Cargando aplicación...</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si hay roles restringidos pero no hay perfil, permitir igual
    if (allowedRoles && profile) {
        const userRole = profile.rol || profile.role || profile.roles?.nombre;

        if (userRole && !allowedRoles.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

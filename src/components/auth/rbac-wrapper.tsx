import { useAuth } from "@/context/auth-context";
import type { ReactNode } from "react";

interface RBACWrapperProps {
    children: ReactNode;
    allowedRoles: string[];
    fallback?: ReactNode; // Optional content to show if access is denied (e.g., "Not Authorized" or nothing)
}

export function RBACWrapper({ children, allowedRoles, fallback = null }: RBACWrapperProps) {
    const { profile, loading } = useAuth();

    if (loading) return null; // Or a skeleton

    // If no profile (not logged in or fetch failed), deny.
    // Assuming 'Administrator' is the exact string in DB. Adjust if it is 'admin'.
    // Typically: 'Administrador', 'Operador', etc.
    const userRole = profile?.rol;
    if (!profile || !userRole || !allowedRoles.includes(userRole)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

export function usePermission(allowedRoles: string[]) {
    const { profile } = useAuth();
    if (!profile || !profile.rol) return false;
    return allowedRoles.includes(profile.rol);
}

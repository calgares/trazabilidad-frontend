import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface SystemHealth {
    dashboard_view_ok: boolean;
    reportes_view_ok: boolean;
    fallas_view_ok: boolean;
    preventivos_view_ok: boolean;
    rls_equipos_enabled: boolean;
    rls_fallas_enabled: boolean;
    rls_mantenimientos_enabled: boolean;
    overall_status: boolean;
}

export function useSystemHealth() {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHealth = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/system/health`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar diagnóstico');
            }

            const data = await response.json();
            setHealth(data);
        } catch (err: any) {
            console.error('Error fetching system health:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
    }, [fetchHealth]);

    return { health, loading, error, refresh: fetchHealth };
}

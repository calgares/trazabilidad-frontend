import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';

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
            const { data, error } = await supabase
                .from('view_system_health')
                .select('*')
                .single();

            if (error) throw error;
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

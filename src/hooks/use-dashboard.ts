import { useState, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface DashboardKPIs {
    total_equipos: number;
    equipos_disponibles: number;
    equipos_en_operacion: number;
    equipos_en_mantenimiento: number;
    fallas_abiertas: number;
    fallas_criticas: number;
}

interface Equipo {
    estado_operativo: string;
    estado: string;
}

export function useDashboard() {
    const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchKpis = useCallback(async () => {
        try {
            setLoading(true);

            // Obtener equipos y calcular KPIs en cliente
            const response = await fetch(`${API_URL}/api/equipos`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error cargando equipos');

            const equipos: Equipo[] = await response.json();

            // Calcular KPIs desde los equipos
            const calculatedKpis: DashboardKPIs = {
                total_equipos: equipos.length,
                equipos_disponibles: equipos.filter(e => e.estado_operativo === 'DISPONIBLE').length,
                equipos_en_operacion: equipos.filter(e => e.estado_operativo === 'EN_OPERACION').length,
                equipos_en_mantenimiento: equipos.filter(e => e.estado_operativo === 'EN_MANTENIMIENTO' || e.estado === 'En Mantenimiento').length,
                fallas_abiertas: equipos.filter(e => e.estado === 'Falla Reportada').length,
                fallas_criticas: 0, // Por ahora sin datos de fallas críticas
            };

            setKpis(calculatedKpis);
        } catch (err: unknown) {
            console.error("Error al cargar KPIs:", err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKpis();
    }, [fetchKpis]);

    return { kpis, loading, error, refresh: fetchKpis };
}

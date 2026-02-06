import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

interface RecentActivity {
    id: string
    tipo_evento: string
    descripcion?: string | null
    fecha: string
    equipos?: {
        nombre: string
    } | null
}

interface Equipo {
    id: string
    nombre: string
    estado: string
    estado_operativo: string
    created_at: string
}

interface DashboardStats {
    totalEquipos: number
    enMantenimiento: number
    fallas24h: number
    disponibilidad: number
    recentActivity: RecentActivity[]
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>({
        totalEquipos: 0,
        enMantenimiento: 0,
        fallas24h: 0,
        disponibilidad: 98.2,
        recentActivity: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)

                // Fetch equipos desde la API
                const response = await fetch(`${API_URL}/api/equipos`, {
                    headers: getAuthHeaders()
                });
                if (!response.ok) throw new Error('Error cargando equipos');

                const equipos: Equipo[] = await response.json();

                // Calcular stats desde equipos
                const total = equipos.length;
                const maintenance = equipos.filter(e =>
                    e.estado === 'En Mantenimiento' ||
                    e.estado_operativo === 'EN_MANTENIMIENTO'
                ).length;
                const fallas = equipos.filter(e => e.estado === 'Falla Reportada').length;

                // Simular actividad reciente desde equipos
                const recentActivity: RecentActivity[] = equipos.slice(0, 5).map(e => ({
                    id: e.id,
                    tipo_evento: 'REGISTRO',
                    descripcion: `Equipo ${e.nombre}`,
                    fecha: e.created_at,
                    equipos: { nombre: e.nombre }
                }));

                // Calcular disponibilidad
                const disponibles = equipos.filter(e =>
                    e.estado_operativo === 'DISPONIBLE' ||
                    e.estado_operativo === 'EN_OPERACION'
                ).length;
                const disponibilidad = total > 0 ? (disponibles / total) * 100 : 100;

                setStats({
                    totalEquipos: total,
                    enMantenimiento: maintenance,
                    fallas24h: fallas,
                    disponibilidad: Math.round(disponibilidad * 10) / 10,
                    recentActivity
                })

            } catch (err) {
                console.error("Error fetching dashboard stats:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return { stats, loading }
}

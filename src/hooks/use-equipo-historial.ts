import { useEffect, useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface HistorialEstado {
    id: string;
    equipo_id: string;
    estado_anterior: string | null;
    estado_nuevo: string;
    motivo: string | null;
    fecha_cambio: string;
    usuario_id: string | null;
    created_at: string;
    perfiles?: {
        nombre: string;
        apellido: string;
        email: string;
    };
}

export function useEquipoHistorial(equipoId: string) {
    const [historial, setHistorial] = useState<HistorialEstado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistorial = useCallback(async () => {
        if (!equipoId) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/equipos/${equipoId}/historial`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar historial');
            }

            const data = await response.json();
            setHistorial(data as HistorialEstado[] || []);
        } catch (err: any) {
            console.error("Error al cargar historial:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [equipoId]);

    useEffect(() => {
        fetchHistorial();
    }, [fetchHistorial]);

    return { historial, loading, error, refresh: fetchHistorial };
}

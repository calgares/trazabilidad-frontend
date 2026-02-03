import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api-client';

export interface HistorialEstado {
    id: string;
    equipo_id: string;
    estado_anterior: string | null;
    estado_nuevo: string;
    motivo: string | null;
    fecha_cambio: string;
    usuario_id: string | null;
    created_at: string;
    usuario_nombre?: string;
    usuario_apellido?: string;
    usuario_email?: string;
    latitud?: number;
    longitud?: number;
}

export function useEquipoHistorial(equipoId: string) {
    const [historial, setHistorial] = useState<HistorialEstado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistorial = useCallback(async () => {
        if (!equipoId) return;

        try {
            setLoading(true);
            const { data, error } = await api.get<HistorialEstado[]>(`/api/equipos/${equipoId}/historial`);

            if (error) throw new Error(error as string);

            setHistorial(data || []);
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

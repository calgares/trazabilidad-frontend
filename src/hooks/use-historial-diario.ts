import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api-client';

export interface HistoryEvent {
    id: string;
    tipo: 'mantenimiento' | 'falla' | 'movimiento';
    descripcion: string;
    fecha: string;
    equipo_nombre: string;
    equipo_codigo: string;
    latitud?: number;
    longitud?: number;
    usuario_nombre?: string;
}

export function useHistorialDiario() {
    const [history, setHistory] = useState<HistoryEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await api.get<HistoryEvent[]>('/api/historial-diario');

            if (error) throw new Error(error as string);

            setHistory(data || []);
        } catch (err: any) {
            console.error("Error fetching daily history:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, error, refresh: fetchHistory };
}

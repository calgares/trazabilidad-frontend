import { useEffect, useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface DailyHistoryRecord {
    id: string;
    fecha: string;
    total_mantenimientos: number;
    total_fallas: number;
    resumen_actividad: string | null;
}

export function useHistorialDiario() {
    const [history, setHistory] = useState<DailyHistoryRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/historial-diario`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar historial');
            }

            const data = await response.json();
            setHistory(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    return { history, loading, error, refresh: fetchHistory }
}

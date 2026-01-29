import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/services/supabase'

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
            const { data, error } = await supabase
                .from('historial_diario_actividades')
                .select('*')
                .order('fecha', { ascending: false })
                .limit(30) // Last 30 days by default

            if (error) throw error
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

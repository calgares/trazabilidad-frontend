import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';

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
            const { data, error } = await supabase
                .from('equipo_historial_estados')
                .select(`
                    *,
                    perfiles (
                        nombre,
                        apellido,
                        email
                    )
                `)
                .eq('equipo_id', equipoId)
                .order('fecha_cambio', { ascending: false });

            if (error) throw error;

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

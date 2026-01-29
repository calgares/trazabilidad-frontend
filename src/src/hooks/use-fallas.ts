import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/services/supabase';

export interface Falla {
    id: string;
    equipo_id: string;
    tipo_falla: string;
    descripcion: string | null;
    fecha_reporte: string;
    usuario_reporta: string | null;
    severidad: 'BAJA' | 'MEDIA' | 'ALTA';
    gravedad?: string;
    estado_falla: 'ABIERTA' | 'EN_REVISION' | 'RESUELTA';
    causa_raiz?: string | null;
    created_at?: string;
    // Relations
    perfiles?: {
        nombre: string;
        apellido: string;
        email: string;
    };
    mantenimiento?: {
        usuario?: {
            nombre: string;
            apellido: string;
        }
    };
    equipos?: {
        nombre: string;
        codigo_unico: string;
    };
}

export function useFallas(equipoId?: string) {
    const [fallas, setFallas] = useState<Falla[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFallas = useCallback(async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('equipo_fallas')
                .select(`
                    *,
                    perfiles (
                        nombre,
                        apellido,
                        email
                    ),
                    mantenimiento:mantenimientos (
                        usuario:perfiles (
                            nombre,
                            apellido
                        )
                    ),
                    equipos (
                        nombre,
                        codigo_unico
                    )
                `)
                .order('created_at', { ascending: false });

            if (equipoId) {
                query = query.eq('equipo_id', equipoId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setFallas(data as Falla[] || []);
        } catch (err: any) {
            console.error("Error al cargar fallas:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [equipoId]);

    const reportarFalla = async (datos: {
        tipo_falla: string,
        descripcion: string,
        severidad: string,
        usuario_id: string
    }) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('equipo_fallas')
                .insert({
                    equipo_id: equipoId,
                    tipo_falla: datos.tipo_falla,
                    descripcion: datos.descripcion,
                    severidad: datos.severidad,
                    usuario_reporta: datos.usuario_id,
                    estado_falla: 'ABIERTA'
                });

            if (error) throw error;

            // Trigger automatically handles equipment status update if ALTA

            await fetchFallas();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const actualizarEstadoFalla = async (fallaId: string, nuevoEstado: string) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('equipo_fallas')
                .update({ estado_falla: nuevoEstado })
                .eq('id', fallaId);

            if (error) throw error;
            await fetchFallas();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFallas();
    }, [fetchFallas]);

    return {
        fallas,
        loading,
        error,
        refresh: fetchFallas,
        reportarFalla,
        actualizarEstadoFalla
    };
}

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/services/supabase';

export interface Asignacion {
    id: string;
    equipo_id: string;
    proyecto: string | null;
    responsable_id: string | null;
    fecha_asignacion: string;
    fecha_devolucion: string | null;
    condicion_entrega: string | null;
    condicion_recepcion: string | null;
    estado_al_asignar: string | null;
    created_at: string;
    // Relations
    perfiles?: {
        nombre: string;
        apellido: string;
        email: string;
    };
}

export function useAsignaciones(equipoId: string) {
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [asignacionActiva, setAsignacionActiva] = useState<Asignacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAsignaciones = useCallback(async () => {
        if (!equipoId) return;

        try {
            setLoading(true);
            // Fetch all assignments
            const { data, error } = await supabase
                .from('equipo_asignaciones')
                .select(`
                    *,
                    perfiles (
                        nombre,
                        apellido,
                        email
                    )
                `)
                .eq('equipo_id', equipoId)
                .order('fecha_asignacion', { ascending: false });

            if (error) throw error;

            const list = data as Asignacion[] || [];
            setAsignaciones(list);

            // Determine active assignment (where fecha_devolucion is null)
            const active = list.find(a => !a.fecha_devolucion);
            setAsignacionActiva(active || null);

        } catch (err: any) {
            console.error("Error al cargar asignaciones:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [equipoId]);

    const asignarEquipo = async (datos: { responsable_id: string, proyecto?: string, condicion_entrega?: string }) => {
        try {
            setLoading(true);

            // 1. Create assignment record
            const { error: insertError } = await supabase
                .from('equipo_asignaciones')
                .insert({
                    equipo_id: equipoId,
                    responsable_id: datos.responsable_id,
                    proyecto: datos.proyecto,
                    condicion_entrega: datos.condicion_entrega,
                    estado_al_asignar: 'DISPONIBLE' // Assumption, or passed as arg
                });

            if (insertError) throw insertError;

            // 2. Update equipment status to 'EN_OPERACION'
            // NOTE: The user requested triggers/functions might handle this, but explicit update is safer unless confirmed.
            // The prompt said "DB: SQL Functions/Triggers for state management" was done, but I didn't verify the trigger code.
            // I will err on side of updating it explicitly from frontend for immediate feedback, 
            // OR if the trigger `tr_historial_estados_equipos` is strictly for history logging, 
            // we typically still update the `equipos` table manually or via RPC.
            // Since the user said "Reglas de negocio: Al asignar... debe cambiar estado", 
            // I'll update the equipment status directly here.

            const { error: updateError } = await supabase
                .from('equipos')
                .update({
                    estado_operativo: 'EN_OPERACION',
                    motivo_estado: `Asignado a proyecto: ${datos.proyecto || 'Sin proyecto'}`
                })
                .eq('id', equipoId);

            if (updateError) throw updateError;

            await fetchAsignaciones();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const devolverEquipo = async (datos: { condicion_recepcion: string, nuevo_estado: string, motivo_cambio?: string }) => {
        if (!asignacionActiva) return { success: false, error: "No hay asignación activa" };

        try {
            setLoading(true);

            // 1. Update assignment record (close it)
            const { error: updateAsigError } = await supabase
                .from('equipo_asignaciones')
                .update({
                    fecha_devolucion: new Date().toISOString(),
                    condicion_recepcion: datos.condicion_recepcion
                })
                .eq('id', asignacionActiva.id);

            if (updateAsigError) throw updateAsigError;

            // 2. Update equipment status
            const { error: updateEquipoError } = await supabase
                .from('equipos')
                .update({
                    estado_operativo: datos.nuevo_estado,
                    motivo_estado: datos.motivo_cambio || 'Devolución de equipo'
                })
                .eq('id', equipoId);

            if (updateEquipoError) throw updateEquipoError;

            await fetchAsignaciones();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAsignaciones();
    }, [fetchAsignaciones]);

    return {
        asignaciones,
        asignacionActiva,
        loading,
        error,
        refresh: fetchAsignaciones,
        asignarEquipo,
        devolverEquipo
    };
}

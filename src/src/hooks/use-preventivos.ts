import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { addDays, differenceInDays, format } from 'date-fns';

export interface ProgramaMantenimiento {
    id: string;
    equipo_id: string;
    titulo: string;
    frecuencia_tipo: 'HORAS' | 'KILOMETROS' | 'FECHA';
    frecuencia_valor: number;
    valor_ultima_realizacion: number; // Stored as bigint in DB, treating as number for JS (careful with huge logs)
    fecha_ultima_realizacion?: string | null; // Optional, useful for DATE types
    alerta_anticipacion: number;
    estado: 'ACTIVO' | 'INACTIVO';
    created_at: string;
}

export interface ProgramaEstado extends ProgramaMantenimiento {
    proximo_valor_estimado: number | string; // Value or Date string
    restante: number; // Units remaining
    unidad: string; // 'Hrs', 'Km', 'Días'
    estado_alerta: 'OK' | 'WARNING' | 'DANGER' | 'INACTIVE';
    porcentaje_uso: number;
}

export function usePreventivos(equipoId: string, lecturaActual: number = 0) {
    const [programas, setProgramas] = useState<ProgramaEstado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const calcularEstado = useCallback((prog: ProgramaMantenimiento, currentCounter: number): ProgramaEstado => {
        let proximo: number | string = 0;
        let restante = 0;
        let unidad = '';
        let estado_alerta: 'OK' | 'WARNING' | 'DANGER' | 'INACTIVE' = 'OK';
        let porcentaje = 0;

        if (prog.estado === 'INACTIVO') {
            return { ...prog, proximo_valor_estimado: '-', restante: 0, unidad: '-', estado_alerta: 'INACTIVE', porcentaje_uso: 0 };
        }

        if (prog.frecuencia_tipo === 'FECHA') {
            unidad = 'Días';
            // Logic: Fecha Ultima (or CreatedAt?) + Frecuencia Days
            // If fecha_ultima_realizacion is null, use created_at or assume overdue/now?
            // Let's assume we store the "Start Date" in valor_ultima_realizacion as epoch or just use a dedicated date col if added.
            // generated schema had `fecha_ultima_realizacion`.
            // If not present, fallback to created_at

            const baseDate = prog.fecha_ultima_realizacion ? new Date(prog.fecha_ultima_realizacion) : new Date(prog.created_at);
            const nextDate = addDays(baseDate, prog.frecuencia_valor);
            proximo = format(nextDate, 'dd/MM/yyyy');

            const diff = differenceInDays(nextDate, new Date());
            restante = diff;

            // Calc percentage (inverse: how much time passed vs total interval)
            const totalDays = prog.frecuencia_valor;
            const daysPassed = totalDays - restante;
            porcentaje = (daysPassed / totalDays) * 100;

        } else {
            // HORAS or KILOMETROS
            unidad = prog.frecuencia_tipo === 'HORAS' ? 'Hrs' : 'Km';
            const baseValue = prog.valor_ultima_realizacion || 0;
            const nextValue = baseValue + prog.frecuencia_valor;
            proximo = nextValue;

            restante = nextValue - currentCounter;

            const used = currentCounter - baseValue;
            porcentaje = (used / prog.frecuencia_valor) * 100;
        }

        // Determine Alert Status
        // Warning if remaining < alerta_anticipacion
        // Danger if remaining <= 0

        if (restante <= 0) {
            estado_alerta = 'DANGER';
        } else if (restante <= (prog.alerta_anticipacion || 0)) {
            estado_alerta = 'WARNING';
        } else {
            estado_alerta = 'OK';
        }

        return {
            ...prog,
            proximo_valor_estimado: proximo,
            restante,
            unidad,
            estado_alerta,
            porcentaje_uso: Math.min(Math.max(porcentaje, 0), 100) // Clamp 0-100
        };

    }, []);

    const fetchProgramas = useCallback(async () => {
        if (!equipoId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('mantenimiento_programas')
                .select('*')
                .eq('equipo_id', equipoId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const rawProgs = data as ProgramaMantenimiento[] || [];

            // Process calculate status
            const processed = rawProgs.map(p => calcularEstado(p, lecturaActual));

            setProgramas(processed);
        } catch (err: any) {
            console.error("Error al cargar programas:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [equipoId, lecturaActual, calcularEstado]);

    const guardarPrograma = async (datos: Partial<ProgramaMantenimiento>) => {
        try {
            setLoading(true);
            // If ID exists, update. Else insert.
            if (datos.id) {
                const { error } = await supabase
                    .from('mantenimiento_programas')
                    .update(datos)
                    .eq('id', datos.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('mantenimiento_programas')
                    .insert({ ...datos, equipo_id: equipoId }); // Ensure equipo_id is set
                if (error) throw error;
            }
            await fetchProgramas();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // NEW: Function to reset a program (mark as done)
    // This updates the 'valor_ultima_realizacion' to current counter/date
    const registrarMantenimientoRealizado = async (programaId: string, counter: number, date: Date) => {
        try {
            setLoading(true);

            // Find the program to know type
            const prog = programas.find(p => p.id === programaId);
            if (!prog) throw new Error("Programa no encontrado");

            const updates: any = {};
            if (prog.frecuencia_tipo === 'FECHA') {
                updates.fecha_ultima_realizacion = date.toISOString();
            } else {
                updates.valor_ultima_realizacion = counter;
            }

            const { error } = await supabase
                .from('mantenimiento_programas')
                .update(updates)
                .eq('id', programaId);

            if (error) throw error;
            await fetchProgramas();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const eliminarPrograma = async (id: string) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('mantenimiento_programas')
                .delete()
                .eq('id', id);
            if (error) throw error;
            await fetchProgramas();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgramas();
    }, [fetchProgramas]);

    return {
        programas,
        loading,
        error,
        refresh: fetchProgramas,
        guardarPrograma,
        eliminarPrograma,
        registrarMantenimientoRealizado
    };
}

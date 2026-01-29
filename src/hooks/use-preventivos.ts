import { useState, useCallback, useEffect } from 'react';
import { addDays, differenceInDays, format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface ProgramaMantenimiento {
    id: string;
    equipo_id: string;
    titulo: string;
    frecuencia_tipo: 'HORAS' | 'KILOMETROS' | 'FECHA';
    frecuencia_valor: number;
    valor_ultima_realizacion: number;
    fecha_ultima_realizacion?: string | null;
    alerta_anticipacion: number;
    estado: 'ACTIVO' | 'INACTIVO';
    created_at: string;
}

export interface ProgramaEstado extends ProgramaMantenimiento {
    proximo_valor_estimado: number | string;
    restante: number;
    unidad: string;
    estado_alerta: 'OK' | 'WARNING' | 'DANGER' | 'INACTIVE';
    porcentaje_uso: number;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

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
            const baseDate = prog.fecha_ultima_realizacion ? new Date(prog.fecha_ultima_realizacion) : new Date(prog.created_at);
            const nextDate = addDays(baseDate, prog.frecuencia_valor);
            proximo = format(nextDate, 'dd/MM/yyyy');
            const diff = differenceInDays(nextDate, new Date());
            restante = diff;
            const totalDays = prog.frecuencia_valor;
            const daysPassed = totalDays - restante;
            porcentaje = (daysPassed / totalDays) * 100;
        } else {
            unidad = prog.frecuencia_tipo === 'HORAS' ? 'Hrs' : 'Km';
            const baseValue = prog.valor_ultima_realizacion || 0;
            const nextValue = baseValue + prog.frecuencia_valor;
            proximo = nextValue;
            restante = nextValue - currentCounter;
            const used = currentCounter - baseValue;
            porcentaje = (used / prog.frecuencia_valor) * 100;
        }

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
            porcentaje_uso: Math.min(Math.max(porcentaje, 0), 100)
        };
    }, []);

    const fetchProgramas = useCallback(async () => {
        if (!equipoId) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/preventivos?equipo_id=${equipoId}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al cargar programas');
            }

            const data = await response.json();
            const rawProgs = data as ProgramaMantenimiento[] || [];
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
            const method = datos.id ? 'PUT' : 'POST';
            const url = datos.id
                ? `${API_URL}/api/preventivos/${datos.id}`
                : `${API_URL}/api/preventivos`;

            const response = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...datos, equipo_id: equipoId })
            });

            if (!response.ok) {
                throw new Error('Error al guardar programa');
            }

            await fetchProgramas();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const registrarMantenimientoRealizado = async (programaId: string, counter: number, date: Date) => {
        try {
            setLoading(true);
            const prog = programas.find(p => p.id === programaId);
            if (!prog) throw new Error("Programa no encontrado");

            const updates: any = {};
            if (prog.frecuencia_tipo === 'FECHA') {
                updates.fecha_ultima_realizacion = date.toISOString();
            } else {
                updates.valor_ultima_realizacion = counter;
            }

            const response = await fetch(`${API_URL}/api/preventivos/${programaId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Error al registrar mantenimiento');
            }

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
            const response = await fetch(`${API_URL}/api/preventivos/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al eliminar programa');
            }

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

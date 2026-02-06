import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface WorkOrder {
    id: string;
    numero_ot: string;
    equipo_id: string;
    equipos?: { nombre: string };
    equipo_nombre?: string;
    origen: 'FALLA' | 'PREVENTIVO' | 'MANUAL';
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    descripcion_problema: string;
    estado: 'CREADA' | 'ASIGNADA' | 'EN_PROCESO' | 'PAUSADA' | 'TERMINADA' | 'CANCELADA';
    tecnico_interno_id?: string;
    perfiles?: { nombre: string };
    tecnico_nombre?: string;
    tecnico_externo?: string;
    fecha_programada?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    tiempo_ejecucion_minutos?: number;
    observaciones_cierre?: string;
    firma_tecnico?: string;
    created_at: string;
}

export interface WorkOrderTask {
    id: string;
    work_order_id: string;
    descripcion: string;
    completado: boolean;
    observaciones?: string;
    orden: number;
}

export interface WorkOrderEvidence {
    id: string;
    work_order_id: string;
    tipo: 'FOTO' | 'DOCUMENTO' | 'COMENTARIO';
    url_archivo?: string;
    comentario?: string;
    created_at: string;
}

export interface WorkOrderSpare {
    id: string;
    work_order_id: string;
    descripcion_repuesto: string;
    cantidad: number;
    unidad: string;
}

export function useWorkOrders() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const getWorkOrders = useCallback(async (_filters?: { estado?: string; prioridad?: string; tecnico_id?: string }) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/work-orders`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error cargando órdenes de trabajo');

            const data = await response.json();

            // Mapear para compatibilidad
            const mappedData = data.map((wo: WorkOrder) => ({
                ...wo,
                equipos: wo.equipo_nombre ? { nombre: wo.equipo_nombre } : undefined,
                perfiles: wo.tecnico_nombre ? { nombre: wo.tecnico_nombre } : undefined
            }));

            return mappedData as WorkOrder[];
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getWorkOrderById = useCallback(async (id: string, includeDetails = false) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/work-orders/${id}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error cargando orden de trabajo');

            const ot = await response.json();

            // Mapear para compatibilidad
            const mappedOt = {
                ...ot,
                equipos: ot.equipo_nombre ? { nombre: ot.equipo_nombre } : undefined,
                perfiles: ot.tecnico_nombre ? { nombre: ot.tecnico_nombre } : undefined
            };

            const details: { ot: WorkOrder; tasks?: WorkOrderTask[]; evidences?: WorkOrderEvidence[]; spares?: WorkOrderSpare[] } = {
                ot: mappedOt
            };

            if (includeDetails) {
                // La API devuelve estos datos en la misma respuesta para /work-orders/:id
                details.tasks = ot.tasks || [];
                details.evidences = ot.evidences || [];
                details.spares = ot.spares || [];
            }

            return details;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createWorkOrder = async (data: Partial<WorkOrder>) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/work-orders`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Error creando orden');
            }

            return await response.json();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/work-orders/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Error actualizando orden');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    // --- Detail Helpers (temporalmente simplificados) ---

    const addTask = async (_taskId: string | null, _data: Partial<WorkOrderTask>) => {
        console.warn('addTask: No implementado en API aún');
    };

    const toggleTask = async (_taskId: string, _currentStatus: boolean) => {
        console.warn('toggleTask: No implementado en API aún');
    };

    const addEvidence = async (_data: Partial<WorkOrderEvidence>) => {
        console.warn('addEvidence: No implementado en API aún');
    };

    const addSpare = async (_data: Partial<WorkOrderSpare>) => {
        console.warn('addSpare: No implementado en API aún');
    };

    const getWorkOrdersByEquipo = useCallback(async (equipoId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/work-orders`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error cargando órdenes');

            const data = await response.json();
            // Filtrar por equipo en cliente
            const filtered = data.filter((wo: WorkOrder) => wo.equipo_id === equipoId);

            return filtered as WorkOrder[];
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createWorkOrderFromFalla = async (falla: { id: string; equipo_id: string; descripcion: string | null }) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/work-orders`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    equipo_id: falla.equipo_id,
                    origen: 'FALLA',
                    origen_id: falla.id,
                    prioridad: 'ALTA',
                    descripcion_problema: `[Desde Falla] ${falla.descripcion}`,
                    estado: 'CREADA'
                })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Error creando orden desde falla');
            }

            return await response.json();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const finalizeWorkOrder = async (id: string, closureData: { firma_tecnico: string; firma_supervisor?: string; observaciones_cierre: string }) => {
        setLoading(true);
        try {
            // Validar firma
            if (!closureData.firma_tecnico) {
                throw new Error("Se requiere la firma del técnico.");
            }

            const now = new Date().toISOString();

            const response = await fetch(`${API_URL}/api/work-orders/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    estado: 'TERMINADA',
                    ...closureData,
                    fecha_fin: now
                })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Error finalizando orden');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        getWorkOrders,
        getWorkOrderById,
        getWorkOrdersByEquipo,
        createWorkOrder,
        createWorkOrderFromFalla,
        updateWorkOrder,
        finalizeWorkOrder,
        addTask,
        toggleTask,
        addEvidence,
        addSpare
    };
}


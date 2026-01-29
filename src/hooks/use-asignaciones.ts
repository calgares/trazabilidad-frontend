import { useState, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

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
    perfiles?: {
        nombre: string;
        apellido: string;
        email: string;
    };
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export function useAsignaciones(equipoId: string) {
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [asignacionActiva, setAsignacionActiva] = useState<Asignacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAsignaciones = useCallback(async () => {
        if (!equipoId) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/asignaciones?equipo_id=${equipoId}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al cargar asignaciones');
            }

            const data = await response.json();
            const list = data as Asignacion[] || [];
            setAsignaciones(list);
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

            const response = await fetch(`${API_URL}/api/asignaciones`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    equipo_id: equipoId,
                    responsable_id: datos.responsable_id,
                    proyecto: datos.proyecto,
                    condicion_entrega: datos.condicion_entrega,
                    estado_al_asignar: 'DISPONIBLE'
                })
            });

            if (!response.ok) {
                throw new Error('Error al asignar equipo');
            }

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

            const response = await fetch(`${API_URL}/api/asignaciones/${asignacionActiva.id}/devolver`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    condicion_recepcion: datos.condicion_recepcion,
                    nuevo_estado: datos.nuevo_estado,
                    motivo_cambio: datos.motivo_cambio,
                    equipo_id: equipoId
                })
            });

            if (!response.ok) {
                throw new Error('Error al devolver equipo');
            }

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

import { useState, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

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
    // Flat fields from backend
    usuario_nombre?: string;
    usuario_apellido?: string;
    usuario_email?: string;
    // Legacy nested object (kept for compatibility if needed)
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

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export function useFallas(equipoId?: string) {
    const [fallas, setFallas] = useState<Falla[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFallas = useCallback(async () => {
        try {
            setLoading(true);
            const url = equipoId
                ? `${API_URL}/api/fallas?equipo_id=${equipoId}`
                : `${API_URL}/api/fallas`;

            const response = await fetch(url, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al cargar fallas');
            }

            const data = await response.json();
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
            const response = await fetch(`${API_URL}/api/fallas`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    equipo_id: equipoId,
                    tipo_falla: datos.tipo_falla,
                    descripcion: datos.descripcion,
                    severidad: datos.severidad,
                    usuario_reporta: datos.usuario_id,
                    estado_falla: 'ABIERTA'
                })
            });

            if (!response.ok) {
                throw new Error('Error al reportar falla');
            }

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
            const response = await fetch(`${API_URL}/api/fallas/${fallaId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ estado_falla: nuevoEstado })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar falla');
            }

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

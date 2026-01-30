import { useEffect, useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export type EstadoOperativo = 'DISPONIBLE' | 'EN_OPERACION' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO' | 'BAJA';

export interface Equipo {
    id: string;
    nombre: string;
    codigo_unico: string;
    tipo_equipo_id: string;
    ubicacion_id: string;
    estado: string;
    estado_operativo: string; // Permitir cualquier valor de string para manejar "Operativo", "Falla Reportada", etc.
    fecha_cambio_estado?: string;
    motivo_estado?: string;
    imagen_url?: string;
    created_at: string;
    updated_at: string;
    // Campos de joins desde la API
    tipo_equipo_nombre?: string;
    ubicacion_nombre?: string;
    area_nombre?: string;
    planta_nombre?: string;
    // Compatibilidad con formato anterior
    tipos_equipo?: { nombre: string };
    ubicaciones?: { nombre: string; area_id: string };
}

export function useEquipos(page = 1, pageSize = 10) {
    const [equipos, setEquipos] = useState<Equipo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)

    const fetchEquipos = useCallback(async () => {
        try {
            setLoading(true)

            const response = await fetch(`${API_URL}/api/equipos`);
            if (!response.ok) {
                throw new Error('Error al cargar equipos');
            }

            const data = await response.json();

            // Mapear datos para compatibilidad con el formato anterior
            const mappedData = data.map((eq: Equipo) => ({
                ...eq,
                estado_operativo: eq.estado, // Mapear estado de BD a propiedad esperada por UI
                tipos_equipo: { nombre: eq.tipo_equipo_nombre || '' },
                ubicaciones: { nombre: eq.ubicacion_nombre || '', area_id: '' }
            }));

            // Paginación del lado del cliente (temporal, la API debería soportar paginación)
            const from = (page - 1) * pageSize;
            const to = from + pageSize;
            const paginatedData = mappedData.slice(from, to);

            setEquipos(paginatedData)
            setTotalCount(mappedData.length)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }, [page, pageSize]);

    useEffect(() => {
        fetchEquipos()
    }, [fetchEquipos])

    return { equipos, loading, error, refresh: fetchEquipos, totalCount }
}

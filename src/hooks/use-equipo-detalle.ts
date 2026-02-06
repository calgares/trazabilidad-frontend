import { useEffect, useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Type definitions
export interface TipoEquipo {
    id: string
    nombre: string
    descripcion?: string
    categoria_operativa?: string
}

export interface Ubicacion {
    id: string
    nombre: string
    area_id?: {
        id: string
        nombre: string
        planta_id?: {
            id: string
            nombre: string
        }
    }
}

export interface Equipo {
    id: string
    codigo_unico: string
    nombre: string
    estado: string
    estado_operativo?: string
    imagen_url?: string | null
    tipo_equipo_id?: string
    ubicacion_id?: string
    contador_actual?: number
    created_at: string
    updated_at: string
    // Campos de la API
    tipo_equipo_nombre?: string
    ubicacion_nombre?: string
    area_nombre?: string
    planta_nombre?: string
    // Campos de compatibilidad
    tipos_equipo?: TipoEquipo | null
    ubicaciones?: Ubicacion | null
}

export interface ValorBase {
    id: string
    equipo_id: string
    valor: string | null
    ficha_campos_base?: {
        id: string
        nombre_campo: string
        tipo_dato: string
    }
}

export interface ValorPersonalizado {
    id: string
    equipo_id: string
    valor: string | null
    ficha_campos_personalizados?: {
        id: string
        nombre_campo: string
        tipo_dato: string
    }
}

export interface EventoTimeline {
    id: string
    equipo_id: string
    tipo_evento: string
    descripcion?: string | null
    fecha: string
    perfiles?: {
        nombre: string
        apellido: string
    } | null
}

export function useEquipoDetalle(id: string | undefined) {
    const [equipo, setEquipo] = useState<Equipo | null>(null)
    const [valoresBase, setValoresBase] = useState<ValorBase[]>([])
    const [valoresPersonalizados, setValoresPersonalizados] = useState<ValorPersonalizado[]>([])
    const [timeline, setTimeline] = useState<EventoTimeline[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDetalle = useCallback(async () => {
        if (!id) return
        try {
            setLoading(true)

            // Fetch Equipo desde la API
            const response = await fetch(`${API_URL}/api/equipos/${id}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error cargando equipo');

            const equipoData = await response.json();

            // Mapear datos para compatibilidad
            const mappedEquipo: Equipo = {
                ...equipoData,
                tipos_equipo: equipoData.tipo_equipo_nombre ? {
                    id: equipoData.tipo_equipo_id,
                    nombre: equipoData.tipo_equipo_nombre,
                    categoria_operativa: equipoData.categoria_operativa
                } : null,
                ubicaciones: equipoData.ubicacion_nombre ? {
                    id: equipoData.ubicacion_id,
                    nombre: equipoData.ubicacion_nombre,
                    area_id: {
                        id: '',
                        nombre: equipoData.area_nombre || '',
                        planta_id: {
                            id: '',
                            nombre: equipoData.planta_nombre || ''
                        }
                    }
                } : null
            };

            setEquipo(mappedEquipo);

            // Por ahora, valores y timeline vacíos (la API no tiene estos endpoints aún)
            setValoresBase([]);
            setValoresPersonalizados([]);
            setTimeline([]);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchDetalle()
    }, [fetchDetalle])

    return { equipo, valoresBase, valoresPersonalizados, timeline, loading, error, refresh: fetchDetalle }
}

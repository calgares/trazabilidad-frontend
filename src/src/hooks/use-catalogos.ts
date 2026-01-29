import { useEffect, useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface Planta {
    id: string
    nombre: string
    ubicacion_geografica?: string
    created_at: string
}

export interface Area {
    id: string
    nombre: string
    planta_id: string
    created_at: string
}

export interface Ubicacion {
    id: string
    nombre: string
    area_id: string
    created_at: string
}

export interface TipoEquipo {
    id: string
    nombre: string
    descripcion?: string
    categoria_operativa: 'MAQUINARIA_PESADA' | 'EQUIPO_MOTORIZADO' | 'HERRAMIENTA_ELECTRICA' | 'HERRAMIENTA_MENOR'
    created_at: string
}

export function useCatalogos() {
    const [plantas, setPlantas] = useState<Planta[]>([])
    const [areas, setAreas] = useState<Area[]>([])
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
    const [tiposEquipo, setTiposEquipo] = useState<TipoEquipo[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCatalogos = useCallback(async () => {
        try {
            setLoading(true)

            const [plantasRes, areasRes, ubicacionesRes, tiposRes] = await Promise.all([
                fetch(`${API_URL}/api/ubicaciones/plantas`),
                fetch(`${API_URL}/api/ubicaciones/areas`),
                fetch(`${API_URL}/api/ubicaciones`),
                fetch(`${API_URL}/api/catalogos`)
            ]);

            const [pData, aData, uData, tData] = await Promise.all([
                plantasRes.json(),
                areasRes.json(),
                ubicacionesRes.json(),
                tiposRes.json()
            ]);

            setPlantas(pData || [])
            setAreas(aData || [])
            setUbicaciones(uData || [])
            setTiposEquipo(tData || [])

        } catch (err) {
            console.error("Error fetching catalogs:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCatalogos()
    }, [fetchCatalogos])

    // CRUD helpers (temporalmente deshabilitados - la API no soporta estos endpoints aún)
    const createItem = useCallback(async (_table: string, _data: unknown) => {
        console.warn('createItem no implementado en la API aún');
        return { success: false, error: 'No implementado' };
    }, [])

    const updateItem = useCallback(async (_table: string, _id: string, _data: unknown) => {
        console.warn('updateItem no implementado en la API aún');
        return { success: false, error: 'No implementado' };
    }, [])

    const deleteItem = useCallback(async (_table: string, _id: string) => {
        console.warn('deleteItem no implementado en la API aún');
        return { success: false, error: 'No implementado' };
    }, [])

    return {
        plantas,
        areas,
        ubicaciones,
        tiposEquipo,
        loading,
        refresh: fetchCatalogos,
        createItem,
        updateItem,
        deleteItem
    }
}

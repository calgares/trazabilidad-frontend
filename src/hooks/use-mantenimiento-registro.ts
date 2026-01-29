import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface MaintenanceData {
    equipo_id: string
    tipo_mantenimiento: string
    descripcion: string
    fecha_inicio: string
    fecha_fin?: string
    costo_estimado?: number
    fallas: { descripcion: string; gravedad: string; causa_raiz?: string }[]
    repuestos: { nombre: string; cantidad: number; unidad: string; costo_unitario: number }[]
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export function useMantenimientoRegistro() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const registrarMantenimiento = async (data: MaintenanceData) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`${API_URL}/api/mantenimientos`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    equipo_id: data.equipo_id,
                    tipo_mantenimiento: data.tipo_mantenimiento,
                    descripcion: data.descripcion,
                    fecha_inicio: data.fecha_inicio,
                    fecha_fin: data.fecha_fin,
                    costo_estimado: data.costo_estimado,
                    fallas: data.fallas,
                    repuestos: data.repuestos
                })
            });

            if (!response.ok) {
                throw new Error('Error al registrar mantenimiento');
            }

            const maintData = await response.json();
            return { success: true, data: maintData }
        } catch (err: any) {
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    return { registrarMantenimiento, loading, error }
}

import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

interface EquipmentData {
    nombre: string;
    codigo_unico: string;
    tipo_equipo_id: string;
    ubicacion_id: string;
    estado: string;
    estado_operativo?: string;
    last_lat?: number | null;
    last_lon?: number | null;
}

export function useEquiposActions() {
    const [loading, setLoading] = useState(false)

    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const createEquipo = async (data: EquipmentData) => {
        try {
            setLoading(true)

            const response = await fetch(`${API_URL}/api/equipos`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error creando equipo');
            }

            return { success: true, data: result }
        } catch (err: unknown) {
            console.error("Error creating equipment:", err)
            return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
        } finally {
            setLoading(false)
        }
    }

    const updateEquipo = async (id: string, data: Partial<EquipmentData>) => {
        try {
            setLoading(true)

            const response = await fetch(`${API_URL}/api/equipos/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error actualizando equipo');
            }

            return { success: true, data: result }
        } catch (err: unknown) {
            console.error("Error updating equipment:", err)
            return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
        } finally {
            setLoading(false)
        }
    }

    const deleteEquipo = async (id: string) => {
        try {
            setLoading(true)

            const response = await fetch(`${API_URL}/api/equipos/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Error eliminando equipo');
            }

            return { success: true }
        } catch (err: unknown) {
            console.error("Error deleting equipment:", err)
            return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
        } finally {
            setLoading(false)
        }
    }

    return { createEquipo, updateEquipo, deleteEquipo, loading }
}

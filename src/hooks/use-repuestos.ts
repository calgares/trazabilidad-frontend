import { useState, useEffect, useCallback } from 'react';

export interface Caracteristica {
    nombre: string;
    valor: string;
}

export interface Repuesto {
    id: number;
    equipo_id: number;
    nombre: string;
    codigo_parte: string;
    cantidad: number;
    unidad_medida: string;
    ubicacion_almacen: string;
    caracteristicas: Caracteristica[];
    observaciones: string;
    fecha_registro: string;
    fecha_actualizacion: string;
}

export function useRepuestos(equipoId: string) {
    const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRepuestos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/repuestos/equipo/${equipoId}`);
            if (!response.ok) throw new Error('Error al cargar repuestos');
            const data = await response.json();

            // Ensure caracteristicas is parsed correctly if it comes as string (should be object from jsonb though)
            const parsedData = data.map((item: any) => ({
                ...item,
                caracteristicas: typeof item.caracteristicas === 'string'
                    ? JSON.parse(item.caracteristicas)
                    : item.caracteristicas || []
            }));

            setRepuestos(parsedData);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [equipoId]);

    useEffect(() => {
        if (equipoId) {
            fetchRepuestos();
        }
    }, [equipoId, fetchRepuestos]);

    const createRepuesto = async (data: Partial<Repuesto>) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/repuestos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, equipo_id: equipoId })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear repuesto');
            }
            await fetchRepuestos();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
        }
    };

    const updateRepuesto = async (id: number, data: Partial<Repuesto>) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/repuestos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar repuesto');
            }
            await fetchRepuestos();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
        }
    };

    const deleteRepuesto = async (id: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/repuestos/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar repuesto');
            }
            await fetchRepuestos();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
        }
    };

    return {
        repuestos,
        loading,
        error,
        refresh: fetchRepuestos,
        createRepuesto,
        updateRepuesto,
        deleteRepuesto
    };
}

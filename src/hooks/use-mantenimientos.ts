import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface Mantenimiento {
    id: number; // or string, depending on DB
    equipo_id: string; // UUID
    usuario_id: string;
    fecha_inicio: string;
    tipo_mantenimiento: string;
    descripcion: string;
    costo_estimado: number;
    equipo_nombre?: string;
    codigo_unico?: string;
    usuario_nombre?: string;
    usuario_apellido?: string;
}

export function useMantenimientos() {
    const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMantenimientos() {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/mantenimientos`);
                if (!response.ok) throw new Error('Error al cargar mantenimientos');

                const data = await response.json();
                setMantenimientos(data);
                setError(null);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Error desconocido');
            } finally {
                setLoading(false);
            }
        }

        fetchMantenimientos();
    }, []);

    return { mantenimientos, loading, error };
}

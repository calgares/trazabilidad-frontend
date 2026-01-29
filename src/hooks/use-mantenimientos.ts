import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export function useMantenimientos() {
    const [mantenimientos, setMantenimientos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchMantenimientos() {
            try {
                setLoading(true)
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_URL}/api/mantenimientos`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al cargar mantenimientos');
                }

                const data = await response.json();
                setMantenimientos(data || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchMantenimientos()
    }, [])

    return { mantenimientos, loading, error }
}

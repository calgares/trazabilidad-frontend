import { useEffect, useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([])
    const [roles, setRoles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUsuarios = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/api/usuarios`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al cargar usuarios');
            }

            const data = await response.json();
            setUsuarios(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchRoles = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/roles`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al cargar roles');
            }

            const data = await response.json();
            setRoles(data || [])
        } catch (err: any) {
            console.error("Error fetching roles:", err)
        }
    }, [])

    useEffect(() => {
        fetchUsuarios()
        fetchRoles()
    }, [fetchUsuarios, fetchRoles])

    const updateUsuarioRole = async (userId: string, roleId: number) => {
        try {
            const response = await fetch(`${API_URL}/api/usuarios/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ role_id: roleId })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar rol');
            }

            await fetchUsuarios()
            return { success: true }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    return {
        usuarios,
        roles,
        loading,
        error,
        refresh: fetchUsuarios,
        updateUsuarioRole
    }
}

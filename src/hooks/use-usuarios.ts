import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/services/supabase'

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([])
    const [roles, setRoles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUsuarios = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('perfiles')
                .select('*, roles(nombre)')
                .order('nombre', { ascending: true })

            if (error) throw error
            setUsuarios(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchRoles = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('roles')
                .select('*')
                .order('id', { ascending: true })

            if (error) throw error
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
            const { error } = await supabase
                .from('perfiles')
                .update({ role_id: roleId })
                .eq('id', userId)

            if (error) throw error
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

import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'

export function useMantenimientos() {
    const [mantenimientos, setMantenimientos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchMantenimientos() {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('mantenimientos')
                    .select(`
                        *,
                        equipos(nombre, codigo_unico)
                    `)
                    .order('fecha_inicio', { ascending: false })

                if (error) throw error
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

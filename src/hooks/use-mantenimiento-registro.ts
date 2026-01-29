import { useState } from 'react'
import { supabase } from '@/services/supabase'

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

export function useMantenimientoRegistro() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const registrarMantenimiento = async (data: MaintenanceData) => {
        try {
            setLoading(true)
            setError(null)

            // 1. Insert Mantenimiento
            const { data: maintData, error: maintError } = await supabase
                .from('mantenimientos')
                .insert({
                    equipo_id: data.equipo_id,
                    tipo_mantenimiento: data.tipo_mantenimiento,
                    descripcion: data.descripcion,
                    fecha_inicio: data.fecha_inicio,
                    fecha_fin: data.fecha_fin,
                    costo_estimado: data.costo_estimado
                })
                .select()
                .single()

            if (maintError) throw maintError
            const mantenimientoId = maintData.id

            // 2. Insert Fallas if any
            if (data.fallas.length > 0) {
                const { error: fallasError } = await supabase
                    .from('fallas')
                    .insert(
                        data.fallas.map(f => ({
                            ...f,
                            mantenimiento_id: mantenimientoId
                        }))
                    )
                if (fallasError) throw fallasError
            }

            // 3. Insert Repuestos if any
            if (data.repuestos.length > 0) {
                const { error: repuestosError } = await supabase
                    .from('repuestos')
                    .insert(
                        data.repuestos.map(r => ({
                            ...r,
                            mantenimiento_id: mantenimientoId
                        }))
                    )
                if (repuestosError) throw repuestosError
            }

            // 4. Create Event in Timeline
            const { error: eventError } = await supabase
                .from('eventos_equipo')
                .insert({
                    equipo_id: data.equipo_id,
                    tipo_evento: 'Mantenimiento',
                    referencia_id: mantenimientoId,
                    descripcion: `Mantenimiento ${data.tipo_mantenimiento}: ${data.descripcion}`,
                    fecha: new Date().toISOString()
                })
            if (eventError) throw eventError

            // 5. Update Equipment status if it was "Fuera de Servicio" and now it's finished? 
            // For MVP, we'll keep it simple or allow the user to choose.

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

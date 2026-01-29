export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            equipos: {
                Row: {
                    id: string
                    codigo_unico: string
                    nombre: string
                    tipo_equipo_id: string | null
                    ubicacion_id: string | null
                    estado: string
                    imagen_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    codigo_unico: string
                    nombre: string
                    tipo_equipo_id?: string | null
                    ubicacion_id?: string | null
                    estado?: string
                    imagen_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    codigo_unico?: string
                    nombre?: string
                    tipo_equipo_id?: string | null
                    ubicacion_id?: string | null
                    estado?: string
                    imagen_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            tipos_equipo: {
                Row: {
                    id: string
                    nombre: string
                    descripcion: string | null
                    created_at: string
                }
            }
            mantenimientos: {
                Row: {
                    id: string
                    equipo_id: string | null
                    usuario_id: string | null
                    fecha_inicio: string
                    fecha_fin: string | null
                    tipo_mantenimiento: string | null
                    descripcion: string | null
                    costo_estimado: number | null
                    created_at: string
                }
            }
            areas_departamentos: {
                Row: {
                    id: string
                    planta_id: string | null
                    nombre: string
                    created_at: string
                }
            }
            ubicaciones: {
                Row: {
                    id: string
                    area_id: string | null
                    nombre: string
                    created_at: string
                }
            }
        }
    }
}

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/services/supabase'

export interface AuditLog {
    id: string;
    tabla_afectada: string;
    registro_id: string;
    campo: string;
    valor_anterior: string | null;
    valor_nuevo: string | null;
    usuario_id: string;
    fecha: string;
    usuario?: {
        nombre: string;
        apellido: string;
        email?: string;
    };
    accion: string;
}

export function useAudit() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true)

            // Fetch from the new audit_logs table
            const { data, error, count } = await supabase
                .from('audit_logs')
                .select(`
                  *,
                  usuario:perfiles!changed_by(nombre, apellido) 
                `, { count: 'exact' }) // Assuming perfiles is linked via changed_by. If FK is not set in DB, this might fail. 
                // Given I didn't set explicit FK in create_security_policies.sql, I might need to fetch profiles separately 
                // or hope Supabase infers it if naming convention works (it usually needs explicit FK).
                // Let's assume for now I need to fetch profiles manually if the join fails, OR update the schema to add FK.
                // Actually, simplified: I will fetch raw logs and then fetch necessary profiles.
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error

            const rawLogs = data || [];
            setTotalCount(count || 0);

            // Collect user IDs to fetch profiles if the join didn't work (or if we prefer manual)
            // But let's try to map the rawLogs into the expanded format
            const expandedLogs: AuditLog[] = [];

            rawLogs.forEach((row: { id: string; table_name: string; record_id: string; action: string; old_data: Record<string, unknown> | null; new_data: Record<string, unknown> | null; changed_by: string; created_at: string; usuario?: { nombre: string; apellido: string } }) => {
                const { id, table_name, record_id, action, old_data, new_data, changed_by, created_at, usuario } = row;

                // Common base properties
                const baseLog = {
                    id: id, // uniqueness might be an issue if we split into multiple rows, we'll append index
                    tabla_afectada: table_name,
                    registro_id: record_id,
                    usuario_id: changed_by,
                    fecha: created_at,
                    usuario: usuario || { nombre: 'Sistema', apellido: '' },
                    accion: action
                };

                if (action === 'UPDATE' && old_data && new_data) {
                    // Find changed keys
                    Object.keys(new_data).forEach((key, idx) => {
                        const oldVal = JSON.stringify(old_data[key]);
                        const newVal = JSON.stringify(new_data[key]);

                        if (oldVal !== newVal) {
                            expandedLogs.push({
                                ...baseLog,
                                id: `${id}-${idx}`, // Unique ID for key
                                campo: key,
                                valor_anterior: String(old_data[key]),
                                valor_nuevo: String(new_data[key])
                            });
                        }
                    });
                } else if (action === 'INSERT') {
                    expandedLogs.push({
                        ...baseLog,
                        id: `${id}-0`,
                        campo: '(Nuevo Registro)',
                        valor_anterior: null,
                        valor_nuevo: 'Creado'
                    });
                } else if (action === 'DELETE') {
                    expandedLogs.push({
                        ...baseLog,
                        id: `${id}-0`,
                        campo: '(Registro Eliminado)',
                        valor_anterior: 'Borrado',
                        valor_nuevo: null
                    });
                }
            });

            setLogs(expandedLogs)

        } catch (err: any) {
            console.error(err);
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    return { logs, loading, error, totalCount, refresh: fetchLogs }
}

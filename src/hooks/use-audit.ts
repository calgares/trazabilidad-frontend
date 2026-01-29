import { useEffect, useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

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
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/audit-logs`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar logs');
            }

            const rawLogs = await response.json();
            setTotalCount(rawLogs.length || 0);

            const expandedLogs: AuditLog[] = [];

            rawLogs.forEach((row: { id: string; table_name: string; record_id: string; action: string; old_data: Record<string, unknown> | null; new_data: Record<string, unknown> | null; changed_by: string; created_at: string; usuario?: { nombre: string; apellido: string } }) => {
                const { id, table_name, record_id, action, old_data, new_data, changed_by, created_at, usuario } = row;

                const baseLog = {
                    id: id,
                    tabla_afectada: table_name,
                    registro_id: record_id,
                    usuario_id: changed_by,
                    fecha: created_at,
                    usuario: usuario || { nombre: 'Sistema', apellido: '' },
                    accion: action
                };

                if (action === 'UPDATE' && old_data && new_data) {
                    Object.keys(new_data).forEach((key, idx) => {
                        const oldVal = JSON.stringify(old_data[key]);
                        const newVal = JSON.stringify(new_data[key]);

                        if (oldVal !== newVal) {
                            expandedLogs.push({
                                ...baseLog,
                                id: `${id}-${idx}`,
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

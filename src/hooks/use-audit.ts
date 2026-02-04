import { useEffect, useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface AuditLog {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    user_id: string | null;
    user_nombre?: string;
    user_apellido?: string;
    user_email?: string;
    details: any; // Can be string or object
    created_at: string;
}

interface UseAuditParams {
    page?: number;
    limit?: number;
    type?: string;
    userId?: string;
    from?: string;
    to?: string;
}

export function useAudit() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)

    const fetchLogs = useCallback(async (params: UseAuditParams = {}) => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token');

            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.type) queryParams.append('type', params.type);
            if (params.userId) queryParams.append('user', params.userId);
            if (params.from) queryParams.append('from', params.from);
            if (params.to) queryParams.append('to', params.to);

            const response = await fetch(`${API_URL}/api/audit?${queryParams.toString()}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar logs');
            }

            const data = await response.json();

            // Backend returns { data: [], total: number } on V3
            // If fallback to legacy array, handle it
            const rawLogs = Array.isArray(data) ? data : data.data;
            const total = Array.isArray(data) ? data.length : data.total;

            setTotalCount(total || 0);

            // Parse details if string
            const parsedLogs = rawLogs.map((log: any) => {
                let parsedDetails = log.details;
                try {
                    if (typeof log.details === 'string') {
                        parsedDetails = JSON.parse(log.details);
                    }
                } catch (e) {
                    console.warn('Failed to parse audit details', e);
                }

                return {
                    ...log,
                    details: parsedDetails
                };
            });

            setLogs(parsedLogs)

        } catch (err: any) {
            console.error(err);
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial fetch handled by component or here? 
    // Usually component calls it with specific page, but we can default.

    return { logs, loading, error, totalCount, fetchLogs }
}

import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface AuditFinding {
    entity_id: string;
    entity_type: string;
    rule_code: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
    description: string;
}

export function useIsoAudit() {
    const [findings, setFindings] = useState<AuditFinding[]>([]);
    const [stats, setStats] = useState({ critical: 0, major: 0, score: 100 });
    const [loading, setLoading] = useState(true);

    const runAudit = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/iso-audit`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            if (!response.ok) {
                throw new Error('Error al ejecutar auditoría');
            }

            const allFindings = await response.json() as AuditFinding[];
            setFindings(allFindings);

            const critical = allFindings.filter(f => f.severity === 'CRITICAL').length;
            const major = allFindings.filter(f => f.severity === 'MAJOR').length;
            let penalty = (critical * 10) + (major * 5) + (allFindings.length - critical - major);
            const score = Math.max(0, 100 - penalty);

            setStats({ critical, major, score });

        } catch (err) {
            console.error("Audit Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        runAudit();
    }, [runAudit]);

    return { findings, stats, loading, runAudit };
}

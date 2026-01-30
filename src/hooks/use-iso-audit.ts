import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

export interface AuditFinding {
    entity_id: string;
    entity_type: string;
    rule_code: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
    description: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export function useIsoAudit() {
    const { getAuthHeaders } = useAuth();
    const [findings, setFindings] = useState<AuditFinding[]>([]);
    const [stats, setStats] = useState({ critical: 0, major: 0, score: 100 });
    const [loading, setLoading] = useState(true);

    const runAudit = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/iso-audit`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) throw new Error('Error al ejecutar auditoría');

            const allFindings: AuditFinding[] = await response.json();

            setFindings(allFindings);

            // Calculate Stats
            const critical = allFindings.filter(f => f.severity === 'CRITICAL').length;
            const major = allFindings.filter(f => f.severity === 'MAJOR').length;

            // Simple Logic for Health Score
            // Start at 100. Deduct 10 for Critical, 5 for Major, 1 for Info.
            let penalty = (critical * 10) + (major * 5) + (allFindings.length - critical - major);
            const score = Math.max(0, 100 - penalty);

            setStats({ critical, major, score });

        } catch (err) {
            console.error("Audit Error:", err);
            // On error return valid structure but empty
            setFindings([]);
            setStats({ critical: 0, major: 0, score: 100 });
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    useEffect(() => {
        runAudit();
    }, [runAudit]);

    return { findings, stats, loading, runAudit };
}

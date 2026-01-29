import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';

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
            // Fetch from the 3 Real-time Views
            const [r1, r2, r3] = await Promise.all([
                supabase.from('view_audit_missing_maintenance_plan').select('*'),
                supabase.from('view_audit_stale_failures').select('*'),
                supabase.from('view_audit_ghost_assets').select('*')
            ]);

            const allFindings = [
                ...(r1.data || []),
                ...(r2.data || []),
                ...(r3.data || [])
            ] as AuditFinding[];

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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        runAudit();
    }, [runAudit]);

    return { findings, stats, loading, runAudit };
}

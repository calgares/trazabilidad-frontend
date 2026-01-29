import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';

export type ReportType = 'EQUIPOS' | 'FALLAS' | 'PREVENTIVOS' | 'ASIGNACIONES';

export function useReportes() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReporte = useCallback(async (tipo: ReportType) => {
        try {
            setLoading(true);
            let query = null;

            switch (tipo) {
                case 'EQUIPOS':
                    query = supabase.from('view_reporte_equipos_completo').select('*');
                    break;
                case 'FALLAS':
                    query = supabase.from('view_reporte_fallas_extendido').select('*').order('fecha_reporte', { ascending: false });
                    break;
                case 'PREVENTIVOS':
                    query = supabase.from('view_reporte_preventivos_calc').select('*');
                    break;
                default:
                    throw new Error("Tipo de reporte no válido");
            }

            const { data: result, error: queryError } = await query;

            if (queryError) throw queryError;
            setData(result || []);
        } catch (err: any) {
            console.error("Error al cargar reporte:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const exportarCSV = (filename: string = 'reporte') => {
        if (!data || data.length === 0) {
            alert("No hay datos para exportar");
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const val = row[header];
                return val === null || val === undefined ? '' : typeof val === 'string' ? `"${val}"` : val;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return { data, loading, error, fetchReporte, exportarCSV };
}

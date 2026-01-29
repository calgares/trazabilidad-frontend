import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export type ReportType = 'EQUIPOS' | 'FALLAS' | 'PREVENTIVOS' | 'ASIGNACIONES';

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export function useReportes() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReporte = useCallback(async (tipo: ReportType) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/reportes/${tipo.toLowerCase()}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al cargar reporte');
            }

            const result = await response.json();
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

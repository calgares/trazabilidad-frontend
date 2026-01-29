import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface WorkOrderEvidence {
    id: string;
    work_order_id: string;
    tipo: 'FOTO' | 'DOCUMENTO' | 'COMENTARIO';
    url_archivo?: string;
    comentario?: string;
    created_at: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export function useWorkOrderEvidences() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const listEvidences = useCallback(async (workOrderId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/work-orders/${workOrderId}/evidences`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al cargar evidencias');
            }

            const data = await response.json();
            return data as WorkOrderEvidence[];
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadEvidence = async (
        workOrderId: string,
        file: File,
        comment?: string,
        tipo: 'FOTO' | 'DOCUMENTO' = 'FOTO'
    ) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('tipo', tipo);
            if (comment) formData.append('comentario', comment);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/work-orders/${workOrderId}/evidences`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al subir evidencia');
            }

            return await response.json();
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || "Error al subir evidencia");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteEvidence = async (evidence: WorkOrderEvidence) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/work-orders/evidences/${evidence.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al eliminar evidencia');
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addComment = async (workOrderId: string, comment: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/work-orders/${workOrderId}/evidences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    tipo: 'COMENTARIO',
                    comentario: comment
                })
            });

            if (!response.ok) {
                throw new Error('Error al agregar comentario');
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        listEvidences,
        uploadEvidence,
        deleteEvidence,
        addComment,
        loading,
        error
    };
}

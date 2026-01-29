import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface Article {
    id: string;
    titulo: string;
    categoria: string;
    contenido_markdown: string;
    rol_requerido: string;
    orden: number;
}

export interface ChecklistItem {
    id: string;
    titulo: string;
    descripcion: string;
    categoria: string;
    requerido_por_rol: string;
    orden: number;
    completado?: boolean;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export function useKnowledgeBase() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { profile } = useAuth();

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/knowledge-base`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al cargar artículos');
            }

            const data = await response.json();
            const filtered = (data || []).filter((art: Article) => {
                if (art.rol_requerido === 'TODOS') return true;
                if (!profile?.roles?.nombre) return false;
                if (art.rol_requerido === 'ADMIN' && profile.roles.nombre !== 'Administrador') return false;
                return true;
            });

            setArticles(filtered);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    return { articles, loading, error, refresh: fetchArticles };
}

export function useChecklist() {
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, profile } = useAuth();

    const fetchChecklist = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/checklist?usuario_id=${user.id}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Error al cargar checklist');
            }

            const data = await response.json();
            const filtered = (data || []).filter((item: ChecklistItem) => {
                if (item.requerido_por_rol === 'ADMIN' && profile?.roles?.nombre !== 'Administrador') return false;
                return true;
            });

            setChecklist(filtered);

            const completedCount = filtered.filter((i: ChecklistItem) => i.completado).length;
            const total = filtered.length;
            setProgress(total > 0 ? Math.round((completedCount / total) * 100) : 0);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user, profile]);

    const toggleItem = async (itemId: string, currentStatus: boolean) => {
        if (!user) return;

        try {
            setChecklist(prev => prev.map(i => i.id === itemId ? { ...i, completado: !currentStatus } : i));

            const response = await fetch(`${API_URL}/api/checklist/${itemId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    usuario_id: user.id,
                    completado: !currentStatus
                })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar item');
            }

            fetchChecklist();
        } catch (err: any) {
            console.error("Error toggling item:", err);
            setError(err.message);
            fetchChecklist();
        }
    };

    useEffect(() => {
        fetchChecklist();
    }, [fetchChecklist]);

    return { checklist, progress, loading, error, toggleItem, refresh: fetchChecklist };
}

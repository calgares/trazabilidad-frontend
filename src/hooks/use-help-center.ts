import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/auth-context';

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
    completado?: boolean; // Joined status
}

export function useKnowledgeBase() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { profile } = useAuth();

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('knowledge_base_articles')
                .select('*')
                .order('orden', { ascending: true });

            if (error) throw error;

            // Simple Filter by Role (Client side for simplicity, seeing as RLS is public read)
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

            // 1. Fetch Checklist Items
            const { data: itemsData, error: itemsError } = await supabase
                .from('onboarding_checklist')
                .select('*')
                .order('orden');

            if (itemsError) throw itemsError;

            // 2. Fetch User Progress
            const { data: progressData, error: progressError } = await supabase
                .from('user_checklist_progress')
                .select('checklist_id, completado')
                .eq('usuario_id', user.id);

            if (progressError) throw progressError;

            // 3. Merge
            const progressMap = new Map();
            progressData?.forEach((p: any) => {
                if (p.completado) progressMap.set(p.checklist_id, true);
            });

            const merged = (itemsData || []).map((item: ChecklistItem) => ({
                ...item,
                completado: progressMap.has(item.id)
            }));

            // Filter optional if needed, but for now show all relevant to role
            // Filter by Admin logic if item is admin only?
            const filtered = merged.filter((item: ChecklistItem) => {
                if (item.requerido_por_rol === 'ADMIN' && profile?.roles?.nombre !== 'Administrador') return false;
                return true;
            });

            setChecklist(filtered);

            // Calculate Progress
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
            // Optimistic update
            setChecklist(prev => prev.map(i => i.id === itemId ? { ...i, completado: !currentStatus } : i));

            if (!currentStatus) {
                // Mark as done
                const { error } = await supabase
                    .from('user_checklist_progress')
                    .upsert({
                        checklist_id: itemId,
                        usuario_id: user.id,
                        completado: true,
                        fecha_completado: new Date().toISOString()
                    }, { onConflict: 'checklist_id, usuario_id' });
                if (error) throw error;
            } else {
                // Mark as incomplete
                const { error } = await supabase
                    .from('user_checklist_progress')
                    .update({ completado: false })
                    .eq('checklist_id', itemId)
                    .eq('usuario_id', user.id);
                if (error) throw error;
            }

            // Re-calculate progress in background or just wait for next fetch
            // Let's refetch to be safe/consistent
            fetchChecklist();

        } catch (err: any) {
            console.error("Error toggling item:", err);
            setError(err.message);
            // Revert on error could be implemented here
            fetchChecklist();
        }
    };

    useEffect(() => {
        fetchChecklist();
    }, [fetchChecklist]);

    return { checklist, progress, loading, error, toggleItem, refresh: fetchChecklist };
}

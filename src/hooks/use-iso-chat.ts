import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface Session {
    id: string;
    title: string;
    created_at: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export function useIsoChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentSession, setCurrentSession] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    const fetchMessages = useCallback(async (sessionId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/iso-chat/sessions/${sessionId}/messages`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data || []);
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    }, []);

    const addMessageToDb = useCallback(async (sessionId: string, role: 'user' | 'assistant', content: string) => {
        await fetch(`${API_URL}/api/iso-chat/sessions/${sessionId}/messages`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ role, content })
        });
    }, []);

    const createNewSession = useCallback(async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/api/iso-chat/sessions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ user_id: user.id, title: 'Consulta ISO' })
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentSession(data.id);
                setMessages([]);
                addMessageToDb(data.id, 'assistant', 'Hola, soy tu Asistente ISO 55000. Analizo tus activos y normativa en tiempo real. ¿En qué puedo ayudarte?');
            }
        } catch (err) {
            console.error("Error creating session:", err);
        }
    }, [user, addMessageToDb]);

    const initSession = useCallback(async () => {
        if (!user) return;

        try {
            const response = await fetch(`${API_URL}/api/iso-chat/sessions?user_id=${user.id}&limit=1`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setCurrentSession(data[0].id);
                    fetchMessages(data[0].id);
                } else {
                    createNewSession();
                }
            }
        } catch (err) {
            console.error("Error initializing session:", err);
        }
    }, [user, fetchMessages, createNewSession]);

    const sendMessage = async (content: string) => {
        if (!currentSession || !user) return;

        const tempId = crypto.randomUUID();
        const userMsg: Message = { id: tempId, role: 'user', content, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            await addMessageToDb(currentSession, 'user', content);

            setTimeout(async () => {
                const response = generateExpertResponse(content);
                await addMessageToDb(currentSession, 'assistant', response);
                setIsTyping(false);
                fetchMessages(currentSession);
            }, 1000 + Math.random() * 1000);

        } catch (err) {
            console.error("Chat Error", err);
            setIsTyping(false);
        }
    };

    const generateExpertResponse = (question: string): string => {
        const q = question.toLowerCase();

        if (q.includes('falla') || q.includes('reportar')) {
            return `**Norma ISO 14224**: Para registrar una falla correctamente, debes incluir:
1. Modo de falla (ej. Fuga, Vibración).
2. Causa Raíz (si se conoce).
3. Severidad.

Puedes ir a la sección "Fallas" o usar el botón "Reportar" en la ficha del equipo.`;
        }

        if (q.includes('mantenimiento') || q.includes('preventivo')) {
            return `**Norma ISO 55000**: La gestión de activos requiere planes preventivos para equipos críticos.
Verifica que tus equipos críticos tengan asignado un plan. He detectado los equipos sin cobertura en el panel de auditoría.`;
        }

        if (q.includes('auditoria') || q.includes('revisar')) {
            return `Estoy ejecutando un escaneo continuo. Revisa el panel izquierdo para ver las "No Conformidades" detectadas según mis reglas pre-cargadas.`;
        }

        if (q.includes('hola') || q.includes('buenos dias')) {
            return `¡Hola! Estoy listo para auditar tus activos.`;
        }

        return `Entendido. Mi base de conocimiento está consultando el manual operativo. 
Para temas de **Normativa**, **Seguridad** o **Gestión**, por favor sé más específico.`;
    };

    useEffect(() => {
        initSession();
    }, [initSession]);

    return { messages, isTyping, sendMessage };
}

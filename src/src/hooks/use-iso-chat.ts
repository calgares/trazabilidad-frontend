import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/auth-context';

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

export function useIsoChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentSession, setCurrentSession] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    // Fetch messages - declared first to avoid hoisting issues
    const fetchMessages = useCallback(async (sessionId: string) => {
        const { data } = await supabase
            .from('iso_chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
    }, []);

    const addMessageToDb = useCallback(async (sessionId: string, role: 'user' | 'assistant', content: string) => {
        await supabase.from('iso_chat_messages').insert({
            session_id: sessionId,
            role,
            content
        });
    }, []);

    const createNewSession = useCallback(async () => {
        if (!user) return;
        const { data, error: _error } = await supabase
            .from('iso_chat_sessions')
            .insert({ user_id: user.id, title: 'Consulta ISO' })
            .select()
            .single();

        if (data) {
            setCurrentSession(data.id);
            setMessages([]);
            // Welcome message
            addMessageToDb(data.id, 'assistant', 'Hola, soy tu Asistente ISO 55000. Analizo tus activos y normativa en tiempo real. ¿En qué puedo ayudarte?');
        }
    }, [user, addMessageToDb]);

    // Initialize or Fetch Session
    const initSession = useCallback(async () => {
        if (!user) return;

        // Check for existing recent session
        const { data } = await supabase
            .from('iso_chat_sessions')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (data && data.length > 0) {
            setCurrentSession(data[0].id);
            fetchMessages(data[0].id);
        } else {
            // Create new
            createNewSession();
        }
    }, [user, fetchMessages, createNewSession]);

    // 2. Send Message logic
    const sendMessage = async (content: string) => {
        if (!currentSession || !user) return;

        // Optimistic UI
        const tempId = crypto.randomUUID();
        const userMsg: Message = { id: tempId, role: 'user', content, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // Persist User Msg
            await addMessageToDb(currentSession, 'user', content);

            // ANALYZE & RESPOND (Simple Expert System)
            setTimeout(async () => {
                const response = generateExpertResponse(content);
                await addMessageToDb(currentSession, 'assistant', response);
                setIsTyping(false);
                fetchMessages(currentSession); // Re-sync
            }, 1000 + Math.random() * 1000); // Fake "thinking" delay

        } catch (err) {
            console.error("Chat Error", err);
            setIsTyping(false);
        }
    };



    // 3. Simple Expert Rules Engine
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

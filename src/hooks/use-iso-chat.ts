import { useState, useEffect, useCallback } from 'react';
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

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

export function useIsoChat() {
    const { getAuthHeaders, user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentSession, setCurrentSession] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    // Fetch messages
    const fetchMessages = useCallback(async (sessionId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/iso-chat/sessions/${sessionId}/messages`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [getAuthHeaders]);

    const createNewSession = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/iso-chat/sessions`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: 'Nueva Consulta ISO' })
            });

            if (res.ok) {
                const session = await res.json();
                setCurrentSession(session.id);
                // Fetch initial messages (welcome message)
                fetchMessages(session.id);
            }
        } catch (error) {
            console.error('Error creating session:', error);
        }
    }, [getAuthHeaders, fetchMessages]);

    // Initialize or Fetch Session
    const initSession = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/api/iso-chat/sessions`, {
                headers: getAuthHeaders()
            });

            if (res.ok) {
                const sessions = await res.json();
                if (sessions.length > 0) {
                    setCurrentSession(sessions[0].id);
                    fetchMessages(sessions[0].id);
                } else {
                    createNewSession();
                }
            }
        } catch (error) {
            console.error('Error init session:', error);
        }
    }, [user, getAuthHeaders, fetchMessages, createNewSession]);

    // Send Message
    const sendMessage = async (content: string) => {
        if (!currentSession) return;

        // Optimistic UI for user message
        const tempId = crypto.randomUUID();
        const userMsg: Message = { id: tempId, role: 'user', content, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const res = await fetch(`${API_URL}/api/iso-chat/sessions/${currentSession}/messages`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (res.ok) {
                // The backend returns the Assistant's response message
                const botMsg = await res.json();

                // Add bot message
                setMessages(prev => [...prev, botMsg]);
            }
        } catch (err) {
            console.error("Chat Error", err);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        initSession();
    }, [initSession]);

    return { messages, isTyping, sendMessage };
}

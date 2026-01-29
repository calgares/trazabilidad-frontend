import { useState, useRef, useEffect } from "react";
import { useIsoAudit } from "@/hooks/use-iso-audit";
import { useIsoChat } from "@/hooks/use-iso-chat";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Bot, ShieldAlert, CheckCircle2, AlertTriangle, Info, Send, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function IsoAssistantView() {
    return (
        <div className="h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
            {/* Left Panel: Audit Dashboard */}
            <div className="lg:col-span-2 space-y-6 flex flex-col min-h-0">
                <AuditDashboard />
            </div>

            {/* Right Panel: Chat Interface */}
            <div className="lg:col-span-1 h-full min-h-[500px]">
                <ChatInterface />
            </div>
        </div>
    );
}

function AuditDashboard() {
    const { findings, stats, loading, runAudit } = useIsoAudit();

    const getSeverityColor = (s: string) => {
        switch (s) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'MAJOR': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        Auditoría ISO 55000
                    </h2>
                    <p className="text-sm text-slate-500">Monitoreo continuo de conformidad y calidad de datos.</p>
                </div>
                <Button variant="outline" size="sm" onClick={runAudit} disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Escaneo Manual
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Health Score</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-end gap-2">
                            {stats.score}%
                            <span className="text-xs font-normal text-slate-400 mb-1">confiabilidad</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 dark:bg-slate-800">
                            <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${stats.score}%` }} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-red-100 bg-red-50/50 dark:border-red-900/20 dark:bg-red-900/10">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Riesgos Críticos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.critical}</div>
                        <p className="text-xs text-red-500 mt-1">Acción inmediata requerida</p>
                    </CardContent>
                </Card>
                <Card className="border-orange-100 bg-orange-50/50 dark:border-orange-900/20 dark:bg-orange-900/10">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">Inconformidades</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{stats.major}</div>
                        <p className="text-xs text-orange-500 mt-1">Revisión recomendada</p>
                    </CardContent>
                </Card>
            </div>

            {/* Findings List */}
            <Card className="flex-1 flex flex-col min-h-0 border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-lg">Hallazgos Detectados</CardTitle>
                    <CardDescription>Lista de violaciones a reglas de negocio o normativas.</CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-4">
                        {findings.length === 0 ? (
                            <div className="text-center py-10">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Sin hallazgos pendientes</h3>
                                <p className="text-slate-500 text-sm">El sistema cumple con las reglas de auditoría activas.</p>
                            </div>
                        ) : (
                            findings.map((f, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-100 transition-colors group">
                                    <div className="mt-1">
                                        {f.severity === 'CRITICAL' ? <AlertTriangle className="h-5 w-5 text-red-500" /> :
                                            f.severity === 'MAJOR' ? <AlertTriangle className="h-5 w-5 text-orange-500" /> :
                                                <Info className="h-5 w-5 text-blue-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider", getSeverityColor(f.severity))}>
                                                {f.rule_code}
                                            </Badge>
                                            <span className="text-xs text-slate-400 font-mono">ID: {f.entity_id.substring(0, 8)}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                                            {f.description}
                                        </p>
                                        <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="link" className="p-0 h-auto text-indigo-600 dark:text-indigo-400 text-xs" asChild>
                                                <Link to={f.entity_type === 'EQUIPO' ? '/equipos' : f.entity_type === 'FALLA' ? '/fallas' : '#'}>
                                                    Corregir Ahora <ExternalLink className="ml-1 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </Card>
        </div>
    );
}


function ChatInterface() {
    const { messages, isTyping, sendMessage } = useIsoChat();
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue("");
    };

    return (
        <Card className="h-full flex flex-col border-slate-200 dark:border-slate-800 shadow-lg">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base text-slate-900 dark:text-slate-100">Asistente Virtual ISO</CardTitle>
                        <CardDescription className="text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className={cn("block h-2 w-2 rounded-full", isTyping ? "bg-indigo-500 animate-pulse" : "bg-green-500")} />
                                {isTyping ? "Escribiendo..." : "En línea"}
                            </span>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col min-h-0 bg-white dark:bg-slate-950">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-400 text-xs py-8">
                            <p>Historial vacío.</p>
                            <p>¡Hazme una pregunta!</p>
                        </div>
                    )}
                    {messages.map((m) => (
                        <div key={m.id} className={cn("flex w-full", m.role === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                m.role === 'user'
                                    ? "bg-indigo-600 text-white rounded-br-none"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                            )}>
                                <p className="whitespace-pre-wrap">{m.content}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex w-full justify-start">
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 rounded-bl-none flex items-center gap-1">
                                <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-center gap-2"
                    >
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Escribe tu consulta..."
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                        />
                        <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                    <div className="mt-2 flex justify-center gap-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 text-[10px] text-slate-400" onClick={() => setInputValue("¿Cómo reporto una falla?")}>
                            Reportar falla
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 text-[10px] text-slate-400" onClick={() => setInputValue("¿Qué equipos auditar?")}>
                            Auditar equipos
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

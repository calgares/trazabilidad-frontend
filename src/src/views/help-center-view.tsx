import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckSquare, FileText, ChevronRight, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Article } from "@/hooks/use-help-center";
import { useChecklist, useKnowledgeBase } from "@/hooks/use-help-center";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

// Helper Component for Markdown Rendering (Simplified)
function MarkdownRenderer({ content }: { content: string }) {
    if (!content) return null;

    // Split by newlines and basic parsing
    const lines = content.split('\n');

    return (
        <div className="space-y-4 text-slate-700 dark:text-slate-300">
            {lines.map((line, idx) => {
                if (line.startsWith('# ')) {
                    return <h1 key={idx} className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">{line.replace('# ', '')}</h1>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-5 mb-3">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('- ')) {
                    return (
                        <div key={idx} className="flex gap-2 ml-4">
                            <span className="text-blue-500">•</span>
                            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('- ', '')) }} />
                        </div>
                    );
                }
                if (line.match(/^\d+\. /)) {
                    return (
                        <div key={idx} className="flex gap-2 ml-4">
                            <span className="font-mono text-xs text-slate-400 mt-1">{line.split('.')[0]}.</span>
                            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\. /, '')) }} />
                        </div>
                    );
                }
                if (line.trim() === '') return <br key={idx} />;

                return <p key={idx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
            })}
        </div>
    );
}

// Helper for bold/italic
function formatInline(text: string) {
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm font-mono text-pink-500">$1</code>'); // Code
    return formatted;
}


function ArticleList({ onSelect, selectedId }: { onSelect: (a: Article) => void, selectedId?: string }) {
    const { articles, loading } = useKnowledgeBase();
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = articles.filter(a =>
        a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = Array.from(new Set(filtered.map(a => a.categoria)));

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        className="w-full bg-slate-100 dark:bg-slate-900 pl-9 pr-4 py-2 rounded-md text-sm border-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Buscar artículos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {categories.map(cat => (
                        <div key={cat}>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">{cat}</h4>
                            <div className="space-y-1">
                                {filtered.filter(a => a.categoria === cat).map(article => (
                                    <button
                                        key={article.id}
                                        onClick={() => onSelect(article)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group",
                                            selectedId === article.id
                                                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-medium"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <span>{article.titulo}</span>
                                        <ChevronRight className={cn("h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity", selectedId === article.id && "opacity-100 text-blue-500")} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No se encontraron artículos.</p>}
                </div>
            </ScrollArea>
        </div>
    );
}

function ChecklistPanel() {
    const { checklist, progress, loading, toggleItem } = useChecklist();

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

    const categories = Array.from(new Set(checklist.map(i => i.categoria)));

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-900 border-blue-100 dark:border-slate-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">Progreso de Implementación</CardTitle>
                            <CardDescription>Completa estos pasos para configurar tu entorno.</CardDescription>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Completado</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Progress value={progress} className="h-3" />
                </CardContent>
            </Card>

            <div className="grid gap-6">
                {categories.map(cat => (
                    <div key={cat} className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">{cat}</Badge>
                        </h3>
                        <div className="grid gap-3">
                            {checklist.filter(i => i.categoria === cat).map(item => (
                                <Card key={item.id} className={cn("transition-all", item.completado ? "bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-80" : "hover:border-blue-200 dark:hover:border-slate-700")}>
                                    <div className="p-4 flex items-start gap-4">
                                        <Checkbox
                                            id={item.id}
                                            checked={!!item.completado}
                                            onCheckedChange={() => toggleItem(item.id, !!item.completado)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <label
                                                htmlFor={item.id}
                                                className={cn("text-base font-medium cursor-pointer select-none", item.completado ? "text-slate-500 line-through" : "text-slate-900 dark:text-slate-100")}
                                            >
                                                {item.titulo}
                                            </label>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {item.descripcion}
                                            </p>
                                        </div>
                                        {item.requerido_por_rol === 'ADMIN' && <Badge variant="secondary" className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800">Admin</Badge>}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function HelpCenterView() {
    const { profile } = useAuth();
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    return (
        <div className="container mx-auto max-w-7xl h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-blue-500" />
                    Centro de Ayuda
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Recursos, guías y herramientas para aprovechar al máximo el sistema.
                </p>
            </div>

            <Tabs defaultValue="manual" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-fit mb-4">
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Manual de Usuario
                    </TabsTrigger>
                    <TabsTrigger value="checklist" className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" /> Checklist de Implementación
                    </TabsTrigger>
                    {profile?.roles?.nombre === 'Administrador' && (
                        <TabsTrigger value="docs" className="flex items-center gap-2">
                            <Search className="h-4 w-4" /> Docs Técnicas
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="manual" className="flex-1 flex gap-6 min-h-0 mt-0">
                    <div className="w-80 flex-shrink-0">
                        <ArticleList onSelect={setSelectedArticle} selectedId={selectedArticle?.id} />
                    </div>
                    <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                        <ScrollArea className="flex-1">
                            <div className="p-8 max-w-3xl mx-auto">
                                {selectedArticle ? (
                                    <>
                                        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <Badge className="mb-2">{selectedArticle.categoria}</Badge>
                                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{selectedArticle.titulo}</h1>
                                        </div>
                                        <MarkdownRenderer content={selectedArticle.contenido_markdown} />
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 min-h-[400px]">
                                        <BookOpen className="h-16 w-16 opacity-20" />
                                        <p className="text-lg font-medium">Selecciona un artículo para leer</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>
                </TabsContent>

                <TabsContent value="checklist" className="flex-1 overflow-y-auto mt-0">
                    <div className="pb-12">
                        <ChecklistPanel />
                    </div>
                </TabsContent>

                <TabsContent value="docs" className="flex-1 p-8 text-center text-slate-500">
                    <div className="max-w-md mx-auto p-8 border border-dashed border-slate-300 rounded-lg">
                        <p>Documentación técnica en construcción.</p>
                        <p className="text-xs mt-2">Consulte el repositorio para más detalles.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

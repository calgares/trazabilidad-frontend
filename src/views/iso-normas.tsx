import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Database, Activity, FileText, CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";

export function IsoNormasView() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    Normas ISO & Trazabilidad
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Auditoría técnica de cumplimiento de estándares internacionales en el sistema.
                </p>
            </div>

            <Tabs defaultValue="iso9001" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="iso9001">ISO 9001</TabsTrigger>
                    <TabsTrigger value="iso55000">ISO 55000</TabsTrigger>
                    <TabsTrigger value="iso14224">ISO 14224</TabsTrigger>
                    <TabsTrigger value="iso19011">ISO 19011</TabsTrigger>
                </TabsList>

                {/* ISO 9001: Data Integrity */}
                <TabsContent value="iso9001" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Database className="h-5 w-5 text-indigo-500" />
                                        Integridad de Datos (Data Integrity)
                                    </CardTitle>
                                    <CardDescription>Control de información documentada y trazabilidad de cambios.</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">ISO 9001:2015</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <ShieldCheck className="h-4 w-4 text-green-600" />
                                        Audit Logs (Caja Negra)
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                        El sistema implementa una tabla <code>audit_logs</code> inmutable que registra cada transacción crítica.
                                    </p>
                                    <ul className="text-sm list-disc list-inside text-slate-600 dark:text-slate-400">
                                        <li>Registra <strong>Quién</strong> (User ID)</li>
                                        <li>Registra <strong>Qué</strong> (Old Data vs New Data)</li>
                                        <li>Registra <strong>Cuándo</strong> (Timestamp exacto)</li>
                                    </ul>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        Unicidad Global
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Uso forzoso de <strong>UUID v4</strong> para todos los registros (Activos, OTs, Fallas), garantizando que no existan duplicados ni colisiones de datos en todo el sistema.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ISO 55000: Asset Management */}
                <TabsContent value="iso55000" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-blue-500" />
                                        Gestión de Activos (Asset Management)
                                    </CardTitle>
                                    <CardDescription>Ciclo de vida, desempeño y riesgos del activo.</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">ISO 55001</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg bg-white dark:bg-slate-950">
                                <h3 className="font-semibold mb-2">Detección de "Bad Actors"</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    El sistema monitorea activamente la confiabilidad de los equipos mediante reglas automáticas.
                                </p>
                                <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs font-mono text-slate-700 dark:text-slate-300">
                                    {`-- Regla ISO-REL-01 (Automática)
HAVING COUNT(f.id) >= 3 
AND f.fecha_reporte > NOW() - INTERVAL '30 days'`}
                                </div>
                                <div className="mt-3 flex items-start gap-2 text-sm text-amber-600">
                                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                                    <span>Identifica activos que han fallado más de 3 veces en un mes, marcándolos para revisión de causa raíz.</span>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 rounded-lg bg-slate-50 border">
                                    <h4 className="font-medium">Historial de Estados</h4>
                                    <p className="text-sm text-slate-500 mt-1">Bitácora inmutable de cambios (Operativo → Falla) para cálculo de MTBF/MTTR.</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 border">
                                    <h4 className="font-medium">Planes Preventivos</h4>
                                    <p className="text-sm text-slate-500 mt-1">Auditoría automática de equipos críticos sin plan de mantenimiento asignado.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ISO 14224: Fallas */}
                <TabsContent value="iso14224" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                        Recolección de Datos de Confiabilidad
                                    </CardTitle>
                                    <CardDescription>Estandarización de taxonomía de fallas y mantenimiento.</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">ISO 14224</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600">
                                    La estructura de la base de datos sigue el modelo jerárquico de ISO 14224 para asegurar calidad en el dato de falla.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="bg-slate-50 border-0 shadow-sm">
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-sm uppercase text-slate-500">Taxonomía</CardTitle>
                                            <div className="font-mono text-sm font-bold mt-1 text-slate-800">
                                                Modo de Falla <br />
                                                Causa Raíz <br />
                                                Efecto (Severidad)
                                            </div>
                                        </CardHeader>
                                    </Card>
                                    <Card className="bg-slate-50 border-0 shadow-sm">
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-sm uppercase text-slate-500">Jerarquía</CardTitle>
                                            <div className="font-mono text-sm font-bold mt-1 text-slate-800">
                                                Planta <br />
                                                Ubicación <br />
                                                Equipo (Tag) <br />
                                                Componente
                                            </div>
                                        </CardHeader>
                                    </Card>
                                    <Card className="bg-slate-50 border-0 shadow-sm">
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-sm uppercase text-slate-500">Prioridad</CardTitle>
                                            <div className="font-mono text-sm font-bold mt-1 text-slate-800">
                                                Crítica (Inmediata) <br />
                                                Alta (24h) <br />
                                                Media/Baja
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ISO 19011: Auditoría */}
                <TabsContent value="iso19011" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-teal-500" />
                                        Evidencia Objetiva
                                    </CardTitle>
                                    <CardDescription>Directrices para la auditoría de sistemas de gestión.</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50">ISO 19011</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <h4 className="text-lg font-medium mb-2">Cadena de Custodia</h4>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Cada Orden de Trabajo (OT) requiere firmas digitales para validación, asegurando que el proceso fue ejecutado y validado por personal calificado.
                                    </p>
                                    <div className="flex gap-2">
                                        <Badge variant="secondary">Firma Técnico</Badge>
                                        <Badge variant="secondary">Firma Supervisor</Badge>
                                    </div>
                                </div>
                                <div className="flex-1 border-l pl-6">
                                    <h4 className="text-lg font-medium mb-2">Evidencia Digital</h4>
                                    <p className="text-sm text-slate-600 mb-4">
                                        La tabla <code>work_order_evidences</code> permite adjuntar fotos y documentos técnicos directamente a la OT, creando prueba irrefutable de la ejecución.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

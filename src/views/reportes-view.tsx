import { useState, useEffect } from "react";
import { useReportes, type ReportType } from "@/hooks/use-reportes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileSpreadsheet, Filter } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function ReportesView() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Centro de Reportes</h1>
                <p className="text-slate-500 dark:text-slate-400">Generación y exportación de datos operativos.</p>
            </div>

            <Tabs defaultValue="EQUIPOS" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="EQUIPOS">Equipos y Estado</TabsTrigger>
                    <TabsTrigger value="FALLAS">Historial de Fallas</TabsTrigger>
                    <TabsTrigger value="PREVENTIVOS">Mantenimiento Preventivo</TabsTrigger>
                </TabsList>

                <TabsContent value="EQUIPOS">
                    <GenericReportPanel type="EQUIPOS" title="Inventario de Equipos" description="Listado maestro con estado actual, ubicación y asignación." />
                </TabsContent>

                <TabsContent value="FALLAS">
                    <GenericReportPanel type="FALLAS" title="Reporte de Fallas" description="Historial de incidentes reportados." />
                </TabsContent>

                <TabsContent value="PREVENTIVOS">
                    <GenericReportPanel type="PREVENTIVOS" title="Cumplimiento Preventivo" description="Estado de los programas de mantenimiento." />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function GenericReportPanel({ type, title, description }: { type: ReportType, title: string, description: string }) {
    const { data, loading, error, fetchReporte, exportarCSV } = useReportes();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("TODOS");

    useEffect(() => {
        fetchReporte(type);
    }, [type, fetchReporte]);

    // Client-side filtering logic setup
    const filteredData = data.filter(item => {
        const matchesSearch = JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (filterStatus !== 'TODOS') {
            if (type === 'EQUIPOS') matchesStatus = item.estado_operativo === filterStatus;
            if (type === 'FALLAS') matchesStatus = item.estado_falla === filterStatus;
            if (type === 'PREVENTIVOS') matchesStatus = item.estado_alerta === filterStatus;
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => exportarCSV(title)} disabled={loading || filteredData.length === 0}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar a Excel (CSV)
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters Toolbar */}
                <div className="flex gap-4 mb-6">
                    <div className="relative w-full md:w-64">
                        <Input
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Dynamic Status Filter */}
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4 text-slate-500" />
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODOS">Todos los Estados</SelectItem>
                            {type === 'EQUIPOS' && (
                                <>
                                    <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                                    <SelectItem value="EN_OPERACION">En Operación</SelectItem>
                                    <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                                </>
                            )}
                            {type === 'FALLAS' && (
                                <>
                                    <SelectItem value="ABIERTA">Abierta</SelectItem>
                                    <SelectItem value="RESUELTA">Resuelta</SelectItem>
                                </>
                            )}
                            {type === 'PREVENTIVOS' && (
                                <>
                                    <SelectItem value="OK">Al Día (OK)</SelectItem>
                                    <SelectItem value="POR_VENCER">Por Vencer</SelectItem>
                                    <SelectItem value="VENCIDO">Vencido</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-slate-300" /></div>
                ) : error ? (
                    <div className="text-red-500">Error: {error}</div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {/* Dynamic Headers based on type */}
                                    {type === 'EQUIPOS' && (
                                        <>
                                            <TableHead>Equipo</TableHead>
                                            <TableHead>Marca/Modelo</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Ubicación</TableHead>
                                            <TableHead>Asignación Actual</TableHead>
                                        </>
                                    )}
                                    {type === 'FALLAS' && (
                                        <>
                                            <TableHead>Fecha Reporte</TableHead>
                                            <TableHead>Equipo</TableHead>
                                            <TableHead>Falla</TableHead>
                                            <TableHead>Severidad</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Reportado Por</TableHead>
                                        </>
                                    )}
                                    {type === 'PREVENTIVOS' && (
                                        <>
                                            <TableHead>Equipo</TableHead>
                                            <TableHead>Programa</TableHead>
                                            <TableHead>Tipo Frecuencia</TableHead>
                                            <TableHead>Restante</TableHead>
                                            <TableHead>Estado Alerta</TableHead>
                                        </>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((row, i) => (
                                    <TableRow key={i}>
                                        {type === 'EQUIPOS' && (
                                            <>
                                                <TableCell className="font-medium">{row.equipo} <span className="text-xs text-slate-400">({row.codigo_interno})</span></TableCell>
                                                <TableCell>{row.marca} {row.modelo}</TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        row.estado_operativo === 'DISPONIBLE' ? 'bg-green-500 text-white hover:bg-green-600' :
                                                            row.estado_operativo === 'EN_OPERACION' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                                                                row.estado_operativo === 'EN_MANTENIMIENTO' ? 'bg-yellow-500 text-black hover:bg-yellow-600' :
                                                                    row.estado_operativo === 'FUERA_DE_SERVICIO' ? 'bg-red-500 text-white hover:bg-red-600' :
                                                                        'bg-slate-500 text-white'
                                                    }>
                                                        {row.estado_operativo}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{row.ubicacion_actual || '-'}</TableCell>
                                                <TableCell>
                                                    {row.responsable_actual ? (
                                                        <div className="text-sm">
                                                            <div className="font-medium">{row.responsable_actual}</div>
                                                            <div className="text-xs text-slate-500">{row.proyecto_actual}</div>
                                                        </div>
                                                    ) : <span className="text-slate-400 italic">No asignado</span>}
                                                </TableCell>
                                            </>
                                        )}
                                        {type === 'FALLAS' && (
                                            <>
                                                <TableCell className="font-mono text-xs">{format(new Date(row.fecha_reporte), "dd/MM/yyyy HH:mm")}</TableCell>
                                                <TableCell>{row.equipo}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{row.tipo_falla}</div>
                                                    <div className="text-xs text-slate-500 truncate max-w-[200px]" title={row.descripcion}>{row.descripcion}</div>
                                                </TableCell>
                                                <TableCell><Badge variant={row.severidad === 'ALTA' ? 'destructive' : 'outline'}>{row.severidad}</Badge></TableCell>
                                                <TableCell>{row.estado_falla}</TableCell>
                                                <TableCell>{row.reportado_por}</TableCell>
                                            </>
                                        )}
                                        {type === 'PREVENTIVOS' && (
                                            <>
                                                <TableCell>{row.equipo}</TableCell>
                                                <TableCell>{row.titulo}</TableCell>
                                                <TableCell>{row.frecuencia_tipo}</TableCell>
                                                <TableCell className="font-mono font-bold">{row.unidades_restantes} <span className="text-[10px] font-normal text-slate-400">unid/días</span></TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        row.estado_alerta === 'VENCIDO' ? 'bg-red-500' :
                                                            row.estado_alerta === 'POR_VENCER' ? 'bg-amber-500' : 'bg-green-500'
                                                    }>
                                                        {row.estado_alerta}
                                                    </Badge>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                                {filteredData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">No se encontraron resultados.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

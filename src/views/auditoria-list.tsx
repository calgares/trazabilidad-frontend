import { useState } from 'react';
import { useAudit } from "@/hooks/use-audit";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Database, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function AuditoriaList() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    const { logs, loading, error, totalCount } = useAudit();

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>Error al cargar registros de auditoría: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Registro de Auditoría</h2>
                    <p className="text-slate-500 dark:text-slate-400">Rastreo detallado de todos los cambios en el sistema.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    <Database className="h-4 w-4" />
                    <span>Total eventos: {totalCount}</span>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                <TableRow>
                                    <TableHead className="w-[180px]">Fecha / Hora</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Tabla Afectada</TableHead>
                                    <TableHead>Campo</TableHead>
                                    <TableHead className="max-w-[200px] truncate">Valor Anterior</TableHead>
                                    <TableHead className="max-w-[200px] truncate">Valor Nuevo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500 italic font-light">
                                            No hay registros de auditoría disponibles para esta página.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 text-sm">
                                            <TableCell className="font-mono text-xs text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(log.fecha), "dd MMM yyyy HH:mm", { locale: es })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                        {log.usuario?.nombre?.substring(0, 1) || 'S'}{log.usuario?.apellido?.substring(0, 1) || 'Y'}
                                                    </div>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                                        {log.usuario?.nombre ? `${log.usuario.nombre} ${log.usuario.apellido}` : 'Sistema / Desconocido'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-xs uppercase bg-slate-50 dark:bg-slate-900">
                                                    {log.tabla_afectada}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400">
                                                {log.campo}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate font-mono text-xs text-red-600/70 dark:text-red-400/70 bg-red-50/50 dark:bg-red-900/10 p-2 rounded">
                                                {log.valor_anterior || 'NULL'}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate font-mono text-xs text-green-600/70 dark:text-green-400/70 bg-green-50/50 dark:bg-green-900/10 p-2 rounded">
                                                {log.valor_nuevo || 'NULL'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                        Mostrando eventos recientes (Página {currentPage})
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm font-medium">
                            Página {currentPage} de {Math.max(1, Math.ceil(totalCount / pageSize))}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, AlertCircle, Database, Clock, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function AuditoriaList() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    // Filters
    const [filterType, setFilterType] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const { logs, loading, error, totalCount, fetchLogs } = useAudit();

    // Fetch on change
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchLogs({
                page: currentPage,
                limit: pageSize,
                type: filterType || undefined,
                userId: filterUser || undefined,
                from: dateFrom || undefined,
                to: dateTo || undefined
            });
        }, 300); // Debounce
        return () => clearTimeout(timeout);
    }, [currentPage, filterType, filterUser, dateFrom, dateTo, fetchLogs, pageSize]);

    // Auto-refresh (Polling) every 10s
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLogs({
                page: currentPage,
                limit: pageSize,
                type: filterType || undefined,
                userId: filterUser || undefined,
                from: dateFrom || undefined,
                to: dateTo || undefined
            });
        }, 10000);
        return () => clearInterval(interval);
    }, [currentPage, filterType, filterUser, dateFrom, dateTo, fetchLogs, pageSize]);


    const getActionColor = (action: string) => {
        if (action.includes('CREATED')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (action.includes('UPDATED')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        if (action.includes('DELETED') || action.includes('DECOMMISSIONED')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    };

    // Helper to format action names
    const formatAction = (action: string) => {
        const map: Record<string, string> = {
            'EQUIPMENT_CREATED': '✨ Equipo Creado',
            'EQUIPMENT_UPDATED': '✏️ Equipo Actualizado',
            'EQUIPMENT_DECOMMISSIONED': '🗑️ Equipo Dado de Baja',
            'WORK_ORDER_SIGNED': '✍️ Orden Firmada',
            'MAINTENANCE_CREATED': '🔧 Mantenimiento Creado',
            'LOCATION_CREATED': '📍 Ubicación Creada',
            'LOCATION_UPDATED': '📍 Ubicación Actualizada',
            'FAILURE_CREATED': '⚠️ Falla Registrada',
            'FAILURE_RESOLVED': '✅ Falla Resuelta',
            'PREVENTIVE_CREATED': '📅 Preventivo Creado',
            'PREVENTIVE_DELETED': '📅 Preventivo Eliminado',
        };
        return map[action] || action;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Monitor de Auditoría (VIVO)</h2>
                    <p className="text-slate-500 dark:text-slate-400">Visibilidad en tiempo real de eventos del sistema.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-900">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Polling Active
                </div>
            </div>

            {/* Filters */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Tipo de Evento</label>
                        <Input
                            placeholder="Ej. CREATE, UPDATE..."
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">ID Usuario</label>
                        <Input
                            placeholder="UUID Usuario..."
                            value={filterUser}
                            onChange={e => setFilterUser(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">📅 Fecha Desde</label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">📅 Fecha Hasta</label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead className="w-[180px]">Fecha / Hora</TableHead>
                                    <TableHead>Evento</TableHead>
                                    <TableHead>Entidad</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500 italic">
                                            No hay eventos registrados con estos filtros.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 text-sm group">
                                            <TableCell>
                                                <Database className="h-4 w-4 text-slate-400" />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                                                {format(new Date(log.created_at), "dd MMM HH:mm:ss", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`font-mono text-[10px] ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{log.entity_type}</span>
                                                <span className="text-slate-400 mx-1">#</span>
                                                <span className="text-slate-500">{log.entity_id}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                        {(log.user_nombre || '?')[0]}{(log.user_apellido || '?')[0]}
                                                    </div>
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                                        {log.user_nombre ? `${log.user_nombre}` : 'Sistema'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedLog(log)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Eye className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                        Total: {totalCount} eventos
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={logs.length < pageSize} // Simple check if last page
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Details Modal */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-[700px] border-slate-200 dark:border-slate-800 p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <DialogTitle className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getActionColor(selectedLog?.action || '')}`}>
                                {selectedLog?.action?.includes('CREATED') && '✨'}
                                {selectedLog?.action?.includes('UPDATED') && '✏️'}
                                {selectedLog?.action?.includes('DECOMMISSIONED') && '🗑️'}
                                {selectedLog?.action?.includes('SIGNED') && '✍️'}
                                {!selectedLog?.action?.includes('CREATED') && !selectedLog?.action?.includes('UPDATED') && !selectedLog?.action?.includes('DECOMMISSIONED') && !selectedLog?.action?.includes('SIGNED') && '📋'}
                            </div>
                            <div>
                                <span className="text-lg">{formatAction(selectedLog?.action || '')}</span>
                                <p className="font-mono text-xs text-slate-500 mt-1">ID: {selectedLog?.id}</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="p-6 space-y-6">
                            {/* Main Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Entidad</span>
                                    <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{selectedLog.entity_type}</p>
                                    <p className="font-mono text-xs text-slate-500 mt-1">#{selectedLog.entity_id}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Fecha y Hora</span>
                                    <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{format(new Date(selectedLog.created_at), "dd 'de' MMMM, yyyy", { locale: es })}</p>
                                    <p className="font-mono text-xs text-slate-500 mt-1">{format(new Date(selectedLog.created_at), "HH:mm:ss", { locale: es })}</p>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                                <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">👤 Usuario Responsable</span>
                                <p className="mt-2 font-semibold text-blue-700 dark:text-blue-300 text-lg">
                                    {selectedLog.user_nombre ? `${selectedLog.user_nombre} ${selectedLog.user_apellido || ''}` : 'Sistema (Automático)'}
                                </p>
                                {selectedLog.user_email && <p className="text-sm text-blue-600 dark:text-blue-400">{selectedLog.user_email}</p>}
                                {selectedLog.user_id && <p className="font-mono text-xs text-blue-400 mt-1">ID: {selectedLog.user_id}</p>}
                            </div>

                            {/* Changes Details */}
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-3">📝 Detalles del Cambio</span>
                                {selectedLog.details && typeof selectedLog.details === 'object' ? (
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                                        {Object.entries(selectedLog.details.changes || selectedLog.details).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[300px] truncate text-right">
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value || '-')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-md bg-slate-950 p-4 overflow-auto max-h-[200px]">
                                        <pre className="text-xs text-green-400 font-mono">
                                            {JSON.stringify(selectedLog.details, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

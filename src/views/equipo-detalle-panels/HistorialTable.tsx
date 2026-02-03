import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEquipoHistorial } from "@/hooks/use-equipo-historial";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HistorialTableProps {
    equipoId: string;
}

export function HistorialTable({ equipoId }: HistorialTableProps) {
    const { historial, loading, error } = useEquipoHistorial(equipoId);

    if (loading) return <div className="py-4 text-center"><Loader2 className="animate-spin h-5 w-5 mx-auto text-blue-500" /></div>;
    if (error) return <div className="text-red-500 text-sm">Error: {error}</div>;
    if (historial.length === 0) return <div className="text-slate-500 text-sm italic py-4 text-center">No hay historial de cambios de estado disponible.</div>;

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                    <TableRow>
                        <TableHead className="w-[150px]">Fecha</TableHead>
                        <TableHead>Estado Anterior</TableHead>
                        <TableHead>Nuevo Estado</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead className="text-right">Usuario</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {historial.map((h) => (
                        <TableRow key={h.id}>
                            <TableCell className="text-xs font-mono">
                                {format(new Date(h.fecha_cambio), "dd/MM/yyyy HH:mm")}
                            </TableCell>
                            <TableCell>
                                {h.estado_anterior ? (
                                    <Badge variant="outline" className="text-[10px] text-slate-500">
                                        {h.estado_anterior}
                                    </Badge>
                                ) : (
                                    <span className="text-slate-400 text-xs">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge className={cn(
                                    "px-2 py-0.5 text-[10px] font-bold shadow-none",
                                    h.estado_nuevo === 'DISPONIBLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' :
                                        h.estado_nuevo === 'EN_OPERACION' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                                            h.estado_nuevo === 'EN_MANTENIMIENTO' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' :
                                                h.estado_nuevo === 'FUERA_DE_SERVICIO' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800' :
                                                    'bg-slate-100 text-slate-700'
                                )}>
                                    {h.estado_nuevo.replace(/_/g, ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                                {h.motivo || <span className="text-slate-400 italic">Sin motivo especificado</span>}
                            </TableCell>
                            <TableCell className="text-sm">
                                {h.latitud && h.longitud ? (
                                    <a
                                        href={`https://www.google.com/maps?q=${h.latitud},${h.longitud}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                    >
                                        <span className="text-xs">📍 Ver en mapa</span>
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                                {h.usuario_nombre ? (
                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                        {h.usuario_nombre} {h.usuario_apellido}
                                    </span>
                                ) : (
                                    <span className="italic text-slate-400">Sistema</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

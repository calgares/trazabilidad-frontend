import { useHistorialDiario } from "@/hooks/use-historial-diario";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Loader2, AlertCircle, Calendar, Wrench, AlertTriangle, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function HistorialDiario() {
    const { history, loading, error } = useHistorialDiario();

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
                <p>Error al cargar historial: {error}</p>
            </div>
        );
    }

    // Calculate stats for cards
    const totalMts = history.filter(h => h.tipo === 'mantenimiento').length;
    const totalFails = history.filter(h => h.tipo === 'falla').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Historial de Actividad</h2>
                    <p className="text-slate-500 dark:text-slate-400">Registro cronológico de movimientos, mantenimientos y eventos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Mantenimientos (30d)</p>
                                <h3 className="text-3xl font-bold mt-1">{totalMts}</h3>
                            </div>
                            <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Wrench className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-600 text-white border-0 shadow-lg shadow-red-500/20">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Fallas Reportadas (30d)</p>
                                <h3 className="text-3xl font-bold mt-1">{totalFails}</h3>
                            </div>
                            <div className="h-10 w-10 bg-red-500 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Eficiencia Operativa</p>
                                <h3 className="text-3xl font-bold mt-1">98.5%</h3>
                            </div>
                            <div className="h-10 w-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            <span className="text-green-400 font-bold">↑ 2.1%</span> vs mes anterior
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>Bitácora de Eventos</CardTitle>
                    <CardDescription>Movimientos detallados y ubicación (GPS).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900">
                                <TableRow>
                                    <TableHead>Fecha / Hora</TableHead>
                                    <TableHead>Equipo</TableHead>
                                    <TableHead>Tipo de Evento</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead>Usuario</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500 italic">
                                            No hay actividad reciente registrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((record) => (
                                        <TableRow key={`${record.tipo}-${record.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <TableCell className="text-xs font-mono">
                                                <div className="font-bold">{format(parseISO(record.fecha), "dd/MM/yyyy", { locale: es })}</div>
                                                <div className="text-slate-500">{format(parseISO(record.fecha), "HH:mm a")}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">{record.equipo_nombre}</div>
                                                <div className="text-xs text-slate-500">{record.equipo_codigo}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border ${record.tipo === 'mantenimiento' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    record.tipo === 'falla' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                    {record.tipo === 'mantenimiento' && <Wrench className="h-3 w-3 mr-1" />}
                                                    {record.tipo === 'falla' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                                    {record.tipo === 'movimiento' && <TrendingUp className="h-3 w-3 mr-1" />}
                                                    {record.tipo.toUpperCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-sm text-slate-600">
                                                {record.descripcion}
                                            </TableCell>
                                            <TableCell>
                                                {record.latitud && record.longitud ? (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${record.latitud},${record.longitud}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-xs"
                                                    >
                                                        <span>📍 Ver mapa</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {record.usuario_nombre || 'Sistema'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

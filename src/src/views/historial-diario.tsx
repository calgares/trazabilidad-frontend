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

    // Calculate trends
    const totalMts = history.reduce((acc, curr) => acc + curr.total_mantenimientos, 0);
    const totalFails = history.reduce((acc, curr) => acc + curr.total_fallas, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Historial Diario</h2>
                    <p className="text-slate-500 dark:text-slate-400">Resumen ejecutivo de actividades diarias (Últimos 30 días).</p>
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
                    <CardTitle>Registro Detallado</CardTitle>
                    <CardDescription>Desglose por fecha de eventos registrados automáticamente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900">
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-center">Mantenimientos</TableHead>
                                    <TableHead className="text-center">Fallas</TableHead>
                                    <TableHead>Estado del Día</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-500 italic">
                                            No hay historial de actividad reciente.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((record) => (
                                        <TableRow key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <TableCell className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                {format(parseISO(record.fecha), "dd MMMM yyyy", { locale: es })}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.total_mantenimientos > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {record.total_mantenimientos}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.total_fallas > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {record.total_fallas}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {record.total_fallas === 0 ? (
                                                    <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1 font-medium">
                                                        <TrendingUp className="h-3 w-3" /> Operación Normal
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1 font-medium">
                                                        <AlertTriangle className="h-3 w-3" /> Incidentes Reportados
                                                    </span>
                                                )}
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

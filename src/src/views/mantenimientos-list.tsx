import { useMantenimientos } from "@/hooks/use-mantenimientos";
import { Link } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, AlertCircle, Calendar } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function MantenimientosList() {
    const { mantenimientos, loading, error } = useMantenimientos();

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p>Error al cargar el historial de mantenimientos: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Historial de Mantenimientos</h2>
                    <p className="text-slate-500 dark:text-slate-400">Consulta y gestiona todas las intervenciones técnicas realizadas.</p>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Buscar por equipo o descripción..."
                                className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            />
                        </div>
                        <Button variant="outline" className="border-slate-200 dark:border-slate-800">
                            <Filter className="mr-2 h-4 w-4" /> Filtros
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900">
                                <TableRow>
                                    <TableHead className="font-semibold">Fecha</TableHead>
                                    <TableHead className="font-semibold">Equipo</TableHead>
                                    <TableHead className="font-semibold">Tipo</TableHead>
                                    <TableHead className="font-semibold">Descripción</TableHead>
                                    <TableHead className="font-semibold">Costo</TableHead>
                                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mantenimientos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No hay registros de mantenimiento.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    mantenimientos.map((m) => (
                                        <TableRow key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                                    {format(new Date(m.fecha_inicio), "dd/MM/yyyy", { locale: es })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{m.equipos?.nombre}</span>
                                                    <span className="text-xs text-slate-500 font-mono">{m.equipos?.codigo_unico}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {m.tipo_mantenimiento}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate">
                                                {m.descripcion}
                                            </TableCell>
                                            <TableCell>
                                                ${m.costo_estimado?.toLocaleString() || '0.00'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link to={`/equipos/${m.equipo_id}`}>Ver Equipo</Link>
                                                </Button>
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

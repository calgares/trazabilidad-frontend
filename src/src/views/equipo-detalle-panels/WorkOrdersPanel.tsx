import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Briefcase, Loader2 } from "lucide-react";
import { useWorkOrders, type WorkOrder } from "@/hooks/use-work-orders";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface WorkOrdersPanelProps {
    equipoId: string;
}

export function WorkOrdersPanel({ equipoId }: WorkOrdersPanelProps) {
    const { getWorkOrdersByEquipo } = useWorkOrders();
    const [ots, setOts] = useState<WorkOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const data = await getWorkOrdersByEquipo(equipoId);
            setOts(data);
            setIsLoading(false);
        };
        load();
    }, [equipoId]);

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Órdenes de Trabajo</CardTitle>
                            <CardDescription>Mantenimiento correctivo y preventivo asociado.</CardDescription>
                        </div>
                        <Button onClick={() => navigate('/work-orders/new')} className="bg-indigo-600 hover:bg-indigo-700">
                            <Briefcase className="mr-2 h-4 w-4" /> Crear Nueva OT
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-6"><Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-500" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Folio</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Prioridad</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ots.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                                            No hay órdenes de trabajo registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ots.map(ot => (
                                        <TableRow key={ot.id}>
                                            <TableCell className="font-mono font-medium">{ot.numero_ot}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{ot.estado.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={ot.prioridad === 'CRITICA' ? 'destructive' : 'secondary'}>{ot.prioridad}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={ot.descripcion_problema}>
                                                {ot.descripcion_problema}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {format(new Date(ot.created_at), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost" onClick={() => navigate(`/work-orders/${ot.id}`)}>
                                                    Ver
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

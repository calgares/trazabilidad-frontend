import { useState, useEffect } from 'react';
import { useWorkOrders, type WorkOrder } from '@/hooks/use-work-orders';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Briefcase, Calendar, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function WorkOrdersListView() {
    const { getWorkOrders, loading } = useWorkOrders();
    const [orders, setOrders] = useState<WorkOrder[]>([]);
    const [filterEstado, setFilterEstado] = useState<string>('ALL');
    const [filterPrioridad, setFilterPrioridad] = useState<string>('ALL');
    const navigate = useNavigate();

    // Load Data
    useEffect(() => {
        loadData();
    }, [filterEstado, filterPrioridad]);

    const loadData = async () => {
        const filters: any = {};
        if (filterEstado !== 'ALL') filters.estado = filterEstado;
        if (filterPrioridad !== 'ALL') filters.prioridad = filterPrioridad;

        const data = await getWorkOrders(filters);
        setOrders(data);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CREADA': return 'bg-slate-100 text-slate-700';
            case 'ASIGNADA': return 'bg-blue-100 text-blue-700';
            case 'EN_PROCESO': return 'bg-yellow-100 text-yellow-800';
            case 'TERMINADA': return 'bg-green-100 text-green-700';
            case 'CANCELADA': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'CRITICA': return 'default'; // Red/Black usually
            case 'ALTA': return 'destructive';
            case 'MEDIA': return 'outline';
            case 'BAJA': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <Briefcase className="h-8 w-8 text-indigo-600" />
                        Órdenes de Trabajo
                    </h1>
                    <p className="text-slate-500 mt-2">Gestión y seguimiento de mantenimiento correctivo y preventivo.</p>
                </div>
                <Button onClick={() => navigate('/work-orders/new')} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" /> Nueva OT
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-4 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Estado</label>
                        <Select value={filterEstado} onValueChange={setFilterEstado}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos</SelectItem>
                                <SelectItem value="CREADA">Creada</SelectItem>
                                <SelectItem value="ASIGNADA">Asignada</SelectItem>
                                <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                                <SelectItem value="TERMINADA">Terminada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Prioridad</label>
                        <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todas</SelectItem>
                                <SelectItem value="CRITICA">Crítica</SelectItem>
                                <SelectItem value="ALTA">Alta</SelectItem>
                                <SelectItem value="MEDIA">Media</SelectItem>
                                <SelectItem value="BAJA">Baja</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-none">
                        <Button variant="outline" size="icon" onClick={loadData} title="Refrescar">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Folio</TableHead>
                                <TableHead>Equipo</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Prioridad</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Asignado A</TableHead>
                                <TableHead>Fecha Prog.</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                                        Cargando órdenes...
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                                        No se encontraron órdenes de trabajo.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((ot) => (
                                    <TableRow key={ot.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 cursor-pointer" onClick={() => navigate(`/work-orders/${ot.id}`)}>
                                        <TableCell className="font-mono font-medium">{ot.numero_ot}</TableCell>
                                        <TableCell>{ot.equipos?.nombre || 'S/N'}</TableCell>
                                        <TableCell className="max-w-[200px] truncate text-slate-500" title={ot.descripcion_problema}>
                                            {ot.descripcion_problema}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getPriorityBadge(ot.prioridad) as any}>{ot.prioridad}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn("border-0", getStatusColor(ot.estado))}>
                                                {ot.estado.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {ot.perfiles?.nombre || ot.tecnico_externo || <span className="text-slate-400 italic">No asignado</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {ot.fecha_programada ? (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(ot.fecha_programada), 'dd/MM/yyyy')}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                                <Link to={`/work-orders/${ot.id}`}>Ver</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}

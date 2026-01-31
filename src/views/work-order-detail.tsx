import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkOrders } from '@/hooks/use-work-orders';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EvidenceUploader } from "@/components/work-orders/EvidenceUploader";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Play, Pause, CheckCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorkOrderDetailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getWorkOrderById, updateWorkOrder, addTask, toggleTask, loading } = useWorkOrders();

    const [ot, setOt] = useState<any | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [_evidences, setEvidences] = useState<any[]>([]);
    const [_isRefreshing, setIsRefreshing] = useState(false);

    const [newTask, setNewTask] = useState("");

    const refreshData = async () => {
        if (!id) return;

        setIsRefreshing(true);

        const data = await getWorkOrderById(id, true);

        if (data) {
            setOt(data.ot);
            setTasks(data.tasks || []);
            setEvidences(data.evidences || []);
        }

        setIsRefreshing(false);
    };

    useEffect(() => {
        refreshData();
    }, [id]);

    const handleStatusChange = async (newStatus: any) => {
        if (!id || !ot) return;

        try {
            const updates: any = { estado: newStatus };

            if (newStatus === 'EN_PROCESO' && !ot.fecha_inicio) {
                updates.fecha_inicio = new Date().toISOString();
            }

            if (newStatus === 'TERMINADA') {
                updates.fecha_fin = new Date().toISOString();
            }

            await updateWorkOrder(id, updates);
            refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTask = async () => {
        if (!id || !newTask.trim()) return;

        try {
            await addTask(null, {
                work_order_id: id,
                descripcion: newTask,
                orden: tasks.length + 1
            });

            setNewTask("");
            refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    if (!ot && loading) {
        return <div className="p-10 text-center">Cargando...</div>;
    }

    if (!ot) {
        return <div className="p-10 text-center text-red-500">Orden no encontrada</div>;
    }

    const isEditable = ot.estado !== 'TERMINADA' && ot.estado !== 'CANCELADA';

    return (
        <div className="container mx-auto p-4 max-w-5xl space-y-6">
            <Button
                variant="ghost"
                onClick={() => navigate('/work-orders')}
                className="mb-2"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg border shadow-sm">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold font-mono">{ot.numero_ot}</h1>

                        <Badge>
                            {ot.estado}
                        </Badge>
                    </div>

                    <h2 className="text-xl font-semibold">
                        {ot.equipos?.nombre}
                    </h2>

                    <p className="text-slate-500">
                        {ot.descripcion_problema}
                    </p>
                </div>

                <div className="flex gap-2">
                    {(ot.estado === 'ASIGNADA' || ot.estado === 'CREADA') && (
                        <Button onClick={() => handleStatusChange('EN_PROCESO')}>
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Trabajo
                        </Button>
                    )}

                    {ot.estado === 'EN_PROCESO' && (
                        <>
                            <Button onClick={() => handleStatusChange('PAUSADA')}>
                                <Pause className="h-4 w-4 mr-2" />
                                Pausar
                            </Button>

                            <Button onClick={() => handleStatusChange('TERMINADA')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Finalizar
                            </Button>
                        </>
                    )}

                    {ot.estado === 'PAUSADA' && (
                        <Button onClick={() => handleStatusChange('EN_PROCESO')}>
                            <Play className="h-4 w-4 mr-2" />
                            Reanudar Trabajo
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="tasks">
                <TabsList>
                    <TabsTrigger value="tasks">
                        Checklist
                    </TabsTrigger>

                    <TabsTrigger value="evidence">
                        Evidencias
                    </TabsTrigger>

                    <TabsTrigger value="info">
                        Detalles
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="p-4">
                    {isEditable && (
                        <div className="flex gap-2 mb-6">
                            <Input
                                placeholder="Nueva tarea..."
                                value={newTask}
                                onChange={e => setNewTask(e.target.value)}
                            />

                            <Button onClick={handleAddTask}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 mb-2">
                            <Checkbox
                                checked={task.completado}
                                onCheckedChange={(checked) =>
                                    toggleTask(task.id, !!checked).then(refreshData)
                                }
                                disabled={!isEditable}
                            />

                            <span className={cn(task.completado && "line-through")}>
                                {task.descripcion}
                            </span>
                        </div>
                    ))}
                </TabsContent>

                <TabsContent value="evidence">
                    <EvidenceUploader
                        workOrderId={id!}
                        readOnly={!isEditable}
                    />
                </TabsContent>

                <TabsContent value="info">
                    <p><strong>Prioridad:</strong> {ot.prioridad}</p>
                    <p><strong>Origen:</strong> {ot.origen}</p>
                </TabsContent>
            </Tabs>
        </div>
    );
}

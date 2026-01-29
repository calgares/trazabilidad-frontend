import { useState, useEffect } from "react";
import { CalendarClock, Loader2, Edit, Trash2, CheckCircle, Activity } from "lucide-react";
import { usePreventivos, type ProgramaMantenimiento } from "@/hooks/use-preventivos";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PreventivosPanelProps {
    equipoId: string;
    lecturaActual: number;
}

type FrecuenciaTipo = "HORAS" | "KILOMETROS" | "FECHA";

export function PreventivosPanel({ equipoId, lecturaActual }: PreventivosPanelProps) {
    const { programas, loading, error, refresh, guardarPrograma, eliminarPrograma, registrarMantenimientoRealizado } = usePreventivos(equipoId, lecturaActual);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProg, setEditingProg] = useState<ProgramaMantenimiento | null>(null);

    // Form state
    const [titulo, setTitulo] = useState("");
    const [frecuenciaTipo, setFrecuenciaTipo] = useState<FrecuenciaTipo>("HORAS");
    const [frecuenciaValor, setFrecuenciaValor] = useState(0);
    const [alertaAnticipacion, setAlertaAnticipacion] = useState(0);

    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (editingProg) {
            setTitulo(editingProg.titulo);
            setFrecuenciaTipo(editingProg.frecuencia_tipo as FrecuenciaTipo);
            setFrecuenciaValor(editingProg.frecuencia_valor);
            setAlertaAnticipacion(editingProg.alerta_anticipacion);
            setIsModalOpen(true);
        } else {
            setTitulo("");
            setFrecuenciaTipo("HORAS");
            setFrecuenciaValor(0);
            setAlertaAnticipacion(0);
        }
    }, [editingProg]);

    const handleSave = async () => {
        if (!titulo || frecuenciaValor <= 0) {
            alert("Título y Valor de Frecuencia son obligatorios");
            return;
        }

        setActionLoading(true);

        const payload: {
            titulo: string;
            frecuencia_tipo: FrecuenciaTipo;
            frecuencia_valor: number;
            alerta_anticipacion: number;
            equipo_id: string;
            id?: string;
            fecha_ultima_realizacion?: string;
            valor_ultima_realizacion?: number;
        } = {
            titulo,
            frecuencia_tipo: frecuenciaTipo,
            frecuencia_valor: frecuenciaValor,
            alerta_anticipacion: alertaAnticipacion,
            equipo_id: equipoId
        };
        if (editingProg) payload.id = editingProg.id;

        if (!editingProg) {
            if (frecuenciaTipo === 'FECHA') {
                payload.fecha_ultima_realizacion = new Date().toISOString();
            } else {
                payload.valor_ultima_realizacion = lecturaActual;
            }
        }

        const result = await guardarPrograma(payload);
        setActionLoading(false);

        if (result.success) {
            setIsModalOpen(false);
            setEditingProg(null);
            refresh();
        } else {
            alert("Error: " + result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este programa?")) return;
        await eliminarPrograma(id);
    };

    const handleReset = async (id: string) => {
        if (!confirm("¿Confirmar que se realizó este mantenimiento? Esto reiniciará el contador del programa.")) return;
        await registrarMantenimientoRealizado(id, lecturaActual, new Date());
    };

    if (loading) return <div className="py-4 text-center"><Loader2 className="animate-spin h-5 w-5 mx-auto text-blue-500" /></div>;
    if (error) return <div className="text-red-500 text-sm">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Programas de Mantenimiento</CardTitle>
                            <CardDescription>Configure alertas automáticas por uso o tiempo.</CardDescription>
                        </div>
                        <Button onClick={() => { setEditingProg(null); setIsModalOpen(true); }} className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900">
                            <CalendarClock className="mr-2 h-4 w-4" /> Nuevo Programa
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingProg ? "Editar Programa" : "Nuevo Programa Preventivo"}</DialogTitle>
                        <DialogDescription>
                            Defina cuándo debe realizarse el servicio.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Título del Servicio</Label>
                            <Input placeholder="Ej. Cambio de Aceite Motor" value={titulo} onChange={e => setTitulo(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo Frecuencia</Label>
                                <Select value={frecuenciaTipo} onValueChange={(val: FrecuenciaTipo) => setFrecuenciaTipo(val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HORAS">Horas de Uso</SelectItem>
                                        <SelectItem value="KILOMETROS">Kilómetros</SelectItem>
                                        <SelectItem value="FECHA">Días (Calendario)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Intervalo</Label>
                                <div className="relative">
                                    <Input type="number" value={frecuenciaValor} onChange={e => setFrecuenciaValor(Number(e.target.value))} className="pl-8" />
                                    <div className="absolute left-2.5 top-2.5 text-slate-400">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Alerta Anticipada (Antes de...)</Label>
                            <Input type="number" value={alertaAnticipacion} onChange={e => setAlertaAnticipacion(Number(e.target.value))} />
                            <p className="text-[10px] text-slate-500">
                                {frecuenciaTipo === 'FECHA' ? 'Días antes de vencer' : `Unidades (${frecuenciaTipo}) antes`}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={actionLoading}>
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Programa"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programas.map((prog) => (
                    <Card key={prog.id} className={cn(
                        "border shadow-sm transition-all hover:shadow-md",
                        prog.estado_alerta === 'DANGER' ? "border-red-300 bg-red-50 dark:bg-red-950/20" :
                            prog.estado_alerta === 'WARNING' ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" :
                                "border-slate-200 dark:border-slate-800"
                    )}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        {prog.titulo}
                                        {prog.estado_alerta === 'DANGER' && <Badge variant="destructive" className="text-[10px]">VENCIDO</Badge>}
                                        {prog.estado_alerta === 'WARNING' && <Badge className="bg-amber-500 text-white text-[10px]">PRONTO</Badge>}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        Cada {prog.frecuencia_valor} {prog.unidad}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingProg(prog)}>
                                        <Edit className="h-3 w-3 text-slate-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(prog.id)}>
                                        <Trash2 className="h-3 w-3 text-slate-500 hover:text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Próximo servicio:</span>
                                    <span className="font-mono font-medium">{prog.proximo_valor_estimado} {prog.unidad === 'Días' ? '' : prog.unidad}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Restante:</span>
                                    <span className={cn(
                                        "font-bold font-mono",
                                        prog.estado_alerta === 'DANGER' ? "text-red-600" :
                                            prog.estado_alerta === 'WARNING' ? "text-amber-600" : "text-green-600"
                                    )}>
                                        {prog.restante} {prog.unidad}
                                    </span>
                                </div>

                                <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn("absolute h-full rounded-full transition-all duration-500",
                                            prog.estado_alerta === 'DANGER' ? "bg-red-500" :
                                                prog.estado_alerta === 'WARNING' ? "bg-amber-500" : "bg-blue-500"
                                        )}
                                        style={{ width: `${Math.min(prog.porcentaje_uso, 100)}%` }}
                                    ></div>
                                </div>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-2 text-xs border-dashed"
                                    onClick={() => handleReset(prog.id)}
                                >
                                    <CheckCircle className="mr-2 h-3 w-3" /> Registrar Mantenimiento Realizado
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {programas.length === 0 && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                        No hay programas preventivos configurados para este equipo.
                    </div>
                )}
            </div>
        </div>
    );
}

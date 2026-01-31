import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UserPlus, ArrowRightLeft, Loader2 } from "lucide-react";
import { useAsignaciones } from "@/hooks/use-asignaciones";
import { useUsuarios } from "@/hooks/use-usuarios";
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
    DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AsignacionesPanelProps {
    equipoId: string;
    onRefresh: () => void;
}

export function AsignacionesPanel({ equipoId, onRefresh }: AsignacionesPanelProps) {
    const { asignaciones, asignacionActiva, loading, error, refresh: refreshAsignaciones, asignarEquipo, devolverEquipo } = useAsignaciones(equipoId);
    const { usuarios } = useUsuarios();

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    // Form states
    const [responsableId, setResponsableId] = useState("");
    const [proyecto, setProyecto] = useState("");
    const [condicionEntrega, setCondicionEntrega] = useState("");

    const [condicionRecepcion, setCondicionRecepcion] = useState("");
    const [estadoFinal, setEstadoFinal] = useState("DISPONIBLE");
    const [motivoDevolucion, setMotivoDevolucion] = useState("");

    const [actionLoading, setActionLoading] = useState(false);

    const handleAssign = async () => {
        if (!responsableId) {
            alert("Debe seleccionar un responsable");
            return;
        }
        setActionLoading(true);
        const result = await asignarEquipo({ responsable_id: responsableId, proyecto, condicion_entrega: condicionEntrega });
        setActionLoading(false);
        if (result.success) {
            setIsAssignModalOpen(false);
            setResponsableId("");
            setProyecto("");
            setCondicionEntrega("");
            refreshAsignaciones();
            onRefresh();
        } else {
            alert("Error: " + result.error);
        }
    };

    const handleReturn = async () => {
        setActionLoading(true);
        const result = await devolverEquipo({
            condicion_recepcion: condicionRecepcion,
            nuevo_estado: estadoFinal,
            motivo_cambio: `Devolución: ${motivoDevolucion}`
        });
        setActionLoading(false);
        if (result.success) {
            setIsReturnModalOpen(false);
            setCondicionRecepcion("");
            setEstadoFinal("DISPONIBLE");
            setMotivoDevolucion("");
            refreshAsignaciones();
            onRefresh();
        } else {
            alert("Error: " + result.error);
        }
    };

    if (loading) return <div className="py-4 text-center"><Loader2 className="animate-spin h-5 w-5 mx-auto text-blue-500" /></div>;
    if (error) return <div className="text-red-500 text-sm">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Estado de Asignación</CardTitle>
                            <CardDescription>
                                {asignacionActiva
                                    ? "El equipo se encuentra actualmente asignado."
                                    : "El equipo está disponible para asignación."}
                            </CardDescription>
                        </div>
                        <div>
                            {asignacionActiva ? (
                                <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-orange-500 hover:bg-orange-600">
                                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Registrar Devolución
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Registrar Devolución de Equipo</DialogTitle>
                                            <DialogDescription>
                                                Confirme la recepción del equipo y su estado actual.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Condición de Recepción</Label>
                                                <Input
                                                    placeholder="Ej. Buen estado, sucio, con daño menor..."
                                                    value={condicionRecepcion}
                                                    onChange={e => setCondicionRecepcion(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Estado Operativo Final</Label>
                                                <Select value={estadoFinal} onValueChange={setEstadoFinal}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione Estado" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                                                        <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                                                        <SelectItem value="FUERA_DE_SERVICIO">Fuera de Servicio</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Notas / Comentarios</Label>
                                                <Textarea
                                                    placeholder="Observaciones adicionales sobre la devolución..."
                                                    value={motivoDevolucion}
                                                    onChange={e => setMotivoDevolucion(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsReturnModalOpen(false)}>Cancelar</Button>
                                            <Button onClick={handleReturn} disabled={actionLoading}>
                                                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Devolución"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <UserPlus className="mr-2 h-4 w-4" /> Asignar Equipo
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Asignar Equipo</DialogTitle>
                                            <DialogDescription>
                                                Seleccione el responsable y proyecto para este equipo.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Responsable</Label>
                                                <Select value={responsableId} onValueChange={setResponsableId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione Usuario" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {usuarios.map(u => (
                                                            <SelectItem key={u.id} value={u.id}>
                                                                {u.nombre} {u.apellido}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Proyecto / Destino</Label>
                                                <Input
                                                    placeholder="Ej. Obra Norte, Mantenimiento Planta..."
                                                    value={proyecto}
                                                    onChange={e => setProyecto(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Condición de Entrega</Label>
                                                <Input
                                                    placeholder="Ej. Operativo, tanque lleno..."
                                                    value={condicionEntrega}
                                                    onChange={e => setCondicionEntrega(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancelar</Button>
                                            <Button onClick={handleAssign} disabled={actionLoading}>
                                                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Asignación"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                </CardHeader>
                {asignacionActiva && (
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Responsable Actual</p>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs">
                                    {asignacionActiva.perfiles?.nombre?.charAt(0)}{asignacionActiva.perfiles?.apellido?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{asignacionActiva.perfiles?.nombre} {asignacionActiva.perfiles?.apellido}</p>
                                    <p className="text-xs text-slate-500">{asignacionActiva.perfiles?.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Proyecto</p>
                            <p className="text-sm font-medium">{asignacionActiva.proyecto || 'General'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Fecha Asignación</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {format(new Date(asignacionActiva.fecha_asignacion), "dd MMM yyyy, HH:mm", { locale: es })}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Condición Entrega</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{asignacionActiva.condicion_entrega || '---'}</p>
                        </div>
                    </CardContent>
                )}
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg">Historial de Asignaciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow>
                                <TableHead>Fecha Asignación</TableHead>
                                <TableHead>Responsable</TableHead>
                                <TableHead>Proyecto</TableHead>
                                <TableHead>Fecha Devolución</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {asignaciones.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell className="text-sm font-mono">
                                        {format(new Date(a.fecha_asignacion), "dd/MM/yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                                            {a.perfiles?.nombre} {a.perfiles?.apellido}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">
                                        {a.proyecto || '-'}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">
                                        {a.fecha_devolucion ? format(new Date(a.fecha_devolucion), "dd/MM/yyyy HH:mm") : <span className="text-blue-500 font-medium">Activa</span>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "font-normal",
                                            !a.fecha_devolucion ? "bg-blue-50 text-blue-600 border-blue-200" : "text-slate-500"
                                        )}>
                                            {!a.fecha_devolucion ? "En Curso" : "Finalizada"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {asignaciones.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-slate-500 italic">
                                        Este equipo no ha sido asignado nunca.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

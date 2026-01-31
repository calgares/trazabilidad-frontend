import { useState } from "react";
import { format } from "date-fns";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useFallas } from "@/hooks/use-fallas";
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

interface FallasPanelProps {
    equipoId: string;
    onRefresh: () => void;
}

export function FallasPanel({ equipoId, onRefresh }: FallasPanelProps) {
    const { fallas, loading, error, refresh: refreshFallas, reportarFalla, actualizarEstadoFalla } = useFallas(equipoId);
    const { usuarios } = useUsuarios();

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Form state
    const [tipoFalla, setTipoFalla] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [severidad, setSeveridad] = useState("BAJA");
    const [responsableId, setResponsableId] = useState("");

    const [actionLoading, setActionLoading] = useState(false);

    const handleReport = async () => {
        if (!tipoFalla || !responsableId) {
            alert("Tipo de falla y Responsable son obligatorios");
            return;
        }

        setActionLoading(true);
        const result = await reportarFalla({
            tipo_falla: tipoFalla,
            descripcion,
            severidad,
            usuario_id: responsableId
        });
        setActionLoading(false);

        if (result.success) {
            setIsReportModalOpen(false);
            setTipoFalla("");
            setDescripcion("");
            setSeveridad("BAJA");
            refreshFallas();
            onRefresh();
        } else {
            alert("Error: " + result.error);
        }
    };

    const handleResolve = async (fallaId: string) => {
        if (!confirm("¿Marcar esta falla como RESUELTA?")) return;

        setActionLoading(true);
        const result = await actualizarEstadoFalla(fallaId, 'RESUELTA');
        setActionLoading(false);

        if (result.success) {
            refreshFallas();
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
                            <CardTitle className="text-lg">Reporte de Fallas</CardTitle>
                            <CardDescription>Gestión de incidentes y problemas operativos.</CardDescription>
                        </div>
                        <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="shadow-sm">
                                    <AlertCircle className="mr-2 h-4 w-4" /> Reportar Falla
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Reportar Nueva Falla</DialogTitle>
                                    <DialogDescription>
                                        Describa el problema encontrado. Si la severidad es ALTA, el equipo pasará a mantenimiento automáticamente.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Tipo de Falla / Título</Label>
                                        <Input
                                            placeholder="Ej. Fuga de aceite, No enciende..."
                                            value={tipoFalla}
                                            onChange={e => setTipoFalla(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Descripción Detallada</Label>
                                        <Textarea
                                            placeholder="Detalles sobre cómo ocurrió, síntomas, etc."
                                            value={descripcion}
                                            onChange={e => setDescripcion(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Severidad</Label>
                                        <Select value={severidad} onValueChange={setSeveridad}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione Severidad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BAJA">Baja (Cosmética / Leve)</SelectItem>
                                                <SelectItem value="MEDIA">Media (Requiere atención)</SelectItem>
                                                <SelectItem value="ALTA">Alta (Inoperativo / Crítico)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reportado Por</Label>
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
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Cancelar</Button>
                                    <Button onClick={handleReport} disabled={actionLoading} variant="destructive">
                                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar Falla"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg">Historial de Incidentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow>
                                <TableHead>Fecha Reporte</TableHead>
                                <TableHead>Falla</TableHead>
                                <TableHead>Severidad</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Reportado Por</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fallas.map((f) => (
                                <TableRow key={f.id}>
                                    <TableCell className="text-sm font-mono">
                                        {format(new Date(f.fecha_reporte), "dd/MM/yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{f.tipo_falla}</p>
                                        <p className="text-xs text-slate-500 truncate max-w-[200px]" title={f.descripcion || ""}>
                                            {f.descripcion || "Sin descripción"}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "font-bold text-[10px]",
                                            f.severidad === 'ALTA' ? "bg-red-100 text-red-700 border-red-200" :
                                                f.severidad === 'MEDIA' ? "bg-orange-100 text-orange-700 border-orange-200" :
                                                    "bg-blue-100 text-blue-700 border-blue-200"
                                        )}>
                                            {f.severidad}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            f.estado_falla === 'ABIERTA' ? "text-red-600 border-red-200 bg-red-50" :
                                                f.estado_falla === 'EN_REVISION' ? "text-blue-600 border-blue-200 bg-blue-50" :
                                                    "text-green-600 border-green-200 bg-green-50"
                                        )}>
                                            {f.estado_falla.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                        {f.usuario_nombre ? (
                                            `${f.usuario_nombre} ${f.usuario_apellido}`
                                        ) : (
                                            f.perfiles?.nombre ? `${f.perfiles.nombre} ${f.perfiles.apellido}` : '---'
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {f.estado_falla !== 'RESUELTA' && (
                                            <Button variant="ghost" size="sm" onClick={() => handleResolve(f.id)} title="Marcar como Resuelta">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {fallas.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-slate-500 italic">
                                        No hay fallas reportadas.
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

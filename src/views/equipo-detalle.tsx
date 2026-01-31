import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useEquipoDetalle } from "@/hooks/use-equipo-detalle";
import { useEquiposActions } from "@/hooks/use-equipos-actions";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Wrench,
    History,
    FileText,
    Settings,
    Activity,
    Clock,
    ChevronRight,
    Loader2,
    AlertCircle,
    Edit,
    Trash2,
    CalendarClock,
    Briefcase,
    ClipboardList,
    QrCode,
    Printer,
} from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { EquipoForm } from "@/components/layout/EquipoForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Imported extracted components
import {
    AsignacionesPanel,
    FallasPanel,
    HistorialTable,
    PreventivosPanel,
    WorkOrdersPanel
} from "./equipo-detalle-panels";

export function EquipoDetalle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { equipo, valoresBase, valoresPersonalizados, timeline, loading, error, refresh } = useEquipoDetalle(id!);
    const { updateEquipo, deleteEquipo, loading: saving } = useEquiposActions();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    const handleEdit = async (data: Record<string, unknown>) => {
        const result = await updateEquipo(id!, data);
        if (result.success) {
            setIsEditModalOpen(false);
            refresh();
        } else {
            alert("Error al actualizar: " + result.error);
        }
    };

    const handleDelete = async () => {
        const result = await deleteEquipo(id!);
        if (result.success) {
            navigate('/equipos');
        } else {
            alert("Error al eliminar: " + result.error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !equipo) {
        return (
            <div className="p-8 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>Error al cargar el detalle del equipo: {error || "No encontrado"}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link to="/equipos" className="hover:text-blue-600">Equipos</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">{equipo.codigo_unico}</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {equipo.nombre}
                    </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => setIsDeleteAlertOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="ficha" className="w-full">
                        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <TabsTrigger value="ficha" className="gap-2">
                                <FileText className="h-4 w-4" /> Ficha Técnica
                            </TabsTrigger>
                            <TabsTrigger value="timeline" className="gap-2">
                                <History className="h-4 w-4" /> Historial / Timeline
                            </TabsTrigger>
                            <TabsTrigger value="repuestos" className="gap-2">
                                <Settings className="h-4 w-4" /> Repuestos
                            </TabsTrigger>
                            <TabsTrigger value="asignaciones" className="gap-2">
                                <ClipboardList className="h-4 w-4" /> Asignaciones
                            </TabsTrigger>
                            <TabsTrigger value="fallas" className="gap-2">
                                <AlertCircle className="h-4 w-4" /> Reporte de Fallas
                            </TabsTrigger>
                            <TabsTrigger value="preventivos" className="gap-2">
                                <CalendarClock className="h-4 w-4" /> Preventivos
                            </TabsTrigger>
                            <TabsTrigger value="ordenes" className="gap-2">
                                <Briefcase className="h-4 w-4" /> Órdenes Trabajo
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="ficha" className="mt-6 space-y-6">
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                        Especificaciones Base
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {valoresBase.map((v) => (
                                        <div key={v.ficha_campos_base?.id} className="space-y-1">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{v.ficha_campos_base?.nombre_campo}</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{v.valor || '---'}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-blue-500" />
                                        Campos Personalizados ({equipo.tipos_equipo?.nombre})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {valoresPersonalizados.length === 0 ? (
                                        <p className="col-span-full text-sm text-slate-500 italic">No hay campos personalizados definidos para este tipo de equipo.</p>
                                    ) : (
                                        valoresPersonalizados.map((v) => (
                                            <div key={v.ficha_campos_personalizados?.id} className="space-y-1">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{v.ficha_campos_personalizados?.nombre_campo}</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{v.valor || '---'}</p>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="timeline" className="mt-6">
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Historial de Estados Operativos</CardTitle>
                                            <CardDescription>Registro de cambios de estado y disponibilidad.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <HistorialTable equipoId={id!} />
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200 dark:border-slate-800 mt-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">Línea de Vida (Eventos)</CardTitle>
                                    <CardDescription>Registro cronológico de todas las intervenciones y eventos.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                                        {timeline.map((event) => (
                                            <div key={event.id} className="relative flex items-start gap-6 pl-4">
                                                <div className={cn(
                                                    "absolute left-0 mt-1.5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white dark:border-slate-950 shadow-sm",
                                                    event.tipo_evento === 'Mantenimiento' ? 'bg-blue-500 text-white' :
                                                        event.tipo_evento === 'Falla' ? 'bg-red-500 text-white' :
                                                            'bg-slate-500 text-white'
                                                )}>
                                                    {event.tipo_evento === 'Mantenimiento' ? <Wrench className="h-4 w-4" /> :
                                                        event.tipo_evento === 'Falla' ? <AlertCircle className="h-4 w-4" /> :
                                                            <Activity className="h-4 w-4" />}
                                                </div>
                                                <div className="flex-1 pt-1 ml-10">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{event.tipo_evento}</h4>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDistanceToNow(new Date(event.fecha), { addSuffix: true, locale: es })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {event.descripcion}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 border-slate-200 dark:border-slate-800">
                                                            ID: {event.id.toString().substring(0, 8)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="asignaciones" className="mt-6">
                            <AsignacionesPanel equipoId={id!} estadoActual={equipo.estado} onRefresh={refresh} />
                        </TabsContent>

                        <TabsContent value="fallas" className="mt-6">
                            <FallasPanel equipoId={id!} onRefresh={refresh} />
                        </TabsContent>

                        <TabsContent value="repuestos" className="mt-6">
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardContent className="pt-6">
                                    <div className="text-center py-12">
                                        <Settings className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Control de Repuestos</h3>
                                        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">Próximamente: Visualización y gestión de stock de repuestos utilizados en este equipo.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="preventivos" className="mt-6">
                            <PreventivosPanel equipoId={id!} lecturaActual={equipo.contador_actual || 0} />
                        </TabsContent>

                        <TabsContent value="ordenes" className="mt-6">
                            <WorkOrdersPanel equipoId={id!} />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Estado Actual</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Badge className={cn(
                                "w-full justify-center py-2 text-sm font-bold shadow-sm",
                                equipo.estado === 'Operativo' ? 'bg-green-500 hover:bg-green-600' :
                                    equipo.estado === 'En Mantenimiento' ? 'bg-blue-500 hover:bg-blue-600' :
                                        'bg-red-500 hover:bg-red-600'
                            )}>
                                {equipo.estado}
                            </Badge>

                            <div className="pt-4 space-y-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Ubicación:</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-100 italic">{equipo.ubicaciones?.nombre}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Tag:</span>
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{equipo.codigo_unico}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Último Mto:</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">---</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Acciones Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start text-xs h-9">
                                <FileText className="mr-2 h-4 w-4" /> Generar Reporte PDF
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-xs h-9">
                                <History className="mr-2 h-4 w-4" /> Ver Historial Completo
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-xs h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 mt-2 text-blue-600 dark:text-blue-400 font-medium"
                                onClick={() => setIsQRModalOpen(true)}
                            >
                                <QrCode className="mr-2 h-4 w-4" /> Generar Código QR
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <EquipoForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEdit}
                initialData={equipo}
                loading={saving}
            />

            <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
                <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">Código QR de Identificación</DialogTitle>
                        <DialogDescription className="text-center">
                            Escanea este código para acceder rápidamente a la ficha técnica de este equipo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                            <QRCode
                                value={window.location.href}
                                size={200}
                                level="H"
                            />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-mono font-bold text-lg text-slate-900 dark:text-slate-100">{equipo.codigo_unico}</p>
                            <p className="text-sm text-slate-500">{equipo.nombre}</p>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button type="button" variant="secondary" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Imprimir Etiqueta
                        </Button>
                        <Button type="button" onClick={() => setIsQRModalOpen(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent className="border-slate-200 dark:border-slate-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">¿Está absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el equipo
                            <span className="font-bold text-slate-900 dark:text-slate-100"> {equipo.nombre} ({equipo.codigo_unico})</span> y todos sus registros asociados de la base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Confirmar Eliminación
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

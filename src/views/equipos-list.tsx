import { useEquipos } from "@/hooks/use-equipos";
import { useEquiposActions } from "@/hooks/use-equipos-actions";
import { useCatalogos } from "@/hooks/use-catalogos";
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Loader2, AlertCircle, Eye, MoreHorizontal, Settings2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { EquipoForm } from "@/components/layout/EquipoForm";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function EquiposList() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { equipos, loading, error, refresh, totalCount } = useEquipos(currentPage, pageSize);
    const { createEquipo, loading: saving } = useEquiposActions();
    const { createItem } = useCatalogos();

    const [isFormOpen, setIsFormOpen] = useState(false);

    // Type Modal State
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [newType, setNewType] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [creatingType, setCreatingType] = useState(false);

    const handleSave = async (data: any) => {
        const result = await createEquipo(data);
        if (result.success) {
            setIsFormOpen(false);
            refresh();
        } else {
            alert("Error al registrar: " + result.error);
        }
    };

    const handleCreateType = async () => {
        if (!newType.trim() || !newCategory) return;
        setCreatingType(true);
        const result = await createItem('tipos_equipo', {
            nombre: newType,
            categoria_operativa: newCategory
        });
        if (result.success) {
            setIsTypeModalOpen(false);
            setNewType("");
            setNewCategory("");
            // Optionally we could refresh catalogs context if we had one global, 
            // but usually this is enough if the form re-fetches or validation passes
            // To be safe, we just close. The main Equipos list doesn't show types list directly so no refresh needed here technically,
            // but the EquipoForm might need it.
        } else {
            alert("Error al crear tipo: " + result.error);
        }
        setCreatingType(false);
    };

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
                <p>Error al cargar equipos: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Gestión de Equipos</h2>
                    <p className="text-slate-500 dark:text-slate-400">Listado completo de activos fijos y maquinaria industrial.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsTypeModalOpen(true)}
                    >
                        <Settings2 className="mr-2 h-4 w-4" /> Agregar Tipo
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                        onClick={() => setIsFormOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Equipo
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Buscar por tag o nombre..."
                                className="pl-9 bg-white dark:bg-slate-950"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="h-9">
                            <Filter className="mr-2 h-4 w-4" /> Filtros
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                <TableRow>
                                    <TableHead className="font-semibold">Tag / Código</TableHead>
                                    <TableHead className="font-semibold">Nombre del Equipo</TableHead>
                                    <TableHead className="font-semibold">Tipo</TableHead>
                                    <TableHead className="font-semibold">Ubicación</TableHead>
                                    <TableHead className="font-semibold text-center">Estado</TableHead>
                                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {equipos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500 italic font-light">
                                            No se encontraron equipos registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    equipos.map((equipo) => (
                                        <TableRow key={equipo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                                            <TableCell className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {equipo.codigo_unico}
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                                {equipo.nombre}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-normal">
                                                    {equipo.tipos_equipo?.nombre}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                                                {equipo.ubicaciones?.nombre}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm",
                                                    equipo.estado_operativo === 'DISPONIBLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' :
                                                        equipo.estado_operativo === 'EN_OPERACION' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                                                            equipo.estado_operativo === 'EN_MANTENIMIENTO' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' :
                                                                equipo.estado_operativo === 'FUERA_DE_SERVICIO' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800' :
                                                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                                )}>
                                                    {equipo.estado_operativo?.replace(/_/g, ' ') || 'SIN ESTADO'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" asChild>
                                                        <Link to={`/equipos/${equipo.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                        Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalCount)} de {totalCount} registros
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm font-medium">
                            Página {currentPage} de {Math.max(1, Math.ceil(totalCount / pageSize))}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </Card>

            <EquipoForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSave}
                loading={saving}
            />

            {/* Modal para agregar Tipo de Equipo */}
            <Dialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Tipo de Equipo</DialogTitle>
                        <DialogDescription>
                            Introduce el nombre y categoría operativa del nuevo tipo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombreTipo">Nombre del Tipo</Label>
                            <Input
                                id="nombreTipo"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                placeholder="Ej. Torno CNC, Compresor..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="categoriaTipo">Categoría Operativa</Label>
                            <select
                                id="categoriaTipo"
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            >
                                <option value="" disabled>Seleccione una categoría</option>
                                <option value="MAQUINARIA_PESADA">Maquinaria Pesada</option>
                                <option value="EQUIPO_MOTORIZADO">Equipo Motorizado</option>
                                <option value="HERRAMIENTA_ELECTRICA">Herramienta Eléctrica</option>
                                <option value="HERRAMIENTA_MENOR">Herramienta Menor</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTypeModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateType} disabled={creatingType || !newType || !newCategory}>
                            {creatingType ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Tipo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

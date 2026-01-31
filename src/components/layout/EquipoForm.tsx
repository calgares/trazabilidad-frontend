import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useCatalogos } from "@/hooks/use-catalogos";
import { Loader2, Plus } from "lucide-react";

interface EquipoFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
    loading?: boolean;
}

export function EquipoForm({ isOpen, onClose, onSave, initialData, loading: saving }: EquipoFormProps) {
    const { tiposEquipo, ubicaciones, loading: loadingCatalogos, createItem } = useCatalogos();
    const [formData, setFormData] = useState({
        nombre: '',
        codigo_unico: '',
        tipo_equipo_id: '',
        ubicacion_id: '',

        estado_operativo: 'DISPONIBLE',
        motivo_estado: '',
        tipo_contador: '',
        lectura_actual: 0
    });

    // New Type Modal State
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [newTypeName, setNewTypeName] = useState("");
    const [newTypeCategory, setNewTypeCategory] = useState("");
    const [creatingType, setCreatingType] = useState(false);

    const handleCreateType = async () => {
        if (!newTypeName.trim() || !newTypeCategory) return;
        setCreatingType(true);
        // Assuming createItem is available from useCatalogos destructuring
        const result = await createItem('tipos_equipo', {
            nombre: newTypeName,
            categoria_operativa: newTypeCategory
        });
        if (result.success) {
            setIsTypeModalOpen(false);
            setNewTypeName("");
            setNewTypeCategory("");
            // Auto-select the new type
            if (result.data && result.data.id) {
                setFormData(prev => ({ ...prev, tipo_equipo_id: result.data.id.toString() }));
            }
        } else {
            alert("Error al crear tipo: " + result.error);
        }
        setCreatingType(false);
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                codigo_unico: initialData.codigo_unico || '',
                tipo_equipo_id: initialData.tipo_equipo_id?.toString() || '',
                ubicacion_id: initialData.ubicacion_id?.toString() || '',
                estado_operativo: initialData.estado_operativo || 'DISPONIBLE',
                motivo_estado: initialData.motivo_estado || '', // Start empty or keep previous? Usually new reason for new change.
                tipo_contador: initialData.tipo_contador || '',
                lectura_actual: initialData.lectura_actual || 0
            });
        } else {
            setFormData({
                nombre: '',
                codigo_unico: '',
                tipo_equipo_id: '',
                ubicacion_id: '',
                estado_operativo: 'DISPONIBLE',
                motivo_estado: '',
                tipo_contador: '',
                lectura_actual: 0
            });
        }
    }, [initialData, isOpen]);

    // Find selected type to check category
    const selectedType = tiposEquipo.find(t => t.id.toString() === formData.tipo_equipo_id);
    const showCounters = selectedType && (selectedType.categoria_operativa === 'MAQUINARIA_PESADA' || selectedType.categoria_operativa === 'EQUIPO_MOTORIZADO');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            ...formData,
            tipo_equipo_id: formData.tipo_equipo_id,
            ubicacion_id: formData.ubicacion_id
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Editar Equipo' : 'Nuevo Equipo'}</DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Actualice la información principal del equipo seleccionado.'
                            : 'Complete los datos básicos para registrar un nuevo equipo en el sistema.'}
                    </DialogDescription>
                </DialogHeader>

                {loadingCatalogos ? (
                    <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="nombre">Nombre del Equipo</Label>
                                <Input
                                    id="nombre"
                                    placeholder="Ej. Bomba de Vacío P-101"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="codigo">Código Único (Tag)</Label>
                                <Input
                                    id="codigo"
                                    placeholder="Ej. MOT-001"
                                    value={formData.codigo_unico}
                                    onChange={(e) => setFormData({ ...formData, codigo_unico: e.target.value })}
                                    required
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado Operativo</Label>
                                <Select
                                    value={formData.estado_operativo}
                                    onValueChange={(val) => setFormData({ ...formData, estado_operativo: val })}
                                >
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Seleccione Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                                        <SelectItem value="EN_OPERACION">En Operación</SelectItem>
                                        <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                                        <SelectItem value="FUERA_DE_SERVICIO">Fuera de Servicio</SelectItem>
                                        <SelectItem value="BAJA">Baja</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Show reason field only if editing existing equipment (initialData exists) and state is changed, 
                                but simpler: always show optional reason when editing to capture why. 
                                Or strictly, only required if state changes? 
                                For now, let's just add it as an optional field always available, 
                                but let's make it prominent if it's an update.
                            */}
                            <div className="space-y-2">
                                <Label htmlFor="motivo">Motivo del Estado (Opcional)</Label>
                                <Input
                                    id="motivo"
                                    placeholder="Ej. Mantenimiento preventivo programado"
                                    value={formData.motivo_estado || ''}
                                    onChange={(e) => setFormData({ ...formData, motivo_estado: e.target.value })}
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="tipo">Tipo de Equipo</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-blue-600 dark:text-blue-400 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        onClick={() => setIsTypeModalOpen(true)}
                                    >
                                        <Plus className="mr-1 h-3 w-3" /> Nuevo Tipo
                                    </Button>
                                </div>
                                <Select
                                    value={formData.tipo_equipo_id}
                                    onValueChange={(val) => setFormData({ ...formData, tipo_equipo_id: val })}
                                    required
                                >
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Seleccione Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tiposEquipo.map(t => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ubicacion">Ubicación</Label>
                                <Select
                                    value={formData.ubicacion_id}
                                    onValueChange={(val) => setFormData({ ...formData, ubicacion_id: val })}
                                    required
                                >
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Seleccione Ubicación" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ubicaciones.map(u => (
                                            <SelectItem key={u.id} value={u.id.toString()}>{u.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {showCounters && (
                                <div className="grid grid-cols-2 gap-4 col-span-2 border-t dark:border-slate-800 pt-4 mt-2">
                                    <div className="col-span-2">
                                        <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Configuración de Contadores</Label>
                                        <p className="text-xs text-slate-500 mb-2">Este equipo requiere seguimiento de uso (Horas/Kilómetros).</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tipo_contador">Tipo de Medición</Label>
                                        <Select
                                            value={formData.tipo_contador}
                                            onValueChange={(val) => setFormData({ ...formData, tipo_contador: val })}
                                        >
                                            <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                <SelectValue placeholder="Seleccione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HORAS">Horas de Uso</SelectItem>
                                                <SelectItem value="KILOMETROS">Kilómetros</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lectura_actual">Lectura Inicial</Label>
                                        <Input
                                            type="number"
                                            id="lectura_actual"
                                            value={formData.lectura_actual}
                                            onChange={(e) => setFormData({ ...formData, lectura_actual: parseFloat(e.target.value) || 0 })}
                                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>



                        <DialogFooter className="pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    initialData ? 'Guardar Cambios' : 'Registrar Equipo'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>

            {/* Nested Modal for New Type */}
            <Dialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
                <DialogContent className="border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Agregar Nuevo Tipo</DialogTitle>
                        <DialogDescription>
                            Crear una nueva categoría para clasificar equipos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="newTypeName" className="mb-2 block">Nombre del Tipo</Label>
                            <Input
                                id="newTypeName"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                placeholder="Ej. Torno, Fresadora..."
                                autoFocus
                            />
                        </div>
                        <div>
                            <Label htmlFor="newTypeCategory" className="mb-2 block">Categoría Operativa</Label>
                            <Select
                                value={newTypeCategory}
                                onValueChange={setNewTypeCategory}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MAQUINARIA_PESADA">Maquinaria Pesada</SelectItem>
                                    <SelectItem value="EQUIPO_MOTORIZADO">Equipo Motorizado</SelectItem>
                                    <SelectItem value="HERRAMIENTA_ELECTRICA">Herramienta Eléctrica</SelectItem>
                                    <SelectItem value="HERRAMIENTA_MENOR">Herramienta Menor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsTypeModalOpen(false)}>Cancelar</Button>
                        <Button type="button" onClick={handleCreateType} disabled={creatingType || !newTypeName.trim() || !newTypeCategory}>
                            {creatingType ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}

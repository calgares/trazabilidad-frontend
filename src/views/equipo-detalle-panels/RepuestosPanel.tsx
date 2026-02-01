import { useState } from "react";
import { useRepuestos } from "@/hooks/use-repuestos";
import type { Repuesto, Caracteristica } from "@/hooks/use-repuestos";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Save, X, Loader2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RepuestosPanelProps {
    equipoId: string;
}

export function RepuestosPanel({ equipoId }: RepuestosPanelProps) {
    const { repuestos, loading, error, createRepuesto, updateRepuesto, deleteRepuesto } = useRepuestos(equipoId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRepuesto, setEditingRepuesto] = useState<Repuesto | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nombre: "",
        codigo_parte: "",
        cantidad: 0,
        unidad_medida: "unidades",
        ubicacion_almacen: "",
        observaciones: "",
        caracteristicas: [] as Caracteristica[]
    });

    // Custom Field State
    const [newCharName, setNewCharName] = useState("");
    const [newCharValue, setNewCharValue] = useState("");

    const resetForm = () => {
        setFormData({
            nombre: "",
            codigo_parte: "",
            cantidad: 0,
            unidad_medida: "unidades",
            ubicacion_almacen: "",
            observaciones: "",
            caracteristicas: []
        });
        setEditingRepuesto(null);
        setNewCharName("");
        setNewCharValue("");
    };

    const handleOpenModal = (repuesto?: Repuesto) => {
        if (repuesto) {
            setEditingRepuesto(repuesto);
            setFormData({
                nombre: repuesto.nombre,
                codigo_parte: repuesto.codigo_parte || "",
                cantidad: repuesto.cantidad,
                unidad_medida: repuesto.unidad_medida || "unidades",
                ubicacion_almacen: repuesto.ubicacion_almacen || "",
                observaciones: repuesto.observaciones || "",
                caracteristicas: [...(repuesto.caracteristicas || [])]
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleAddCharacteristic = () => {
        if (!newCharName.trim() || !newCharValue.trim()) return;
        setFormData(prev => ({
            ...prev,
            caracteristicas: [...prev.caracteristicas, { nombre: newCharName, valor: newCharValue }]
        }));
        setNewCharName("");
        setNewCharValue("");
    };

    const handleRemoveCharacteristic = (index: number) => {
        setFormData(prev => ({
            ...prev,
            caracteristicas: prev.caracteristicas.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.nombre) return;
        setSaving(true);

        // Capture pending characteristic if user forgot to click Add
        const finalFormData = { ...formData };
        if (newCharName.trim() && newCharValue.trim()) {
            finalFormData.caracteristicas = [
                ...finalFormData.caracteristicas,
                { nombre: newCharName, valor: newCharValue }
            ];
            // Clear inputs for next time
            setNewCharName("");
            setNewCharValue("");
        }

        let result;
        if (editingRepuesto) {
            result = await updateRepuesto(editingRepuesto.id, finalFormData);
        } else {
            result = await createRepuesto(finalFormData);
        }

        setSaving(false);
        if (result.success) {
            setIsModalOpen(false);
            resetForm();
        } else {
            alert("Error: " + result.error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("¿Está seguro de eliminar este repuesto?")) {
            const result = await deleteRepuesto(id);
            if (!result.success) {
                alert("Error: " + result.error);
            }
        }
    };

    if (loading) return <div className="py-8 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-blue-500" /></div>;
    if (error) return <div className="text-red-500 text-center py-4">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg">Inventario de Repuestos</CardTitle>
                            <CardDescription>Gestión de partes y refacciones asociadas a este equipo.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Agregar Repuesto
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre / Código</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Características Especiales</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {repuestos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500 italic">
                                        No hay repuestos registrados para este equipo.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                repuestos.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{r.nombre}</p>
                                            <p className="text-xs text-slate-500 font-mono">{r.codigo_parte}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={r.cantidad > 0 ? "outline" : "destructive"} className="font-mono">
                                                {r.cantidad} {r.unidad_medida}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                            {r.ubicacion_almacen || '---'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {r.caracteristicas && r.caracteristicas.length > 0 ? (
                                                    r.caracteristicas.map((c, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            {c.nombre}: {c.valor}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Sin detalles</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(r)}>
                                                <Edit className="h-4 w-4 text-slate-500 hover:text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                                                <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRepuesto ? 'Editar Repuesto' : 'Agregar Nuevo Repuesto'}</DialogTitle>
                        <DialogDescription>
                            Complete la información técnica del repuesto. Puede agregar características personalizadas.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="nombre">Nombre de la Parte</Label>
                                <Input
                                    id="nombre"
                                    placeholder="Ej. Rodamiento SKF 6204"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="codigo">Código / N/P</Label>
                                <Input
                                    id="codigo"
                                    placeholder="Ej. P-123456"
                                    value={formData.codigo_parte}
                                    onChange={(e) => setFormData({ ...formData, codigo_parte: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ubicacion">Ubicación Almacén</Label>
                                <Input
                                    id="ubicacion"
                                    placeholder="Ej. Estante A-2"
                                    value={formData.ubicacion_almacen}
                                    onChange={(e) => setFormData({ ...formData, ubicacion_almacen: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cantidad">Cantidad Stock</Label>
                                <Input
                                    id="cantidad"
                                    type="number"
                                    value={formData.cantidad}
                                    onChange={(e) => setFormData({ ...formData, cantidad: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unidad">Unidad de Medida</Label>
                                <Input
                                    id="unidad"
                                    placeholder="unidades, litros, metros..."
                                    value={formData.unidad_medida}
                                    onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Special Characteristics Section */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-md p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Settings className="h-4 w-4 text-blue-500" />
                                <Label className="font-semibold text-slate-700 dark:text-slate-300">Características Especiales</Label>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nombre (ej. Voltaje)"
                                    className="h-8 text-sm"
                                    value={newCharName}
                                    onChange={(e) => setNewCharName(e.target.value)}
                                />
                                <Input
                                    placeholder="Valor (ej. 24V DC)"
                                    className="h-8 text-sm"
                                    value={newCharValue}
                                    onChange={(e) => setNewCharValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCharacteristic()}
                                />
                                <Button size="sm" variant="secondary" onClick={handleAddCharacteristic} disabled={!newCharName.trim() || !newCharValue.trim()}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.caracteristicas.length === 0 && (
                                    <span className="text-xs text-slate-400 italic">No hay características agregadas</span>
                                )}
                                {formData.caracteristicas.map((c, idx) => (
                                    <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-white dark:bg-slate-800 border-slate-200">
                                        <span>{c.nombre}: <span className="font-semibold">{c.valor}</span></span>
                                        <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full hover:bg-red-100 hover:text-red-500" onClick={() => handleRemoveCharacteristic(idx)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="obs">Observaciones</Label>
                            <Textarea
                                id="obs"
                                placeholder="Notas adicionales..."
                                value={formData.observaciones}
                                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Repuesto"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

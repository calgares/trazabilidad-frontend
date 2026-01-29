import { useState } from 'react';
import { useCatalogos } from '@/hooks/use-catalogos';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ConfiguracionView() {
    const {
        plantas, areas, ubicaciones, tiposEquipo, loading,
        createItem, updateItem, deleteItem
    } = useCatalogos();

    // Interfaces for the component
    interface CatalogColumn {
        key: string;
        label: string;
        type?: 'text' | 'select';
        options?: string[];
    }

    interface CatalogTableProps {
        title: string;
        description: string;
        data: any[];
        tableName: string;
        columns?: CatalogColumn[];
        parentField?: { key: string; label: string; options: any[] } | null;
    }

    // Reusable Catalog Table Component to avoid code duplication
    const CatalogTable = ({
        title,
        description,
        data,
        tableName,
        columns = [],
        parentField = null
    }: CatalogTableProps) => {
        const [isAdding, setIsAdding] = useState(false);
        const [newItemData, setNewItemData] = useState<Record<string, any>>({});
        const [editingId, setEditingId] = useState<string | null>(null);
        const [editData, setEditData] = useState<Record<string, any>>({});

        const handleAdd = async () => {
            // Basic validation for required fields
            const missingFields = columns.filter(col =>
                // Checks if key exists and is truthy. For selects, it ensures a value is picked.
                !newItemData[col.key]
            );

            if (missingFields.length > 0) {
                // ideally show an error, for now we will just not submit
                // console.error("Missing fields", missingFields);
                return;
            }

            await createItem(tableName, newItemData);
            setIsAdding(false);
            setNewItemData({});
        };

        const handleUpdate = async (id: string) => {
            await updateItem(tableName, id, editData);
            setEditingId(null);
        };

        const handleDelete = async (id: string) => {
            if (confirm('¿Estás seguro de eliminar este elemento?')) {
                await deleteItem(tableName, id);
            }
        };

        return (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                        <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Agregar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isAdding && (
                        <div className="mb-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-end">
                            {columns.map(col => (
                                <div key={col.key} className="space-y-2">
                                    <label className="text-sm font-medium">{col.label}</label>
                                    {col.type === 'select' ? (
                                        <Select
                                            value={newItemData[col.key] || ''}
                                            onValueChange={v => setNewItemData({ ...newItemData, [col.key]: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {col.options?.map(opt => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            value={newItemData[col.key] || ''}
                                            onChange={e => setNewItemData({ ...newItemData, [col.key]: e.target.value })}
                                        />
                                    )}
                                </div>
                            ))}
                            {parentField && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{parentField.label}</label>
                                    <Select
                                        value={newItemData[parentField.key] || ''}
                                        onValueChange={v => setNewItemData({ ...newItemData, [parentField.key]: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {parentField.options.map((opt: any) => (
                                                <SelectItem key={opt.id} value={opt.id}>{opt.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleAdd}>Guardar</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                            </div>
                        </div>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
                                {parentField && <TableHead>{parentField.label}</TableHead>}
                                <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item: any) => (
                                <TableRow key={item.id}>
                                    {columns.map(col => (
                                        <TableCell key={col.key}>
                                            {editingId === item.id ? (
                                                col.type === 'select' ? (
                                                    <Select
                                                        value={editData[col.key] !== undefined ? editData[col.key] : item[col.key]}
                                                        onValueChange={v => setEditData({ ...editData, [col.key]: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {col.options?.map(opt => (
                                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        value={editData[col.key] !== undefined ? editData[col.key] : item[col.key]}
                                                        onChange={e => setEditData({ ...editData, [col.key]: e.target.value })}
                                                    />
                                                )
                                            ) : (
                                                <span className={col.key === 'categoria_operativa' ? 'text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded' : ''}>
                                                    {item[col.key]}
                                                </span>
                                            )}
                                        </TableCell>
                                    ))}
                                    {parentField && (
                                        <TableCell>
                                            {parentField.options.find(o => o.id === item[parentField.key])?.nombre || '-'}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {editingId === item.id ? (
                                                <>
                                                    <Button size="icon" variant="ghost" onClick={() => handleUpdate(item.id)}><Save className="h-4 w-4 text-green-500" /></Button>
                                                    <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 text-red-500" /></Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button size="icon" variant="ghost" onClick={() => { setEditingId(item.id); setEditData(item); }}><Edit2 className="h-4 w-4 text-blue-500" /></Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    };

    if (loading) return <div>Cargando configuración...</div>;

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Configuración del Sistema</h1>

            <Tabs defaultValue="plantas" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="plantas">Plantas</TabsTrigger>
                    <TabsTrigger value="areas">Áreas</TabsTrigger>
                    <TabsTrigger value="ubicaciones">Ubicaciones</TabsTrigger>
                    <TabsTrigger value="tipos">Tipos de Equipo</TabsTrigger>
                </TabsList>

                <TabsContent value="plantas" className="mt-6">
                    <CatalogTable
                        title="Plantas y Sedes"
                        description="Gestiona las instalaciones principales."
                        data={plantas}
                        tableName="plantas"
                        columns={[{ key: 'nombre', label: 'Nombre Planta' }, { key: 'ubicacion_geografica', label: 'Ubicación' }]}
                    />
                </TabsContent>

                <TabsContent value="areas" className="mt-6">
                    <CatalogTable
                        title="Áreas y Departamentos"
                        description="Divisiones funcionales dentro de las plantas."
                        data={areas}
                        tableName="areas_departamentos"
                        parentField={{ key: 'planta_id', label: 'Planta Perteneciente', options: plantas }}
                    />
                </TabsContent>

                <TabsContent value="ubicaciones" className="mt-6">
                    <CatalogTable
                        title="Ubicaciones Físicas"
                        description="Lugares específicos dentro de las áreas."
                        data={ubicaciones}
                        tableName="ubicaciones"
                        parentField={{ key: 'area_id', label: 'Área Perteneciente', options: areas }}
                    />
                </TabsContent>

                <TabsContent value="tipos" className="mt-6">
                    <CatalogTable
                        title="Tipos de Equipo"
                        description="Categorías para clasificar los activos."
                        data={tiposEquipo}
                        tableName="tipos_equipo"
                        columns={[
                            { key: 'nombre', label: 'Nombre Tipo' },
                            { key: 'descripcion', label: 'Descripción' },
                            {
                                key: 'categoria_operativa',
                                label: 'Categoría Operativa',
                                type: 'select',
                                options: ['MAQUINARIA_PESADA', 'EQUIPO_MOTORIZADO', 'HERRAMIENTA_ELECTRICA', 'HERRAMIENTA_MENOR']
                            }
                        ]}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

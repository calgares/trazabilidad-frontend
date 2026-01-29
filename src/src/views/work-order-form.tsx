import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkOrders } from '@/hooks/use-work-orders';
import { supabase } from '@/services/supabase';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { ArrowLeft, Loader2 } from 'lucide-react';

export function WorkOrderFormView() {
    const navigate = useNavigate();
    const { createWorkOrder, loading: saving } = useWorkOrders();

    const [equipos, setEquipos] = useState<any[]>([]);
    const [tecnicos, setTecnicos] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        equipo_id: '',
        origen: 'MANUAL',
        prioridad: 'MEDIA',
        descripcion_problema: '',
        tecnico_interno_id: '',
        fecha_programada: ''
    });

    useEffect(() => {
        const fetchResources = async () => {
            const [eq, tec] = await Promise.all([
                supabase
                    .from('equipos')
                    .select('id, nombre, codigo')
                    .eq('estado_operativo', 'EN_OPERACION'),

                supabase
                    .from('perfiles')
                    .select('id, nombre')
                    .order('nombre')
            ]);

            if (eq.data) setEquipos(eq.data);
            if (tec.data) setTecnicos(tec.data);
        };

        fetchResources();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.equipo_id || !formData.descripcion_problema) {
            setError('Faltan campos requeridos');
            return;
        }

        try {
            setError(null);

            await createWorkOrder({
                equipo_id: formData.equipo_id,
                origen: formData.origen as any,
                prioridad: formData.prioridad as any,
                descripcion_problema: formData.descripcion_problema,
                tecnico_interno_id: formData.tecnico_interno_id || undefined,
                fecha_programada: formData.fecha_programada || undefined,
                estado: 'CREADA'
            });

            navigate('/work-orders');

        } catch (err: any) {
            setError(err.message || 'Error al crear la orden de trabajo');
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Button
                variant="ghost"
                onClick={() => navigate('/work-orders')}
                className="mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Nueva Orden de Trabajo</CardTitle>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">

                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Equipo Afectado *</Label>
                            <Select
                                onValueChange={(v) =>
                                    setFormData({ ...formData, equipo_id: v })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Equipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {equipos.map(e => (
                                        <SelectItem key={e.id} value={e.id}>
                                            {e.codigo} - {e.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Origen</Label>
                                <Select
                                    value={formData.origen}
                                    onValueChange={(v) =>
                                        setFormData({ ...formData, origen: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MANUAL">Manual</SelectItem>
                                        <SelectItem value="FALLA">Falla Reportada</SelectItem>
                                        <SelectItem value="PREVENTIVO">Mantenimiento Preventivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Prioridad</Label>
                                <Select
                                    value={formData.prioridad}
                                    onValueChange={(v) =>
                                        setFormData({ ...formData, prioridad: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BAJA">Baja</SelectItem>
                                        <SelectItem value="MEDIA">Media</SelectItem>
                                        <SelectItem value="ALTA">Alta</SelectItem>
                                        <SelectItem value="CRITICA">Crítica</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción del Problema *</Label>
                            <Textarea
                                placeholder="Detalla el trabajo a realizar..."
                                value={formData.descripcion_problema}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        descripcion_problema: e.target.value
                                    })
                                }
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Asignar Técnico</Label>
                                <Select
                                    onValueChange={(v) =>
                                        setFormData({
                                            ...formData,
                                            tecnico_interno_id: v
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sin asignar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tecnicos.map(t => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Fecha Programada</Label>
                                <Input
                                    type="date"
                                    value={formData.fecha_programada}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            fecha_programada: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>

                    </CardContent>

                    <CardFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => navigate('/work-orders')}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={saving}
                        >
                            {saving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Crear Orden
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

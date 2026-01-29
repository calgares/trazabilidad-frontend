import { useState } from 'react';
import { useFallas, type Falla } from '@/hooks/use-fallas';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, AlertOctagon, CheckCircle2, Calendar, HardHat } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useWorkOrders } from '@/hooks/use-work-orders';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export function FallasList() {
    const { fallas, loading, error } = useFallas();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFallas = fallas.filter(falla =>
        falla.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        falla.equipos?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        falla.equipos?.codigo_unico?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSeverityBadge = (severity?: string) => {
        switch (severity) {
            case 'Critica':
                return <Badge className="bg-red-500 hover:bg-red-600"><AlertOctagon className="w-3 h-3 mr-1" /> Crítica</Badge>;
            case 'Mayor':
                return <Badge className="bg-orange-500 hover:bg-orange-600"><AlertTriangle className="w-3 h-3 mr-1" /> Mayor</Badge>;
            case 'Menor':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black"><CheckCircle2 className="w-3 h-3 mr-1" /> Menor</Badge>;
            default:
                return <Badge variant="outline">{severity}</Badge>;
        }
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
            Error al cargar fallas: {error}
        </div>
    );

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Registro de Fallas</h1>
                    <p className="text-slate-500 dark:text-slate-400">Historial de incidencias y averías reportadas</p>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Listado de Fallas</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por equipo o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-slate-200 dark:border-slate-800">
                                <TableHead>Fecha</TableHead>
                                <TableHead>Equipo</TableHead>
                                <TableHead>Gravedad</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Causa Raíz</TableHead>
                                <TableHead>Reportado Por</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFallas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        No se encontraron fallas registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredFallas.map((falla) => (
                                    <TableRow key={falla.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                        <TableCell className="font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                {falla.created_at ? format(new Date(falla.created_at), 'dd/MM/yyyy HH:mm', { locale: es }) : '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{falla.equipos?.nombre || 'Desconocido'}</span>
                                                <span className="text-xs text-slate-500">{falla.equipos?.codigo_unico}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getSeverityBadge(falla.gravedad)}</TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="truncate" title={falla.descripcion ?? ''}>{falla.descripcion}</p>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <span className="text-slate-600 dark:text-slate-300 italic">
                                                {falla.causa_raiz || 'No especificada'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {falla.mantenimiento?.usuario ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
                                                        <HardHat className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <span className="text-sm">
                                                        {falla.mantenimiento.usuario.nombre} {falla.mantenimiento.usuario.apellido}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <CreateOTButton falla={falla} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function CreateOTButton({ falla }: { falla: Falla }) {
    const { createWorkOrderFromFalla } = useWorkOrders();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Verify if OT already exists for this Falla? 
    // Ideally we should check 'work_orders' table but for now we just allow creating one.

    const handleCreate = async () => {
        if (!confirm("¿Generar Orden de Trabajo para esta falla?")) return;
        setLoading(true);
        try {
            const newOt = await createWorkOrderFromFalla(falla);
            alert(`OT Generada: ${newOt.numero_ot}`);
            navigate(`/work-orders/${newOt.id}`);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button size="sm" variant="outline" onClick={handleCreate} disabled={loading} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
            <Briefcase className="h-3 w-3 mr-1" /> Crear OT
        </Button>
    );
}

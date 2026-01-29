import { useUsuarios } from "@/hooks/use-usuarios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UserPlus, Shield, Mail, Calendar, AlertCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function UsuariosList() {
    const { usuarios, roles, loading, error, updateUsuarioRole } = useUsuarios();

    const handleRoleChange = async (userId: string, roleId: string) => {
        const result = await updateUsuarioRole(userId, parseInt(roleId));
        if (!result.success) {
            alert("Error al actualizar el rol: " + result.error);
        }
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
            <div className="p-8 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p>Error al cargar usuarios: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Gestión de Personal</h2>
                    <p className="text-slate-500 dark:text-slate-400">Administre los accesos y roles de los integrantes de la planta.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="mr-2 h-4 w-4" /> Nuevo Usuario
                </Button>
            </div>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900">
                            <TableRow>
                                <TableHead className="w-[300px]">Usuario</TableHead>
                                <TableHead>Rol Actual</TableHead>
                                <TableHead>Fecha de Registro</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuarios.map((u) => (
                                <TableRow key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                {u.nombre.substring(0, 1)}{u.apellido.substring(0, 1)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {u.nombre} {u.apellido}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                                                    <Mail className="h-3 w-3" /> {u.email || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "capitalize",
                                            u.roles?.nombre === 'Administrador' ? 'border-red-200 text-red-600 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30' :
                                                u.roles?.nombre === 'Ingeniero' ? 'border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/30' :
                                                    'border-slate-200 text-slate-500'
                                        )}>
                                            <Shield className="mr-1.5 h-3 w-3" />
                                            {u.roles?.nombre}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        <div className="flex items-center gap-2 text-sm italic">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {u.created_at ? format(new Date(u.created_at), "dd MMM yyyy", { locale: es }) : '---'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 text-sm italic">
                                            <Select
                                                defaultValue={u.role_id?.toString()}
                                                onValueChange={(val) => handleRoleChange(u.id, val)}
                                            >
                                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                                    <SelectValue placeholder="Cambiar Rol" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map(role => (
                                                        <SelectItem key={role.id} value={role.id.toString()}>
                                                            {role.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Nota de Seguridad: Los cambios de roles tienen efecto inmediato en la navegación del usuario.
                </p>
            </div>
        </div>
    );
}

// Utility for colors
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

import { useSystemHealth } from '@/hooks/use-system-health';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Activity, RefreshCw, ShieldCheck, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SystemHealthView() {
    const { health, loading, error, refresh } = useSystemHealth();

    const StatusRow = ({ label, status }: { label: string; status: boolean }) => (
        <div className="flex items-center justify-between py-3 border-b last:border-0 border-slate-100 dark:border-slate-800">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
            <div className="flex items-center gap-2">
                {status ? (
                    <>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">OK</span>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </>
                ) : (
                    <>
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">ERROR</span>
                        <XCircle className="h-5 w-5 text-red-500" />
                    </>
                )}
            </div>
        </div>
    );

    if (loading && !health) {
        return <div className="p-8 text-center text-slate-500">Cargando diagnóstico...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error al cargar diagnóstico: {error}</p>
                <Button onClick={refresh} variant="outline" className="mt-4">Reintentar</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <Activity className="h-8 w-8 text-blue-600" />
                        Salud del Sistema
                    </h1>
                    <p className="text-slate-500 mt-2">Diagnóstico técnico de integridad y seguridad.</p>
                </div>
                <Button onClick={refresh} variant="outline" disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Refrescar Diagnóstico
                </Button>
            </div>

            {/* Overall Status Card */}
            <Card className={cn(
                "border-l-4 shadow-md",
                health?.overall_status ? "border-l-green-500 bg-green-50/50 dark:bg-green-900/10" : "border-l-red-500 bg-red-50/50 dark:bg-red-900/10"
            )}>
                <CardContent className="p-6 flex items-center gap-4">
                    {health?.overall_status ? (
                        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {health?.overall_status ? "Sistema Operativo (OK)" : "Sistema con Problemas Detectados"}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {health?.overall_status
                                ? "Todas las verificaciones críticas han pasado exitosamente."
                                : "Se requieren acciones correctivas en los puntos señalados."}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Database Views Check */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Database className="h-5 w-5 text-indigo-500" />
                            Integridad de Vistas SQL
                        </CardTitle>
                        <CardDescription>Verifica que las vistas de reportes existan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StatusRow label="Vista Dashboard KPIs" status={health?.dashboard_view_ok ?? false} />
                        <StatusRow label="Vista Reporte Equipos" status={health?.reportes_view_ok ?? false} />
                        <StatusRow label="Vista Reporte Fallas" status={health?.fallas_view_ok ?? false} />
                        <StatusRow label="Vista Reporte Preventivos" status={health?.preventivos_view_ok ?? false} />
                    </CardContent>
                </Card>

                {/* Security Check */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="h-5 w-5 text-indigo-500" />
                            Seguridad RLS
                        </CardTitle>
                        <CardDescription>Verifica que RLS esté activo en tablas críticas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StatusRow label="RLS en Tabla Equipos" status={health?.rls_equipos_enabled ?? false} />
                        <StatusRow label="RLS en Tabla Fallas" status={health?.rls_fallas_enabled ?? false} />
                        <StatusRow label="RLS en Tabla Mantenimientos" status={health?.rls_mantenimientos_enabled ?? false} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

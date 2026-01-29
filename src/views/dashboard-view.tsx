import { useDashboard } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardView() {
    const { kpis, loading } = useDashboard();

    if (loading) {
        return <div className="p-10 text-center">Cargando dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Panel Principal</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Equipos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{kpis?.total_equipos || 0}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{kpis?.equipos_disponibles || 0}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Fallas Abiertas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{kpis?.fallas_abiertas || 0}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Fallas Críticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-600">
                            {kpis?.fallas_criticas || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

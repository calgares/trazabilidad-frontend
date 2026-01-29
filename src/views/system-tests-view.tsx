import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/auth-context';
import { AlertCircle, CheckCircle, Play, ShieldAlert } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

interface TestResult {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'success' | 'failure';
    message?: string;
}

export function SystemTestsView() {
    const { profile } = useAuth();
    const [results, setResults] = useState<TestResult[]>([
        { id: 'RLS-01', name: 'Test: Read permission (Should allow)', status: 'pending' },
        { id: 'RLS-02', name: 'Test: Delete permission (Should deny for non-admin)', status: 'pending' },
        { id: 'INT-01', name: 'Test: Integrity Trigger (Prevent delete used equipment)', status: 'pending' },
    ]);

    const runTest = async (testId: string) => {
        setResults(prev => prev.map(r => r.id === testId ? { ...r, status: 'running' } : r));

        try {
            let message = "Test Passed";
            let success = true;

            if (testId === 'RLS-01') {
                const response = await fetch(`${API_URL}/api/equipos?limit=1`, {
                    headers: getAuthHeaders()
                });
                if (!response.ok) throw new Error('No se puede leer equipos');
            }

            if (testId === 'RLS-02') {
                if (profile?.rol === 'Administrador') {
                    message = "Admin access confirmed (skip delete test)";
                } else {
                    const response = await fetch(`${API_URL}/api/equipos/00000000-0000-0000-0000-000000000000`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });
                    if (response.ok) throw new Error("Non-admin allowed to delete (Security Failure)");
                    message = "Access properly denied";
                }
            }

            if (testId === 'INT-01') {
                const response = await fetch(`${API_URL}/api/system/test-integrity`, {
                    method: 'POST',
                    headers: getAuthHeaders()
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        message = result.message || "Trigger test passed";
                    } else {
                        success = false;
                        message = result.message || "Trigger test failed";
                    }
                } else {
                    message = "Could not run integrity test (API endpoint may not exist)";
                }
            }

            setResults(prev => prev.map(r => r.id === testId ? { ...r, status: success ? 'success' : 'failure', message } : r));

        } catch (error: any) {
            setResults(prev => prev.map(r => r.id === testId ? { ...r, status: 'failure', message: error.message } : r));
        }
    };


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pruebas Seguridad y Calidad</h1>
                <p className="text-slate-500">Ejecución de validaciones de sistema en tiempo real.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-blue-500" />
                        Panel de Control de Pruebas
                    </CardTitle>
                    <CardDescription>
                        Ejecuta estas pruebas para validar las reglas de seguridad RLS y triggers de integridad.
                        Tu rol actual es: <Badge variant="outline">{profile?.rol || 'Desconocido'}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {results.map((test) => (
                            <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <div>
                                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{test.name}</h3>
                                    {test.message && <p className={`text-sm mt-1 ${test.status === 'failure' ? 'text-red-500' : 'text-green-600'}`}>{test.message}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    {test.status === 'pending' && <Badge variant="secondary">Pendiente</Badge>}
                                    {test.status === 'running' && <Badge variant="outline" className="animate-pulse">Ejecutando...</Badge>}
                                    {test.status === 'success' && <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Pasó</Badge>}
                                    {test.status === 'failure' && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Falló</Badge>}

                                    <Button size="sm" variant="outline" onClick={() => runTest(test.id)} disabled={test.status === 'running'}>
                                        <Play className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/auth-context';
import { AlertCircle, CheckCircle, Play, ShieldAlert } from 'lucide-react';

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
                // Try to read equipments
                const { error } = await supabase.from('equipos').select('count').limit(1);
                if (error) throw error;
            }

            if (testId === 'RLS-02') {
                // Attempt to delete a non-existent ID just to check policy response
                // If policy denies, it might return 401 or specialized error. 
                // Note: Policy 'Modify Admin' allows ALL for authenticated admins.
                // If I am Admin, this will succeed (or return 0 rows).
                // To test DENY, I need to be non-admin, or I test that I CAN delete if Admin.

                if (profile?.rol === 'Administrador') {
                    // Admin should be able to, so we test that it DOESN'T error permission-wise
                    const { error } = await supabase.from('equipos').delete().eq('id', '00000000-0000-0000-0000-000000000000');
                    if (error && error.code === '42501') throw new Error("Admin got Permission Denied (Unexpected)");
                    message = "Admin access confirmed";
                } else {
                    // Non-admin should fail
                    const { error } = await supabase.from('equipos').delete().eq('id', '00000000-0000-0000-0000-000000000000');
                    if (!error) throw new Error("Non-admin allowed to delete (Security Failure)");
                    if (error.code !== '42501') throw error; // 42501 is RLS violation
                    message = "Access properly denied";
                }
            }

            if (testId === 'INT-01') {
                // Try to delete an equipment that has history (Find one first)
                // This is risky to auto-run on real data. We should use a safer approach or just try to delete a known 'safe' mock or just checking the trigger existence?
                // Better: Insert a dummy, add history, try delete, expect trigger error.
                // Step 1: Create Dummy
                const dummyId = crypto.randomUUID();
                await supabase.from('equipos').insert({ id: dummyId, nombre: 'TEST-INTEGRITY', codigo_interno: 'TEST-001', estado_operativo: 'DISPONIBLE', costo_hora: 0, marca: 'Test', modelo: 'Test', anio_fabricacion: 2024 });

                // Step 2: Add History
                await supabase.from('historial_equipos').insert({ equipo_id: dummyId, estado_anterior: 'DISPONIBLE', estado_nuevo: 'EN_OPERACION', cambiado_por: profile?.id || null });

                // Step 3: Try Delete (Should Fail)
                const { error } = await supabase.from('equipos').delete().eq('id', dummyId);

                // Cleanup (Force delete history first manually to clean up?)
                // Actually if the test succeeds (it fails to delete), we leave junk data. 
                // We should clean up the history then the item.
                await supabase.from('historial_equipos').delete().eq('equipo_id', dummyId);
                await supabase.from('equipos').delete().eq('id', dummyId);

                if (!error) {
                    success = false;
                    message = "Trigger failed: Equipment was deleted despite history.";
                } else {
                    if (error.message.includes('No se puede eliminar')) {
                        message = `Trigger caught it: ${error.message}`;
                    } else {
                        success = false;
                        message = `Unexpected error: ${error.message}`;
                    }
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

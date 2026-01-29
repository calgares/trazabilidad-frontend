import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Shield, Loader2, AlertCircle } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        try {
            const result = await signIn(email, password);

            if (result.error) {
                setError(result.error);
                return;
            }

            navigate(from, { replace: true });
        } catch (err: unknown) {
            console.error("Login error caught:", err);
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Decorative Gradients */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />

            <div className="z-10 w-full max-w-md px-4">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 text-white">
                        <Shield className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 italic">Trazabilidad HQ</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gestión Centralizada de Equipos y Mantenimiento</p>
                </div>

                <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Bienvenido</CardTitle>
                        <CardDescription>
                            Introduzca sus credenciales para acceder al sistema
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4 pt-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <p>{error}</p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nombre@empresa.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Button variant="link" className="px-0 h-auto text-xs text-blue-600">
                                        ¿Olvidó su contraseña?
                                    </Button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 mt-2">
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    'Ingresar'
                                )}
                            </Button>
                            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                                Al ingresar, usted acepta los términos de uso y políticas de seguridad industrial.
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

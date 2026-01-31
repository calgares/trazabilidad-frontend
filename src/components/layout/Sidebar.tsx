import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Settings,
    Wrench,
    History,
    Users,
    Database,
    ClipboardList,
    AlertTriangle,
    LogOut,
    ShieldCheck,
    FileBarChart,
    HelpCircle,
    Bot,
    Activity,
    Briefcase,
    BookOpen
} from "lucide-react";

// ... existing code ...

const mainMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: ClipboardList, label: "Equipos", path: "/equipos" },
    { icon: Wrench, label: "Mantenimientos", path: "/mantenimientos" },
    { icon: AlertTriangle, label: "Fallas", path: "/fallas" },
    { icon: Briefcase, label: "Órdenes de Trabajo", path: "/work-orders" },
    { icon: History, label: "Historial Diario", path: "/historial-diario" },
    { icon: FileBarChart, label: "Reportes", path: "/reportes" },
    { icon: Bot, label: "Asistente ISO", path: "/asistente-iso" },
    { icon: BookOpen, label: "Normas ISO", path: "/normas-iso" },
    { icon: Activity, label: "Salud del Sistema", path: "/system-health" },
    { icon: HelpCircle, label: "Centro de Ayuda", path: "/ayuda" },
];

const adminMenuItems = [
    { icon: Users, label: "Usuarios", path: "/usuarios", roles: ['Administrador'] },
    { icon: Database, label: "Auditoría", path: "/auditoria", roles: ['Administrador'] },
    { icon: ShieldCheck, label: "Pruebas Sistema", path: "/pruebas-sistema", roles: ['Administrador', 'Ingeniero'] },
    { icon: Settings, label: "Configuración", path: "/configuracion", roles: ['Administrador'] }, // Moved Config to admin or keep generic? Let's keep Config general or Admin? User asked for Admin section. Let's put Config in Admin for now or keep separate. User didn't specify Config. I'll put Config at bottom or keep in Utils.
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const location = useLocation();
    const { profile, signOut } = useAuth();

    // Helper to filter
    const filterItems = (items: any[]) => items.filter(item => {
        if (!item.roles) return true;
        return item.roles.includes(profile?.roles?.nombre || profile?.rol); // Handle both structure possibilities if inconsistent
    });

    const filteredMain = filterItems(mainMenuItems);
    const filteredAdmin = filterItems(adminMenuItems);

    return (
        <div className={cn("flex flex-col w-64 h-screen bg-slate-900 text-slate-300 border-r border-slate-800", className)}>
            {/* Header */}
            <div className="flex items-center justify-center h-16 border-b border-slate-800">
                <span className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-blue-500" />
                    Trazabilidad HQ
                </span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6">
                {/* Main Menu */}
                <nav className="px-3 space-y-1">
                    {filteredMain.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                location.pathname === item.path
                                    ? "bg-slate-800 text-white"
                                    : "hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                    location.pathname === item.path
                                        ? "text-blue-500"
                                        : "text-slate-400 group-hover:text-blue-400"
                                )}
                            />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Admin Section */}
                {filteredAdmin.length > 0 && (
                    <div className="px-3">
                        <h3 className="mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Administración
                        </h3>
                        <nav className="space-y-1">
                            {filteredAdmin.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                        location.pathname === item.path
                                            ? "bg-slate-800 text-white"
                                            : "hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                            location.pathname === item.path
                                                ? "text-blue-500"
                                                : "text-slate-400 group-hover:text-blue-400"
                                        )}
                                    />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>

            {/* Footer User Profile ... */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs uppercase">
                        {profile?.nombre?.substring(0, 1) || 'U'}{profile?.apellido?.substring(0, 1) || 'N'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {profile?.nombre} {profile?.apellido}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{profile?.roles?.nombre || 'Cargando...'}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-2 h-8 text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}

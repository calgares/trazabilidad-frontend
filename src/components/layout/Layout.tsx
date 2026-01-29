import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ModeToggle } from "./ModeToggle";
import { Outlet } from "react-router-dom";

interface LayoutProps {
    children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 transition-colors">
                    <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Sistema de Trazabilidad
                    </h1>

                    <div className="flex items-center gap-6">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Planta Central - Área A
                        </span>

                        <ModeToggle />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* AQUÍ ESTÁ LA CLAVE */}
                        {children || <Outlet />}
                    </div>
                </div>
            </main>
        </div>
    );
}

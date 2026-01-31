import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ModeToggle } from "./ModeToggle";
import { Outlet } from "react-router-dom";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
    children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Desktop Sidebar - Hidden on mobile */}
            <Sidebar className="hidden md:flex" />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header - Visible only on mobile */}
                <header className="md:hidden h-14 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 z-20">
                    <div className="flex items-center gap-3">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 border-r-slate-800 bg-slate-900 w-64">
                                <Sidebar className="flex border-none" />
                            </SheetContent>
                        </Sheet>
                        <span className="font-semibold text-white">Trazabilidad HQ</span>
                    </div>
                    <ModeToggle />
                </header>

                {/* Desktop Header - Hidden on mobile */}
                <header className="hidden md:flex h-16 items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 transition-colors">
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

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
                        {children || <Outlet />}
                    </div>
                </div>
            </main>
        </div>
    );
}

import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

import { ThemeProvider } from "@/context/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { Layout } from "@/components/layout/Layout";
import { RequireAuth } from "@/components/layout/RequireAuth";

import { Login } from "@/views/login";
import { EquiposList } from "@/views/equipos-list";
import { EquipoDetalle } from "@/views/equipo-detalle";
import { MantenimientosList } from "@/views/mantenimientos-list";
import { UsuariosList } from "@/views/usuarios-list";
import { AuditoriaList } from "@/views/auditoria-list";
import { HistorialDiario } from "@/views/historial-diario";
import { DashboardView } from "@/views/dashboard-view";
import { ReportesView } from "@/views/reportes-view";
import { SystemTestsView } from "@/views/system-tests-view";
import { HelpCenterView } from "@/views/help-center-view";
import { IsoAssistantView } from "@/views/iso-assistant-view";
import { SystemHealthView } from "@/views/system-health-view";
import { WorkOrdersListView } from "@/views/work-orders-list";
import { WorkOrderFormView } from "@/views/work-order-form";
import { WorkOrderDetailView } from "@/views/work-order-detail";
import { ConfiguracionView } from "@/views/configuracion-view";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="trazabilidad-theme">
      <Router>
        <AuthProvider>

          <Routes>

            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
              <Route
                element={
                  <Layout>
                    <Outlet />
                  </Layout>
                }
              >
                <Route path="/" element={<DashboardView />} />

                <Route path="/equipos" element={<EquiposList />} />
                <Route path="/equipos/:id" element={<EquipoDetalle />} />

                <Route path="/mantenimientos" element={<MantenimientosList />} />

                <Route path="/work-orders" element={<WorkOrdersListView />} />
                <Route path="/work-orders/new" element={<WorkOrderFormView />} />
                <Route path="/work-orders/:id" element={<WorkOrderDetailView />} />

                <Route path="/fallas" element={<ReportesView />} />
                <Route path="/reportes" element={<ReportesView />} />

                <Route path="/historial-diario" element={<HistorialDiario />} />

                <Route path="/ayuda" element={<HelpCenterView />} />
                <Route path="/asistente-iso" element={<IsoAssistantView />} />
                <Route path="/system-health" element={<SystemHealthView />} />
                <Route path="/configuracion" element={<ConfiguracionView />} />

                <Route path="/auditoria" element={<AuditoriaList />} />
                <Route path="/pruebas-sistema" element={<SystemTestsView />} />
                <Route path="/usuarios" element={<UsuariosList />} />

              </Route>
            </Route>

          </Routes>

        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

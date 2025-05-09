/// Este componente es el encargado de manejar las rutas de la aplicación y renderizar los componentes correspondientes a cada ruta
//
// Se importan los componentes y hooks necesarios

"use client";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Páginas públicas
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import NotFound from "./pages/public/NotFound";

// Panel principal
import Dashboard from "./pages/dashboard/Dashboard";

// Módulos del sistema
import Perfil from "./pages/usuarios/Perfil";
import Usuarios from "./pages/usuarios/Usuarios";
import Turnos from "./pages/turnos/Turnos";
import NuevoTurno from "./pages/turnos/NuevoTurno";
import Medicos from "./pages/medicos/Medicos";
import Servicios from "./pages/servicios/Servicios";
import Categories from "./pages/categorias/Categorias";
import Notificaciones from "./pages/notificaciones/Notificaciones";
import Calendario from "./pages/calendario/Calendario";

// Historial Médico
import HistorialMedico from "./pages/medicos/HistorialMedico";
import HistorialMedicoDetalle from "./pages/medicos/HistorialMedicoDetalle";
import HistorialMedicoForm from "./pages/medicos/HistorialMedicoForm";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route
          path="login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="register"
          element={user ? <Navigate to="/dashboard" /> : <Register />}
        />
      </Route>

      {/* Rutas protegidas */}
      <Route
        path="/dashboard"
        element={user ? <DashboardLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Perfil />} />
        <Route path="appointments" element={<Turnos />} />
        <Route path="appointments/new" element={<NuevoTurno />} />
        <Route path="doctors" element={<Medicos />} />
        <Route path="services" element={<Servicios />} />
        <Route path="categories" element={<Categories />} />
        <Route
          path="users"
          element={
            user?.rol === "admin" ? <Usuarios /> : <Navigate to="/dashboard" />
          }
        />
        <Route path="notifications" element={<Notificaciones />} />
        <Route path="calendar" element={<Calendario />} />

        {/* Rutas de historial médico */}
        <Route path="medical-history" element={<HistorialMedico />} />
        <Route
          path="medical-history/new"
          element={
            user?.rol === "admin" || user?.rol === "medico" ? (
              <HistorialMedicoForm />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="medical-history/:id"
          element={<HistorialMedicoDetalle />}
        />
        <Route
          path="medical-history/:id/edit"
          element={
            user?.rol === "admin" || user?.rol === "medico" ? (
              <HistorialMedicoForm />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="medical-history/patient/:pacienteId/new"
          element={
            user?.rol === "admin" || user?.rol === "medico" ? (
              <HistorialMedicoForm />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

// Este archivo contiene el contexto de autenticación de la aplicación
// y proporciona funciones para iniciar sesión, cerrar sesión, registrar
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastContext";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Cargar perfil completo del usuario
  const loadFullProfile = async (userId) => {
    try {
      // Obtener datos completos del perfil
      const response = await api.get(`/usuarios/${userId}`);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Error al cargar el perfil completo:", error);
      return null;
    }
  };

  // Verificar si hay un usuario autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get("/auth/perfil");

          // Guardar datos básicos del usuario
          setUser(response.data);

          // Cargar el perfil completo si existe un ID de usuario
          if (response.data && response.data.id) {
            await loadFullProfile(response.data.id);
          }
        } catch (error) {
          console.error("Error al verificar autenticación:", error);
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { token, usuario } = response.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Guardar datos básicos del usuario
      setUser(usuario);

      // Cargar perfil completo después del login
      if (usuario && usuario.id) {
        await loadFullProfile(usuario.id);
      }

      showToast("Inicio de sesión exitoso", "success");
      navigate("/dashboard");

      return true;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      showToast(
        error.response?.data?.mensaje || "Error al iniciar sesión",
        "error"
      );
      return false;
    }
  };

  // Función para registrarse
  const register = async (userData) => {
    try {
      const response = await api.post("/auth/registro", userData);
      const { usuario } = response.data; // No necesitas el token aquí

      // Mostrar un mensaje de éxito
      showToast("Registro exitoso", "success");

      // Redirigir al login
      navigate("/login");

      return true;
    } catch (error) {
      console.error("Error al registrarse:", error);
      showToast(
        error.response?.data?.mensaje || "Error al registrarse",
        "error"
      );
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      showToast("Sesión cerrada", "info");
      navigate("/login");
    }
  };

  // Función para actualizar el perfil
  const updateProfile = async (userData) => {
    try {
      const response = await api.put(`/usuarios/${user.id}`, userData);

      // Actualizar estado con los datos devueltos por la API
      if (response.data && response.data.usuario) {
        setUser({ ...user, ...response.data.usuario });
      } else {
        // Si la API no devuelve los datos actualizados, cargar perfil completo
        await loadFullProfile(user.id);
      }

      return true;
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      showToast(
        error.response?.data?.mensaje || "Error al actualizar perfil",
        "error"
      );
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegister && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (isRegister) {
      console.log("Registro:", { nombre: formData.nombre, email: formData.email, password: formData.password });
      alert("Registro exitoso");
    } else {
      console.log("Login:", { email: formData.email, password: formData.password });
      alert("Login exitoso");
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setFormData({ nombre: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div>
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Auto<span className="text-blue-500">Elite</span>
            </h1>
          </Link>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Encuentra el coche<br />de tus sueños.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Accede a nuestro catálogo exclusivo de vehículos nuevos y de ocasión con las mejores condiciones de financiación.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-slate-500 text-sm mt-1">Vehículos disponibles</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">15</p>
              <p className="text-slate-500 text-sm mt-1">Marcas premium</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-slate-500 text-sm mt-1">Clientes satisfechos</p>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-sm">
          © 2026 AutoElite. Todos los derechos reservados.
        </p>
      </div>

      <div className="w-full lg:w-1/2 bg-slate-950 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-10">
            <Link href="/">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Auto<span className="text-blue-500">Elite</span>
              </h1>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">
              {isRegister ? "Crear una cuenta" : "Bienvenido de nuevo"}
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              {isRegister
                ? "Regístrate para acceder a nuestro catálogo"
                : "Inicia sesión para continuar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Juan García"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Contraseña
                </label>
                {!isRegister && (
                  <a href="#" className="text-xs text-blue-500 hover:text-blue-400">
                    ¿Olvidaste tu contraseña?
                  </a>
                )}
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="••••••••"
              />
            </div>

            {isRegister && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm cursor-pointer"
            >
              {isRegister ? "Crear cuenta" : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
            <button
              onClick={toggleMode}
              className="text-blue-500 hover:text-blue-400 font-medium cursor-pointer"
            >
              {isRegister ? "Inicia sesión" : "Regístrate"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

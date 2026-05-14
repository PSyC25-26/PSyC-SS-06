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
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegister && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const response = await fetch(
          "http://localhost:8080/api/usuarios/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: formData.nombre,
              email: formData.email,
              password: formData.password,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.text();
          setError(data || "Error al registrarse");
          setLoading(false);
          return;
        }

        setIsRegister(false);
        setFormData({
          nombre: "",
          email: formData.email,
          password: "",
          confirmPassword: "",
        });
        setError("");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        setError("Correo o contraseña incorrectos");
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch {
      setError("No se pudo conectar con el servidor");
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setFormData({ nombre: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen flex">
      {/* COLUMNA EDITORIAL — oscura, ocupa el 55% en desktop */}
      <aside className="hidden lg:flex lg:w-[55%] bg-ink text-bone flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Grano sobre el negro */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        {/* Línea decorativa vertical */}
        <div className="absolute left-12 xl:left-16 top-0 bottom-0 w-px bg-bone/15" />
        {/* Cruz minimal arriba derecha, como anclaje */}
        <div className="absolute top-12 right-12 xl:top-16 xl:right-16 flex items-center gap-3 text-bone/60">
          <span className="kicker !text-bone/60">Pasaporte</span>
          <span className="dot bg-bone/60" />
        </div>

        <header className="relative z-10 pl-8 xl:pl-10">
          <Link
            href="/"
            className="inline-flex items-baseline gap-3 group"
          >
            <span
              className="text-3xl"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: '"opsz" 144, "SOFT" 60',
                fontStyle: "italic",
              }}
            >
              AutoElite
            </span>
            <span className="kicker !text-bone/60">est. 2026</span>
          </Link>
        </header>

        <div className="relative z-10 pl-8 xl:pl-10 max-w-xl">
          <p className="kicker !text-rust mb-6">
            § Boletín interno{" "}
            <span className="dot bg-rust mx-2 align-middle" /> N.º 014
          </p>
          <p
            className="text-5xl xl:text-[4.4rem] leading-[0.95] tracking-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: '"opsz" 144, "SOFT" 40',
            }}
          >
            El coche correcto
            <br />
            <em
              className="italic"
              style={{
                fontVariationSettings: '"opsz" 144, "SOFT" 100',
                color: "#d9a86a",
              }}
            >
              espera al cliente
            </em>
            <br />
            correcto.
          </p>
          <p className="mt-8 text-bone/70 max-w-md leading-relaxed text-[1.02rem]">
            Accede a tu cuenta para guardar fichas, agendar visitas en showroom
            y recibir el catálogo de cada nueva entrega antes que nadie.
          </p>
        </div>

        <footer className="relative z-10 pl-8 xl:pl-10 grid grid-cols-3 gap-8">
          <div>
            <p className="kicker !text-bone/50">Showroom</p>
            <p className="mt-2 text-bone/90 leading-snug">
              Velázquez 64
              <br />
              Madrid
            </p>
          </div>
          <div>
            <p className="kicker !text-bone/50">Horario</p>
            <p className="mt-2 text-bone/90 leading-snug">
              Lun — Sáb
              <br />
              10 — 20h
            </p>
          </div>
          <div>
            <p className="kicker !text-bone/50">Contacto</p>
            <p className="mt-2 text-bone/90 leading-snug">
              +34 910
              <br />
              000 000
            </p>
          </div>
        </footer>
      </aside>

      {/* COLUMNA DEL FORMULARIO — clara, 45% en desktop */}
      <main className="paper-grain w-full lg:w-[45%] bg-bone flex flex-col">
        {/* Mini barra superior con volver */}
        <div className="px-6 lg:px-12 py-6 flex items-center justify-between border-b border-line-soft">
          <Link
            href="/"
            className="text-[0.72rem] tracking-[0.22em] uppercase text-ink-soft hover:text-ink ed-underline"
          >
            ← Volver
          </Link>
          <div className="lg:hidden">
            <span
              className="text-xl"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: '"opsz" 100, "SOFT" 60',
                fontStyle: "italic",
              }}
            >
              AutoElite
            </span>
          </div>
          <span className="kicker hidden lg:inline">
            {isRegister ? "Registro" : "Acceso"}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12">
          <div className="w-full max-w-md">
            <p className="kicker mb-4">
              § {isRegister ? "Nuevo cliente" : "Cliente existente"}
            </p>
            <h1
              className="display text-5xl md:text-6xl"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 40' }}
            >
              {isRegister ? (
                <>
                  Crea tu
                  <br />
                  <em>cuenta.</em>
                </>
              ) : (
                <>
                  Bienvenido
                  <br />
                  de <em>nuevo.</em>
                </>
              )}
            </h1>
            <p className="text-ink-soft mt-5 leading-relaxed">
              {isRegister
                ? "Solo necesitamos lo básico. Podrás completar el resto desde tu perfil."
                : "Introduce tus datos para acceder a tu cuenta de cliente."}
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-2">
              {isRegister && (
                <div>
                  <label
                    htmlFor="nombre"
                    className="kicker block mb-1"
                  >
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="field"
                    placeholder="Juan García"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="kicker block mb-1 mt-5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="field"
                  placeholder="tu@correo.com"
                />
              </div>

              <div>
                <div className="flex items-end justify-between mt-5">
                  <label htmlFor="password" className="kicker block mb-1">
                    Contraseña
                  </label>
                  {!isRegister && (
                    <span className="kicker !text-ink-muted">
                      Mínimo 6 caracteres
                    </span>
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
                  className="field"
                  placeholder="••••••••"
                />
              </div>

              {isRegister && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="kicker block mb-1 mt-5"
                  >
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
                    className="field"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && (
                <p
                  className="mt-6 text-rust text-sm leading-snug border-l-2 border-rust pl-3"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-ink w-full mt-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Procesando…"
                  : isRegister
                  ? "Crear cuenta"
                  : "Acceder"}
                {!loading && <span aria-hidden>→</span>}
              </button>
            </form>

            <div className="rule mt-10" />
            <p className="text-center text-ink-soft text-sm mt-6">
              {isRegister
                ? "¿Ya tienes una cuenta?"
                : "¿Aún no tienes cuenta?"}{" "}
              <button
                onClick={toggleMode}
                className="text-ink ed-underline cursor-pointer ml-1"
              >
                {isRegister ? "Accede" : "Regístrate"}
              </button>
            </p>
          </div>
        </div>

        <div className="px-6 lg:px-12 py-5 border-t border-line-soft flex items-center justify-between text-[0.7rem] tracking-[0.22em] uppercase text-ink-muted">
          <span>© 2026 AutoElite</span>
          <span>Madrid · España</span>
        </div>
      </main>
    </div>
  );
}

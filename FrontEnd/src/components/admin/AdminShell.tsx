"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminShellProps {
  children: React.ReactNode;
}

interface UsuarioAPI {
  id: number;
  email: string;
  esAdmin: boolean;
}

function decodeJwtSubject(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "ok" | "denied">(
    "checking"
  );
  const [me, setMe] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const email = decodeJwtSubject(token);
    if (!email) {
      localStorage.removeItem("token");
      router.replace("/login");
      return;
    }

    fetch("http://localhost:8080/api/usuarios")
      .then((r) => (r.ok ? r.json() : []))
      .then((users: UsuarioAPI[]) => {
        const yo = users.find((u) => u.email === email);
        if (!yo || !yo.esAdmin) {
          setStatus("denied");
          return;
        }
        setMe(email);
        setStatus("ok");
      })
      .catch(() => setStatus("denied"));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (status === "checking") {
    return (
      <div className="paper-grain min-h-screen bg-bone text-ink flex items-center justify-center">
        <div className="text-center">
          <p className="kicker mb-3">§ Verificando credenciales</p>
          <p
            className="display text-3xl"
            style={{ fontVariationSettings: '"opsz" 100, "SOFT" 50' }}
          >
            Un momento…
          </p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="paper-grain min-h-screen bg-bone text-ink flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="kicker !text-rust mb-3">§ Acceso restringido</p>
          <p
            className="display text-5xl mb-4"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            Esta puerta no
            <br />
            es <em>para ti</em>.
          </p>
          <p className="text-ink-soft mb-8 leading-relaxed">
            Solo el equipo con permisos de administración puede entrar a la
            trastienda. Si crees que es un error, vuelve a iniciar sesión.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/" className="btn-ghost">
              Volver al sitio
            </Link>
            <button onClick={handleLogout} className="btn-ink">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (path: string) =>
    path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);

  return (
    <div className="paper-grain min-h-screen bg-bone text-ink">
      <nav className="fixed top-0 left-0 right-0 z-30 bg-bone/90 backdrop-blur-sm border-b border-line-soft">
        <div className="max-w-[1380px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
          <Link href="/admin" className="flex items-baseline gap-3 group">
            <span
              className="text-2xl tracking-tight"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: '"opsz" 144, "SOFT" 60',
                fontStyle: "italic",
              }}
            >
              AutoElite
            </span>
            <span className="kicker hidden sm:inline group-hover:text-rust transition-colors">
              Trastienda
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/admin"
              className={`tab ${isActive("/admin") ? "is-active" : ""}`}
            >
              Resumen
            </Link>
            <Link
              href="/admin/coches"
              className={`tab ${isActive("/admin/coches") ? "is-active" : ""}`}
            >
              Inventario
            </Link>
            <Link
              href="/admin/usuarios"
              className={`tab ${
                isActive("/admin/usuarios") ? "is-active" : ""
              }`}
            >
              Clientela
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <span
              className="kicker hidden lg:inline truncate max-w-[200px]"
              title={me}
            >
              {me}
            </span>
            <Link
              href="/"
              className="kicker !text-ink-soft hover:!text-ink ed-underline hidden sm:inline"
            >
              Ver sitio
            </Link>
            <button
              onClick={handleLogout}
              className="kicker !text-ink-soft hover:!text-rust transition-colors cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Tabs móvil */}
        <div className="md:hidden flex gap-6 px-6 pb-3 overflow-x-auto no-scrollbar">
          <Link
            href="/admin"
            className={`tab shrink-0 ${isActive("/admin") ? "is-active" : ""}`}
          >
            Resumen
          </Link>
          <Link
            href="/admin/coches"
            className={`tab shrink-0 ${
              isActive("/admin/coches") ? "is-active" : ""
            }`}
          >
            Inventario
          </Link>
          <Link
            href="/admin/usuarios"
            className={`tab shrink-0 ${
              isActive("/admin/usuarios") ? "is-active" : ""
            }`}
          >
            Clientela
          </Link>
        </div>
      </nav>

      {/* Spacer del alto del nav (mobile incluye la fila de tabs) */}
      <div className="h-32 md:h-20" aria-hidden />

      {children}
    </div>
  );
}

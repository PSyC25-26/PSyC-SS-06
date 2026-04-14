"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  esAdmin: boolean;
}

export default function AdminPanel() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:8080/api/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Auto<span className="text-blue-500">Elite</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/coches"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Añadir coche
            </Link>
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Volver
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-2">Panel de administración</h1>
        <p className="text-slate-500 text-sm mb-8">
          Gestión de usuarios registrados
        </p>

        {loading ? (
          <p className="text-slate-400">Cargando...</p>
        ) : usuarios.length === 0 ? (
          <p className="text-slate-500">No hay usuarios registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="pb-3 pr-6 text-slate-500 font-medium">ID</th>
                  <th className="pb-3 pr-6 text-slate-500 font-medium">
                    Nombre
                  </th>
                  <th className="pb-3 pr-6 text-slate-500 font-medium">
                    Email
                  </th>
                  <th className="pb-3 pr-6 text-slate-500 font-medium">
                    Teléfono
                  </th>
                  <th className="pb-3 text-slate-500 font-medium">Rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="border-b border-slate-800/50 hover:bg-slate-900/50"
                  >
                    <td className="py-4 pr-6 text-slate-500">{usuario.id}</td>
                    <td className="py-4 pr-6">
                      {usuario.nombre} {usuario.apellidos || ""}
                    </td>
                    <td className="py-4 pr-6 text-slate-400">
                      {usuario.email}
                    </td>
                    <td className="py-4 pr-6 text-slate-400">
                      {usuario.telefono || "—"}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          usuario.esAdmin
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {usuario.esAdmin ? "Admin" : "Cliente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-slate-600 text-xs mt-6">
          Total: {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

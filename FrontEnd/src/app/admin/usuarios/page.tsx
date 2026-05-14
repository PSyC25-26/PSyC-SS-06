"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import SlideOver from "@/components/admin/SlideOver";

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  esAdmin: boolean;
  password?: string;
}

interface UsuarioForm {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  password: string;
  esAdmin: boolean;
}

const FORM_VACIO: UsuarioForm = {
  nombre: "",
  apellidos: "",
  email: "",
  telefono: "",
  password: "",
  esAdmin: false,
};

type Filtro = "todos" | "admin" | "cliente";

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<UsuarioForm>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [borrando, setBorrando] = useState<number | null>(null);

  const [aviso, setAviso] = useState<{ tipo: "ok" | "err"; texto: string } | null>(
    null
  );

  const cargarDatos = (f: Filtro = filtro) => {
    const params =
      f === "admin"
        ? "?esAdmin=true"
        : f === "cliente"
        ? "?esAdmin=false"
        : "";
    fetch(`http://localhost:8080/api/usuarios${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setUsuarios)
      .catch(() => setUsuarios([]));
  };

  useEffect(() => {
    cargarDatos(filtro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  const usuariosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return usuarios;
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        (u.apellidos || "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [usuarios, busqueda]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setErrorForm("");
    setDrawerAbierto(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setForm({
      nombre: u.nombre || "",
      apellidos: u.apellidos || "",
      email: u.email,
      telefono: u.telefono || "",
      password: "",
      esAdmin: u.esAdmin,
    });
    setErrorForm("");
    setDrawerAbierto(true);
  };

  const cerrarDrawer = () => {
    if (guardando) return;
    setDrawerAbierto(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm("");

    if (!form.nombre || !form.email) {
      setErrorForm("Nombre y email son obligatorios.");
      return;
    }
    if (!editando && form.password.length < 6) {
      setErrorForm("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (editando && form.password && form.password.length < 6) {
      setErrorForm("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setGuardando(true);
    try {
      if (editando) {
        const token = localStorage.getItem("token");
        const payload: Record<string, unknown> = {
          nombre: form.nombre,
          apellidos: form.apellidos,
          email: form.email,
          telefono: form.telefono,
          esAdmin: form.esAdmin,
        };
        if (form.password) {
          payload.password = form.password;
        }
        const res = await fetch(
          `http://localhost:8080/api/usuarios/update/${editando.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) {
          const txt = await res.text();
          setErrorForm(txt || "No se pudo actualizar el cliente.");
          return;
        }
        setAviso({ tipo: "ok", texto: "Cliente actualizado." });
      } else {
        const res = await fetch(
          "http://localhost:8080/api/usuarios/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }
        );
        if (!res.ok) {
          const txt = await res.text();
          setErrorForm(txt || "No se pudo registrar al cliente.");
          return;
        }
        setAviso({ tipo: "ok", texto: "Cliente añadido." });
      }
      setDrawerAbierto(false);
      cargarDatos();
    } catch {
      setErrorForm("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (id: number) => {
    const token = localStorage.getItem("token");
    setBorrando(id);
    try {
      const res = await fetch(
        `http://localhost:8080/api/usuarios/delete/${id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      if (!res.ok) {
        setAviso({ tipo: "err", texto: "No se pudo eliminar el cliente." });
        return;
      }
      setAviso({ tipo: "ok", texto: "Cliente eliminado." });
      setConfirmId(null);
      cargarDatos();
    } catch {
      setAviso({ tipo: "err", texto: "Sin conexión con el servidor." });
    } finally {
      setBorrando(null);
    }
  };

  return (
    <AdminShell>
      <main className="max-w-[1380px] mx-auto px-6 lg:px-10 pt-12 lg:pt-16 pb-24">
        <header className="border-b border-line pb-8 mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <p className="kicker">§ 02 · Clientela</p>
            <p className="kicker hidden md:block">
              {usuariosFiltrados.length.toString().padStart(2, "0")} registros
            </p>
          </div>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h1 className="h-display text-5xl md:text-6xl lg:text-7xl">
              Quién está
              <br />
              <em className="italic-rust">al otro lado.</em>
            </h1>
            <button onClick={abrirNuevo} className="btn-ink shrink-0">
              + Nuevo cliente
            </button>
          </div>
        </header>

        {/* Filtros */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10 items-end">
          <div className="md:col-span-7">
            <p className="kicker mb-3">Mostrar</p>
            <div className="flex gap-7 border-b border-line-soft pb-0">
              <button
                onClick={() => setFiltro("todos")}
                className={`tab ${filtro === "todos" ? "is-active" : ""}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltro("admin")}
                className={`tab ${filtro === "admin" ? "is-active" : ""}`}
              >
                Administradores
              </button>
              <button
                onClick={() => setFiltro("cliente")}
                className={`tab ${filtro === "cliente" ? "is-active" : ""}`}
              >
                Clientes
              </button>
            </div>
          </div>
          <div className="md:col-span-5">
            <label htmlFor="busqueda-clientes" className="kicker block mb-2">
              Buscar por nombre o email
            </label>
            <input
              id="busqueda-clientes"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="ej. Juan, garcia@…"
              className="field"
            />
          </div>
        </section>

        {aviso && (
          <div
            className={`mb-8 px-4 py-3 border-l-2 text-sm animate-fadeup ${
              aviso.tipo === "ok"
                ? "border-ink bg-bone-soft text-ink"
                : "border-rust bg-bone-soft text-rust"
            }`}
          >
            {aviso.texto}
          </div>
        )}

        {usuariosFiltrados.length === 0 ? (
          <div className="py-32 text-center border-t border-b border-line">
            <p className="h-mid italic-soft text-3xl md:text-4xl text-ink-muted">
              Nadie por aquí
            </p>
            <p className="kicker mt-3">
              {busqueda
                ? "Prueba con otra búsqueda"
                : "Empieza registrando un cliente"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th className="w-[60px]">#</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th className="w-[140px]">Teléfono</th>
                  <th className="w-[120px]">Rol</th>
                  <th className="w-[200px] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => {
                  const esConfirmacion = confirmId === u.id;
                  return (
                    <tr key={u.id}>
                      <td className="font-mono text-ink-muted">
                        {u.id.toString().padStart(3, "0")}
                      </td>
                      <td>
                        <p className="h-title text-[1.15rem]">
                          {u.nombre} {u.apellidos || ""}
                        </p>
                      </td>
                      <td className="font-mono text-[0.85rem] text-ink-soft">
                        {u.email}
                      </td>
                      <td className="font-mono text-[0.85rem] text-ink-soft">
                        {u.telefono || "—"}
                      </td>
                      <td>
                        <span className={`badge ${u.esAdmin ? "admin" : ""}`}>
                          {u.esAdmin ? "Admin" : "Cliente"}
                        </span>
                      </td>
                      <td className="text-right">
                        {esConfirmacion ? (
                          <span className="inline-flex items-center gap-4">
                            <span className="kicker !text-rust">
                              ¿Eliminar?
                            </span>
                            <button
                              onClick={() => borrar(u.id)}
                              disabled={borrando === u.id}
                              className="row-action danger"
                            >
                              {borrando === u.id ? "…" : "Sí"}
                            </button>
                            <span className="text-ink-muted">·</span>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="row-action"
                            >
                              No
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-5">
                            <button
                              onClick={() => abrirEditar(u)}
                              className="row-action"
                            >
                              Editar
                            </button>
                            <span className="text-line">·</span>
                            <button
                              onClick={() => setConfirmId(u.id)}
                              className="row-action danger"
                            >
                              Eliminar
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <SlideOver
        open={drawerAbierto}
        onClose={cerrarDrawer}
        kicker={
          editando
            ? `§ Cliente #${editando.id.toString().padStart(3, "0")}`
            : "§ Nuevo registro"
        }
        title={editando ? "Editar cliente" : "Registrar cliente"}
      >
        <form onSubmit={guardar} className="space-y-1">
          <p className="text-bone/70 leading-relaxed mb-8">
            {editando
              ? "Modifica los datos del cliente. La contraseña solo se actualiza si la rellenas."
              : "Da de alta a un cliente nuevo. Recibirá acceso al sitio con su email y contraseña."}
          </p>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="kicker !text-bone/60 block mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                required
                placeholder="Juan"
                className="field-dark"
              />
            </div>
            <div>
              <label className="kicker !text-bone/60 block mb-1">
                Apellidos
              </label>
              <input
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={onChange}
                placeholder="García"
                className="field-dark"
              />
            </div>
          </div>

          <div>
            <label className="kicker !text-bone/60 block mb-1 mt-5">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              placeholder="cliente@correo.com"
              className="field-dark"
            />
          </div>

          <div>
            <label className="kicker !text-bone/60 block mb-1 mt-5">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={onChange}
              placeholder="+34 600 000 000"
              className="field-dark"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between mt-5">
              <label className="kicker !text-bone/60">
                {editando ? "Nueva contraseña" : "Contraseña"}
              </label>
              <span className="kicker !text-bone/40">
                {editando ? "Opcional · mínimo 6" : "Mínimo 6 caracteres"}
              </span>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required={!editando}
              minLength={6}
              placeholder="••••••••"
              className="field-dark"
            />
          </div>

          <label className="flex items-center gap-3 mt-8 cursor-pointer group">
            <input
              type="checkbox"
              name="esAdmin"
              checked={form.esAdmin}
              onChange={onChange}
              className="sr-only"
            />
            <span
              className={`relative inline-block shrink-0 w-11 h-6 rounded-full transition-colors duration-300 ${
                form.esAdmin ? "bg-rust" : "bg-bone/15"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-bone shadow-sm transition-transform duration-300 ease-out ${
                  form.esAdmin ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
            <span className="kicker !text-bone group-hover:!text-bone">
              Conceder permisos de administrador
            </span>
          </label>
          <p className="text-bone/50 text-xs mt-2 leading-relaxed pl-14">
            Los administradores pueden gestionar piezas y otros clientes desde
            esta trastienda.
          </p>

          {errorForm && (
            <p
              className="mt-6 text-rust text-sm border-l-2 border-rust pl-3"
              role="alert"
            >
              {errorForm}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-10 pt-6 border-t border-bone/10">
            <button
              type="submit"
              disabled={guardando}
              className="btn-bone flex-1"
            >
              {guardando
                ? "Guardando…"
                : editando
                ? "Guardar cambios"
                : "Crear cliente"}
            </button>
            <button
              type="button"
              onClick={cerrarDrawer}
              className="btn-bone-ghost"
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </SlideOver>
    </AdminShell>
  );
}
